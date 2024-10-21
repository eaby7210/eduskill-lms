from rest_framework import serializers
from .models import (
    Teacher, Category, Course,
    Resource, Module, Lesson,
    TextContent, VideoContent, Review
)


class TeacherSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'bio', 'qualifications',
            'is_active', 'is_verified', 'created_at',
            'updated_at'
        ]


class TeacherUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teacher
        fields = [
            'id', 'bio', 'qualifications'
        ]


class CategoryListSerializer(serializers.ModelSerializer):

    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug',
            'subcategories'
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

    teacher_name = serializers.CharField(
        source='teacher.user.username',
        read_only=True
    )
    affected_price = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description',
            'price', 'discount_percent', 'duration',
            'course_thumbnail', 'category', 'status',
            'teacher_name', 'affected_price'
        ]

    def get_affected_price(self, obj):
        if obj.discount_percent:
            discount_amount = (obj.price * obj.discount_percent) / 100
            return round(obj.price - discount_amount, 2)
        return obj.price


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'teacher', 'title', 'slug',
                  'description', 'category', 'syllabus',
                  'duration', 'price', 'discount_percent',
                  #   'enrollment_limit',
                  'course_thumbnail',
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
                  'duration', 'order',
        ]


class ModuleListSerializer(serializers.ModelSerializer):
    lessons = LessonListSeraiLizer(many=True)

    class Meta:
        model = Module
        fields = [
            'id', 'title',
            'order', 'duration', 'is_active', 'lessons'
        ]


class CourseRetrivalSerializer(serializers.ModelSerializer):
    modules = ModuleListSerializer(many=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug',
                  'description', 'category', 'syllabus',
                  'duration', 'price', 'discount_percent',
                  #   'enrollment_limit',
                  'course_thumbnail',
                  'is_active', 'published_at', 'last_updated',
                  'requirements', 'learning_objectives',
                  'target_audience', 'completion_certificate',
                  'created_at', 'updated_at', 'popularity_score', 'modules'
        ]
        read_only_fields = [
            'id', 'slug', 'is_published',
            'published_at', 'last_updated', 'created_at',
            'updated_at', 'popularity_score'
        ]


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description',
                  'order', 'duration', 'is_active',
                  'created_at', 'updated_at']


class TextContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextContent
        fields = ['id', 'content']


class VideoContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoContent
        fields = ['id', 'video_file']


class LessonSerializer(serializers.ModelSerializer):

    text_content = TextContentSerializer(required=False)
    video_content = VideoContentSerializer(required=False)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'lesson_type',
                  'duration', 'order', 'module',
                  'is_published', 'created_at',
                  'updated_at', 'resources', 'is_free',
                  'text_content', 'video_content'
                  ]

    def validate(self, data):
        """
        Validates that a lesson can only have one type of content,
        and that the necessary content is provided.
        """
        lesson_type = data.get('lesson_type')
        text_content = data.get('text_content')
        video_content = data.get('video_content')
        print([text_content, video_content])
        if lesson_type == 'text' and not text_content['content']:
            raise serializers.ValidationError(
                {
                    "text_content":
                        "Text content is required for text lessons."
                }
            )
        if lesson_type == 'video' and not video_content['video_file']:
            raise serializers.ValidationError(
                {
                    "video_content":
                        "Video content is required for video lessons."
                }
            )
        if text_content['content'] and video_content['video_file']:
            print([text_content, video_content])
            raise serializers.ValidationError(
                "A lesson cannot have both text and video content."
            )
        return data

    def create(self, validated_data):
        text_content_data = validated_data.pop('text_content', None)
        video_content_data = validated_data.pop('video_content', None)

        # Create the lesson instance
        lesson = Lesson.objects.create(**validated_data)

        # Handle content creation
        self._handle_content_creation(
            lesson, text_content_data, video_content_data
        )

        return lesson

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


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'course', 'user', 'rating',
                  'comment', 'review_date', 'updated_at',
                  'helpful_count', 'flagged', 'anonymous'
                  ]
