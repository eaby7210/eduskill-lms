from celery import shared_task
from tutor.management.commands.encode import Command
from .models import VideoContent


@shared_task
def encode_video_task(video_content_id):
    command_instance = Command()  # Create an instance of the Command class
    video_content_obj = VideoContent.objects.get(id=video_content_id)
    command_instance.video_encode(video_content_obj)
