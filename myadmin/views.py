from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.response import Response
from rest_framework.decorators import action

from core.serializers import UserListSerializer
from tutor.serializers import (
    CourseSerializer, CourseListSerializer,
    CourseRetrivalSerializer,
    ModuleAllListSerializer
)
from django.contrib.auth import get_user_model
from django.apps import apps

User = get_user_model()


class UserViewSet(ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'],
            permission_classes=[IsAdminUser]
            )
    def toggle_activation(self, request, pk=None):

        user = self.get_object()
        user.is_active = not user.is_active  # Toggle activation
        user.save()
        status_message = 'User activated'\
            if user.is_active else\
            'User deactivated'
        return Response({'status': status_message}, status=status.HTTP_200_OK)


class CourseViewSet(ReadOnlyModelViewSet):
    Course = apps.get_model('tutor', 'Course')
    queryset = Course.objects.filter(
        status__in=['published', 'pending_approval'])
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):

        if self.action == 'retrieve':
            return CourseRetrivalSerializer
        elif self.action in ['list', 'create', 'update']:
            return CourseSerializer
        return CourseListSerializer

    def destroy(self, request, *args, **kwargs):
        """
        Handle the deletion of a course (hard delete or soft delete).
        """
        course = self.get_object()
        course.is_active = False
        course.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            "POST", detail="Course creation is not allowed.")

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed("PUT", detail="Course updating is not allowed.")

    @action(detail=True, methods=['post'],
            permission_classes=[IsAdminUser]
            )
    def publish(self, request, pk=None):
        """
        Custom action to publish a course.
        """
        course = self.get_object()
        if course.status == "pending_approval":
            course.is_active = True
            course.published_at = timezone.now()
            course.status = "published"
            course.save()
            return Response(
                {'status': 'Course published'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'Course already published or inactive'},
            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'],
            permission_classes=[IsAdminUser]
            )
    def block(self, request, pk=None):
        """
        Custom action to publish a course.
        """
        course = self.get_object()
        if course.status in ["published"]:
            course.status = "blocked"
            course.save()
            return Response(
                {'status': 'Course Blocked'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'Course already published or an invalid status'},
            status=status.HTTP_400_BAD_REQUEST)


class ModuleViewSet(ReadOnlyModelViewSet):
    serializer_class = ModuleAllListSerializer

    def get_queryset(self):
        course_id = self.kwargs["course_pk"]
        Module = apps.get_model('tutor', 'Module')
        return Module.objects.filter(course=course_id)
