# from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.viewsets import (
    ReadOnlyModelViewSet, ModelViewSet
)

from .models import (
    Category, Course, Module, Lesson, TextContent, VideoContent
)
from .serializers import (
    CategoryListSerializer, CategorySerializer, CourseRetrivalSerializer,
    CourseListSerializer, CourseSerializer,
    ModuleAllListSerializer, ModuleSerializer,
    LessonSerializer
)


# Create your views here.


class CategoryViewSet(ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    lookup_field = 'slug'

    def get_serializer_class(self, *args, **kwargs):

        if self.action == 'list':
            return CategoryListSerializer
        else:
            return CategorySerializer
        return super().get_serializer_class()


class CourseOpenViewSet(ReadOnlyModelViewSet):
    queryset = Course.objects.select_related("teacher").filter(
        is_active=True,
        status=Course.PUBLISHED
    )
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']

    def get_serializer_class(self, *args, **kwargs):

        if self.action == 'list':
            return CourseListSerializer
        else:
            return CourseRetrivalSerializer


class CourseViewSet(ModelViewSet):

    lookup_field = 'slug'

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user.teacher)

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        else:
            return CourseSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user.teacher)

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status != "draft":
            instance.status = "draft"
            instance.save()
        serializer.save()

    @action(
        detail=True,
        methods=['post'], permission_classes=[IsAuthenticated]
    )
    def toggle_active(self, request, slug=None, *args, **kwargs):
        """
        Custom action to toggle the `is_active` status of a course.
        """
        course = self.get_object()
        course.is_active = not course.is_active
        course.save()

        return Response(
            {
                'status':
                f'Course {"activated" if course.is_active else "deactivated"}'
            },
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=['post'], permission_classes=[IsAuthenticated]
    )
    def publish(self, request, slug=None):
        """
        Custom action to publish a course by changing its status to
        'pending_approval' if it's in 'draft' status and activate it.
        """
        course = self.get_object()

        if course.status == Course.DRAFT:
            course.status = Course.PENDING_APPROVAL
            course.is_active = True  # Activate the course
            course.save()

            return Response(
                {
                    'status':
                        'Course submitted for approval and activated'
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                'error':
                    'Course cannot be published. It is not in draft status.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class ModuleViewSet(ModelViewSet):

    def get_queryset(self):
        return Module.objects.filter(course__slug=self.kwargs['course_slug'])

    def get_serializer_class(self):
        if self.action == 'list':
            return ModuleAllListSerializer
        else:
            return ModuleSerializer

    def perform_create(self, serializer):
        course = Course.objects.get(slug=self.kwargs['course_slug'])
        if course.status != "draft":
            course.status = "draft"
            course.save()
        serializer.save(course=course)

    def perform_update(self, serializer):
        serializer.save()
        instance = self.get_object()
        course_instance = instance.course
        course = Course.objects.get(id=course_instance.id)
        if course.status != "draft":
            course.status = "draft"
            course.save()

    @action(
        detail=True,
        methods=['post'], permission_classes=[IsAuthenticated]
    )
    def toggle_active(self, request,  *args, **kwargs):
        """
        Custom action to toggle the `is_active` status of a module.
        """
        module = self.get_object()
        module.is_active = not module.is_active
        module.save()

        return Response(
            {
                'status':
                f'module {"activated" if module.is_active else "deactivated"}'
            },
            status=status.HTTP_200_OK
        )


class LessonViewSet(ModelViewSet):

    serializer_class = LessonSerializer

    def get_queryset(self):
        print(self.kwargs['module_pk'])
        return Lesson.objects.filter(module__id=self.kwargs['module_pk'])

    def create(self, request, *args, **kwargs):
        """
        Handle creation of a Lesson and associated content
        (TextContent/VideoContent)
        """
        data = {key: request.data.get(key) for key in request.data.keys()}
        print(data)
        lesson_type = data.get('lesson_type')

        if lesson_type == 'text' and not data.get('content'):
            return Response(
                {"content": "Text content is required for text lessons."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if lesson_type == 'video' and not data.get('video_file'):
            return Response(
                {"video_file":
                    "Video content is required for video lessons."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if data.get('content') and data.get('video_file'):
            return Response(
                {"error": "A lesson cannot have both text and video content."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the lesson object without content initially
        module = Module.objects.get(id=self.kwargs['module_pk'])
        lesson_data = {
            'title': data.get('title'),
            'description': data.get('description'),
            'lesson_type': lesson_type,
            'duration': data.get('duration'),
            'order': data.get('order'),
            'is_active': data.get('is_active', True),
            'module': module,
            'is_free': data.get('is_free', False),
        }
        lesson = Lesson.objects.create(**lesson_data)

        # Create the associated content based on lesson type
        if lesson_type == 'text':
            TextContent.objects.create(
                lesson=lesson, content=data['content'])
        elif lesson_type == 'video':
            VideoContent.objects.create(
                lesson=lesson, video_file=data['video_file'])

        course_instance = lesson.module.course
        course = Course.objects.get(id=course_instance.id)
        if course.status != "draft":
            course.status = "draft"
            course.save()
        # Serialize and return the created lesson
        serializer = LessonSerializer(lesson)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Handle updating of a Lesson and associated content.
        """

        lesson = self.get_object()
        data = {key: request.data.get(key) for key in request.data.keys()}

        lesson_type = data.get('lesson_type')

        if lesson_type == 'text' and not data.get('content'):
            return Response(
                {"content": "Text content is required for text lessons."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if lesson_type == 'video' and not data.get('video_file'):
            return Response(
                {"video_file":
                    "Video content is required for video lessons."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if data.get('content') and data.get('video_file'):
            return Response(
                {"error": "A lesson cannot have both text and video content."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If the lesson type has changed, delete the old content
        if lesson.lesson_type != lesson_type:
            if lesson.lesson_type == 'text':
                TextContent.objects.filter(lesson=lesson).delete()

            elif lesson.lesson_type == 'video':
                VideoContent.objects.filter(lesson=lesson).delete()

        # Update lesson fields
        lesson.title = data.get('title', lesson.title)
        lesson.description = data.get('description', lesson.description)
        lesson.lesson_type = lesson_type
        lesson.duration = data.get('duration', lesson.duration)
        lesson.order = data.get('order', lesson.order)
        lesson.is_active = data.get('is_active', lesson.is_active)
        lesson.is_free = data.get('is_free', lesson.is_free)
        lesson.save()

        # Update associated content
        if lesson_type == 'text':
            TextContent.objects.update_or_create(
                lesson=lesson, defaults={
                    'content': data.get('content')}
            )
        elif lesson_type == 'video':
            VideoContent.objects.update_or_create(
                lesson=lesson, defaults={
                    'video_file': data.get('video_file')}
            )

        course_instance = lesson.module.course
        course = Course.objects.get(id=course_instance.id)
        if course.status != "draft":
            course.status = "draft"
            course.save()
        # Serialize and return the updated lesson
        serializer = LessonSerializer(lesson)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=['post'], permission_classes=[IsAuthenticated]
    )
    def toggle_active(self, request, *args, **kwargs):
        """
        Custom action to toggle the `is_active` status of a lesson.
        """
        lesson = self.get_object()
        lesson.is_active = not lesson.is_active
        lesson.save()

        return Response(
            {
                'status':
                f'lesson {"activated" if lesson.is_active else "deactivated"}'
            },
            status=status.HTTP_200_OK
        )
