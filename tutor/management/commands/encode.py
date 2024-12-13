import subprocess
import os
import json
from django.db import transaction
from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
import boto3
import shutil
from botocore.exceptions import NoCredentialsError
import tempfile
from tutor.models import VideoContent, TSFile


class Command(BaseCommand):
    help = 'Optimize Video'

    def download_from_s3(self, s3_file_name, local_path):
        s3 = boto3.client('s3')
        try:
            s3.download_file(settings.AWS_STORAGE_BUCKET_NAME,
                             s3_file_name, local_path)
            print(f"Download Successful: {s3_file_name}")
            return True
        except FileNotFoundError:
            print("The file was not found")
            return False
        except NoCredentialsError:
            print("Credentials not available")
            return False

    def delete_local_file(self, file_path):
        """Delete a local file if it exists."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Deleted local file: {file_path}")
            else:
                print(f"File not found: {file_path}")
        except OSError as e:
            print(f"Error deleting file {file_path}: {e}")

    def upload_to_s3(self, file_path, bucket_name, s3_file_name):
        s3 = boto3.client('s3')
        try:
            s3.upload_file(file_path, bucket_name, s3_file_name)
            print(f"Upload Successful: {s3_file_name}")
            return f'https://{bucket_name}.s3.amazonaws.com/{s3_file_name}'
        except FileNotFoundError:
            print("The file was not found")
            return None
        except NoCredentialsError:
            print("Credentials not available")
            return None

    def video_encode(self, obj: VideoContent):
        obj.status = 'processing'
        obj.save()
        # input_video_path = obj.video_file.url

        temp_dir = tempfile.mkdtemp()
        local_video_path = os.path.join(
            temp_dir, obj.get_basename()
        )

        if not self.download_from_s3(
            ('media/'+obj.video_file.name),
            local_video_path
        ):
            print("Failed to download video file")
            return

        output_directory = os.path.join(temp_dir, f'hls_output_{obj.id}')
        os.makedirs(output_directory, exist_ok=True)

        output_hls_path = os.path.join(output_directory, os.path.splitext(
            obj.get_basename())[0] + '_hls.m3u8')

        output_thumbnail_path = os.path.join(
            output_directory,
            os.path.splitext(
                os.path.basename(local_video_path)
            )[0] + '_thumbnail.jpg')

        try:
            # Check video properties using ffprobe
            command = [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_streams",
                local_video_path
            ]
            result = subprocess.run(
                command, shell=False, check=True, stdout=subprocess.PIPE)
            output_json = json.loads(result.stdout)

            video_length = None
            for stream in output_json['streams']:
                if stream['codec_type'] == 'video':
                    video_length = float(stream['duration'])
                    break

            if video_length is not None:
                obj.duration = video_length

            # Generate HLS segments using ffmpeg
            cmd = [
                'ffmpeg',
                '-i', local_video_path,
                '-c:v', 'h264',
                '-c:a', 'aac',
                '-hls_time', '5',
                '-hls_list_size', '0',
                "-movflags", "+faststart",
                '-y',
                output_hls_path
            ]
            subprocess.run(cmd, shell=False, check=True)

            # Generate thumbnail using ffmpeg
            ffmpeg_cmd = [
                'ffmpeg',
                '-i', local_video_path,
                '-ss', '2',
                '-frames:v', '1',
                '-q:v', '2',
                '-y',
                output_thumbnail_path
            ]
            subprocess.run(ffmpeg_cmd, shell=False, check=True)

            with open(output_hls_path, 'r') as m3u8_file:
                for line in m3u8_file:
                    if line.endswith('.ts\n'):
                        ts_file = line.strip()
                        ts_file_path = os.path.join(output_directory, ts_file)
                        with open(ts_file_path, 'rb') as f:
                            ts_instance = TSFile.objects.create(
                                video_content=obj,
                                ts_file=File(f, name=ts_file)
                            )
                        if ts_instance:
                            self.delete_local_file(ts_file_path)

            # Upload processed files to S3 and update database
            hls_s3_url = self.upload_to_s3(
                output_hls_path,
                settings.AWS_STORAGE_BUCKET_NAME,
                f'hls/{obj.id}/{os.path.basename(output_hls_path)}'
            )
            if hls_s3_url:
                obj.hls = hls_s3_url
                self.delete_local_file(output_hls_path)

            # Save the thumbnail directly to the ImageField
            with open(output_thumbnail_path, 'rb') as thumb_file:
                obj.thumbnail.save(os.path.basename(
                    output_thumbnail_path), File(thumb_file), save=True)

            # Cleanup temporary directory
            shutil.rmtree(temp_dir)

            # Update the Video object
            obj.status = 'Completed'
            obj.save()
            self.delete_local_file(output_thumbnail_path)

        except Exception as e:
            raise CommandError(e)

    def handle(self, *args, **kwargs):
        try:
            with transaction.atomic():
                obj = VideoContent.objects.filter(status='pending').first()
                if obj:
                    self.video_encode(obj)
                else:
                    print('No video with status "Pending" found.')
        except Exception as e:
            raise CommandError(e)
