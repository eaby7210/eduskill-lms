from rest_framework import serializers
import tempfile
import os
import boto3
from django.conf import settings
from django.apps import apps
from .models import (
    Teacher, Category, Course,
    Resource, Module, Lesson,
    TextContent, VideoContent, TSFile
)

import logging
# import json

logger = logging.getLogger(__name__)


class TextContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextContent
        fields = ['id', 'content']


class TSFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = TSFile
        fields = ['id', 'ts_file']


class VideoContentSerializer(serializers.ModelSerializer):
    hls = serializers.SerializerMethodField()

    class Meta:
        model = VideoContent
        fields = ['id', 'video_file', 'thumbnail', 'hls']

    def get_hls(self, obj):
        if obj.hls:
            try:
                hls_str = obj.hls
                temp_dir = tempfile.mkdtemp()
                local_hls_path = os.path.join(
                    temp_dir,
                    os.path.join(*hls_str.split('/')[-3:])
                )
                os.makedirs(os.path.dirname(local_hls_path), exist_ok=True)
                key = '/'.join(hls_str.split('/')[-3:])
                s3 = boto3.client('s3')
                s3.download_file(
                    settings.AWS_STORAGE_BUCKET_NAME,
                    key,
                    local_hls_path
                )

                # Retrieve all TS files associated with the object
                ts_files = obj.ts_files.all()
                ts_file_map = {ts_file.ts_file.name.split(
                    '/')[-1]: ts_file.ts_file.url for ts_file in ts_files}
                logger.debug(ts_file_map)
                with open(local_hls_path, 'r') as m3u8_file:
                    lines = m3u8_file.readlines()
                # logger.debug(lines)
                with open(local_hls_path, 'w') as m3u8_file:
                    for line in lines:
                        if line.endswith('.ts\n'):
                            logger.info("line")
                            logger.info(line)
                            ts_file = line.strip()
                            key = f'hls/{obj.id}/{ts_file}'
                            line = ts_file_map.get(ts_file, ts_file)
                            logger.info(line)
                            m3u8_file.write(line + '\n')
                        else:
                            m3u8_file.write(line)
                # logger.debug(lines)
                with open(local_hls_path, 'r') as m3u8_file:
                    hls_content = m3u8_file.read()

                logger.debug(hls_content)
                return hls_content
            except Exception as e:
                print(e)
                return None
        return None


class LessonSerializer(serializers.ModelSerializer):

    text_content = TextContentSerializer(required=False)
    video_content = VideoContentSerializer(required=False)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'lesson_type',
                  'duration', 'order', 'module',
                  'is_active', 'created_at',
                  'updated_at', 'resources', 'is_free',
                  'text_content', 'video_content'
                  ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'module']

    def update(self, instance, validated_data):
        text_content_data = validated_data.pop('text_content', None)
        video_content_data = validated_data.pop('video_content', None)

        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle content update
        self._handle_content_creation(
            instance, text_content_data, video_content_data
        )

        return instance

    def _handle_content_creation(
        self, lesson, text_content_data=None, video_content_data=None
    ):
        """
        Helper function to create or update content depending on lesson type.
        """
        if lesson.lesson_type == 'text' and text_content_data:
            TextContent.objects.update_or_create(
                lesson=lesson, defaults=text_content_data
            )
        elif lesson.lesson_type == 'video' and video_content_data:
            VideoContent.objects.update_or_create(
                lesson=lesson, defaults=video_content_data
            )


class TeacherSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teacher
        fields = [
            'id',  'bio', 'qualifications',
            'is_active', 'is_verified', 'created_at',
            'updated_at'
        ]
        read_only_fields = ('id', 'is_active', 'is_verified',
                            'created_at', 'updated_at', 'user')

    def validate_user(self, value):
        # Ensure that a user can only create a Teacher profile
        # if not already assigned as a teacher
        if Teacher.objects.filter(user=value).exists():
            raise serializers.ValidationError(
                "This user already has a teacher profile.")
        return value


class TeacherUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teacher
        fields = [
            'id', 'bio', 'qualifications'
        ]


class CategoryOpenListSerializer(serializers.ModelSerializer):

    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug',
            'subcategories'
        ]

    def get_subcategories(self, obj):
        if obj.subcategories.exists():
            return CategoryOpenListSerializer(
                obj.subcategories.filter(is_active=True), many=True
            ).data
        return []


class CategoryListSerializer(serializers.ModelSerializer):

    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug',
            'subcategories', 'is_active'
        ]

    def get_subcategories(self, obj):
        if obj.subcategories.exists():
            return CategoryListSerializer(
                obj.subcategories.all(), many=True
            ).data
        return []


class CategorySerializer(serializers.ModelSerializer):

    # subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'is_active',
            'parent',
            # 'subcategories'
        ]


class CourseListSerializer(serializers.ModelSerializer):

    teacher_name = serializers.SerializerMethodField()
    affected_price = serializers.SerializerMethodField()
    total_reviews = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'is_active',
            'price', 'discount_percent', 'duration',
            'course_thumbnail', 'category', 'status',
            'teacher_name', 'affected_price',
            'total_reviews', 'average_rating'
        ]

    def get_affected_price(self, obj):
        if obj.discount_percent:
            discount_amount = (obj.price * obj.discount_percent) / 100
            return round(obj.price - discount_amount, 2)
        return obj.price

    def get_teacher_name(self, obj):
        return f'{obj.teacher.user.first_name} {obj.teacher.user.last_name}'


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'teacher', 'title', 'slug',
                  'description', 'category', 'syllabus',
                  'duration', 'price', 'discount_percent',
                  #   'enrollment_limit',
                  'course_thumbnail', 'status',
                  'is_active', 'published_at', 'last_updated',
                  'requirements', 'learning_objectives',
                  'target_audience', 'completion_certificate',
                  'created_at', 'updated_at', 'popularity_score'
        ]
        read_only_fields = [
            'id', 'slug', 'is_published',
            'published_at', 'last_updated', 'created_at',
            'updated_at', 'popularity_score'
        ]


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description',
            'resource_type', 'file', 'link',
            'course', 'created_at',
            'updated_at', 'is_active'
        ]


class LessonListSeraiLizer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'lesson_type',
                  'duration', 'order', 'is_active', 'module'
        ]


class ModuleListSerializer(serializers.ModelSerializer):
    lessons = LessonListSeraiLizer(many=True)

    class Meta:
        model = Module
        fields = [
            'id', 'title', 'description',
            'order', 'duration', 'is_active', 'lessons',
        ]


class ModuleAllListSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True)

    class Meta:
        model = Module
        fields = [
            'id', 'title', 'description',
            'order', 'duration', 'is_active', 'lessons',
        ]


class CourseRetrivalSerializer(serializers.ModelSerializer):
    modules = ModuleListSerializer(many=True)
    teacher_name = serializers.SerializerMethodField()
    affected_price = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    total_reviews = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'status',
                  'description', 'category', 'syllabus',
                  'duration', 'price', 'discount_percent',
            'teacher_name', 'affected_price',
                  'course_thumbnail',
                  'is_active', 'published_at', 'last_updated',
                  'requirements', 'learning_objectives',
                  'target_audience', 'completion_certificate',
                  'created_at', 'updated_at', 'popularity_score', 'modules',
                  'total_reviews', 'average_rating'
        ]
        read_only_fields = [
            'id', 'slug', 'is_published',
            'published_at', 'last_updated', 'created_at',
            'updated_at', 'popularity_score',
            'total_reviews', 'average_rating'
        ]

    def get_affected_price(self, obj):
        if obj.discount_percent:
            discount_amount = (obj.price * obj.discount_percent) / 100
            return round(obj.price - discount_amount, 2)
        return obj.price

    def get_teacher_name(self, obj):
        return f'{obj.teacher.user.first_name} {obj.teacher.user.last_name}'

    def get_category(self, obj):
        return {obj.category.name}


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'title', 'description',
                  'order', 'duration', 'is_active',
                  'created_at', 'updated_at']


class TeacherChatRoomSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.IntegerField(source='enrollment.student.id')
    course_title = serializers.CharField(source='enrollment.course.title')
    course_id = serializers.IntegerField(source='enrollment.course.id')
    unread_count = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()

    class Meta:
        model = apps.get_model('students', 'ChatRoom')
        fields = [
            'id', 'student_name', 'student_id', 'course_title', 'course_id',
            'unread_count',  'last_activity', 'created_at'
        ]

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()

    def get_last_activity(self, obj):
        last_msg = obj.messages.last()
        return last_msg.timestamp if last_msg else obj.created_at

    def get_student_name(self, obj):
        user = obj.enrollment.student.user
        return f'{user.first_name} {user.last_name}'
