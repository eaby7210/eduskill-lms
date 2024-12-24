# from django.shortcuts import render
import os
from django.http import HttpResponse
from django.apps import apps
from django.db.models import Count, Avg
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import (
    ModelViewSet, ReadOnlyModelViewSet
)
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import (
    Course, Module,
    Lesson, TextContent, VideoContent
)
from .serializers import (
    CourseListSerializer, CourseSerializer,
    ModuleAllListSerializer, ModuleSerializer,
    LessonSerializer, TeacherSerializer,
    TeacherChatRoomSerializer
)
from .permissions import IsTeacher
from students.serializers import ChatMessageSerializer
User = get_user_model()

# Create your views here.


class TeacherView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TeacherSerializer(data=request.data)

        if serializer.is_valid():
            user = User.objects.get(id=request.user.id)
            user.role = "TUTR"
            user.save()
            serializer.save(user=user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response({"errors": serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST)


class CourseViewSet(ModelViewSet):

    lookup_field = 'slug'
    permission_classes = [IsTeacher]

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
        methods=['post'], permission_classes=[IsTeacher]
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
        methods=['post'], permission_classes=[IsTeacher]
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
            Notification = apps.get_model('core', 'Notification')
            Notification.objects.create(
                sender=request.user,
                receiver=User.objects.get(is_superuser=True),
                message=f"Your course '{
                    course.title
                }' has been blocked.Please review the course details,\
                    And Submit again",
                user_role="ADMIN"
            )

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
    permission_classes = [IsTeacher]

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
        methods=['post'], permission_classes=[IsTeacher]
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
    permission_classes = [IsTeacher]

    serializer_class = LessonSerializer

    def get_queryset(self):
        return Lesson.objects.filter(module__id=self.kwargs['module_pk'])

    def create(self, request, *args, **kwargs):
        """
        Handle creation of a Lesson and associated content
        (TextContent/VideoContent)
        """
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
        methods=['post'], permission_classes=[IsTeacher]
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

    @action(
        detail=True,
        methods=['get'], permission_classes=[IsTeacher]
    )
    def get_hls(self, request, slug=None, *args, **kwargs):
        lesson = self.get_object()
        lesson_id = lesson.id

        if not lesson_id:
            return Response(
                {'error': 'Lesson ID not provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            video_content = VideoContent.objects.get(lesson_id=lesson_id)

            if video_content.status != "Completed":
                return Response(
                    {'error': 'Video is not processed yet.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Construct the path to the m3u8 file
            output_directory = os.path.join(
                os.path.dirname(video_content.video_file.path), 'hls_output')
            output_hls_path = os.path.join(
                output_directory, os.path.basename(video_content.hls))

            # Read the contents of the m3u8 file
            with open(output_hls_path, 'r') as file:
                m3u8_content = file.read()

            dynamic_path = request.build_absolute_uri(
                '/media/lessons/videos/hls_output/')
            m3u8_content = m3u8_content.replace(
                "{{ dynamic_path }}", dynamic_path)

            return HttpResponse(
                m3u8_content, content_type='application/vnd.apple.mpegurl'
            )
        except VideoContent.DoesNotExist:
            return Response(
                {'error': 'Video content not found for this lesson.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherChatViewSet(ReadOnlyModelViewSet):

    """
    ViewSet for teachers to manage their course chats.
    Provides course-centric view of all student chats.
    """
    permission_classes = [IsTeacher]
    serializer_class = TeacherChatRoomSerializer

    def get_queryset(self):
        ChatRoom = apps.get_model('students', 'ChatRoom')
        user = self.request.user
        if not hasattr(user, 'teacher'):
            return ChatRoom.objects.none()

        # Get the course ID from query params if provided
        course_id = self.request.query_params.get('course_slug')
        queryset = ChatRoom.objects.filter(
            enrollment__course__teacher=user.teacher)

        if course_id:
            queryset = queryset.filter(enrollment__course__slug=course_id)

        return queryset.select_related(
            'enrollment__student__user',
            'enrollment__course'
        ).prefetch_related('messages')

    @action(detail=True, methods=['get'], permission_classes=[IsTeacher])
    def messages(self, request, pk=None):
        room = self.get_object()
        ChatMessage = apps.get_model('students', 'ChatMessage')
        messages = ChatMessage.objects.filter(room=room)

        # Mark messages as read when teacher views them
        unread_messages = messages.filter(
            is_read=False).exclude(sender=request.user)
        unread_messages.update(is_read=True)

        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsTeacher])
    def mark_read(self, request, pk=None):
        """Mark all messages in a chat room as read"""
        room = self.get_object()
        ChatMessage = apps.get_model('students', 'ChatMessage')
        ChatMessage.objects.filter(
            room=room,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)

        return Response({'status': 'messages marked as read'})


class TutorDashboardAPIView(APIView):
    # permission_classes = [IsTeacher]

    def get(self, request, format=None):
        # Ensure the user is a tutor
        if not hasattr(request.user, 'teacher'):
            return Response({'error': 'User is not a tutor'}, status=403)

        tutor = request.user.teacher

        # Courses
        courses = Course.objects.filter(teacher=tutor)
        total_courses_count = courses.count()
        courses_by_status = courses.values(
            'status').annotate(count=Count('status'))

        Enrolment = apps.get_model('students', 'Enrolment')
        Review = apps.get_model('students', 'Review')
        # Enrollments
        enrollments = Enrolment.objects.filter(course__teacher=tutor)
        total_enrollments_count = enrollments.count()
        enrollments_by_status = enrollments.values(
            'status').annotate(count=Count('status'))

        # Reviews
        reviews = Review.objects.filter(course__teacher=tutor)
        average_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0
        recent_reviews = reviews.order_by('-created_at')[:5]

        data = {
            'courses': {
                'total_count': total_courses_count,
                'by_status': courses_by_status,
            },
            'enrollments': {
                'total_count': total_enrollments_count,
                'by_status': enrollments_by_status,
            },
            'reviews': {
                'average_rating': average_rating,
                'recent_reviews': [
                    {'course': review.course.title,
                        'rating': review.rating, 'comment': review.comment}
                    for review in recent_reviews
                ],
            }
        }

        return Response(data, content_type="appllication/json")
