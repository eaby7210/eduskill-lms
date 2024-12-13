from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.mixins import DestroyModelMixin
from .serializers import UserUpdateSerializer, NotificationSerializer
from .models import Notification
from tutor.serializers import TeacherUpdateSerializer
from students.serializers import StudentUpdateSerializer
# from django.contrib.auth import get_user_model
# User = get_user_model()


class GoogleAuth(SocialLoginView):

    adapter_class = GoogleOAuth2Adapter
    callback_url = ""
    client_class = OAuth2Client


class UserUpdateView(APIView):

    # def get_queryset(self):
    #     return User.objects.prefetch_related('teacher').\
    # prefetch_related('student').get(id=self.request.user.id)

    def put(self, request):
        user = request.user
        user_data = {key: value for key, value in {
            'first_name': request.data.get('first_name'),
            'last_name': request.data.get('last_name'),
            'email': request.data.get('email'),
            'username': request.data.get('username'),
            'image': request.data.get('image'),
        }.items() if value is not None}

        user_serializer = UserUpdateSerializer(
            instance=user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        else:
            return Response(
                user_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)
        if hasattr(user, 'teacher'):  # Check if the user has a teacher profile
            teacher_data = {key: value for key, value in {
                'bio': request.data.get('bio'),
                'qualifications': request.data.get('qualifications')
            }.items() if value is not None}

            teacher = user.teacher
            teacher_serializer = TeacherUpdateSerializer(
                instance=teacher, data=teacher_data, partial=True)
            if teacher_serializer.is_valid():
                teacher_serializer.save()
                role_data = teacher_serializer.data
            else:
                return Response(
                    teacher_serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST)

        elif hasattr(user, 'student'):
            student_data = {key: value for key, value in {
                'bio': request.data.get('bio'),
            }.items() if value is not None}
            student = user.student
            student_serializer = StudentUpdateSerializer(
                instance=student, data=student_data, partial=True)
            if student_serializer.is_valid():
                student_serializer.save()
                role_data = student_serializer.data
            else:
                return Response(
                    student_serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'user': user_serializer.data,
            'role_data': role_data
        }, status=status.HTTP_200_OK)


class NotificationPagination(PageNumberPagination):
    """
    Custom pagination class for notifications.
    """
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(DestroyModelMixin,  GenericViewSet):
    """
    ViewSet for Notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination

    def get_queryset(self):
        """
        Filters notifications for the currently
        authenticated user.
        """
        user = self.request.user
        return Notification.objects.filter(
            receiver=user
        ).order_by('-timestamp')

    def list(self, request, *args, **kwargs):
        """
        Override the list method to add
        total notification count to the response.
        """
        queryset = self.get_queryset()
        total_notifications = queryset.count()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "total_count": total_notifications,
                "notifications": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "total_count": total_notifications,
            "notifications": serializer.data
        })

    @action(
        detail=True, methods=["post"],
        permission_classes=[IsAuthenticated]
    )
    def mark_as_read(self, request, pk=None):
        """
        Custom action to mark a single notification as read.
        """
        try:
            notification = self.get_object()
            notification.is_read = True
            notification.save()
            return Response(
                {"detail": "Notification marked as read."},
                status=status.HTTP_200_OK
            )
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(
        detail=False, methods=["post"],
        permission_classes=[IsAuthenticated]
    )
    def clear_all(self, request):
        """
        Custom action to delete all notifications for the current user.
        """
        notifications = self.get_queryset()
        count = notifications.count()
        notifications.delete()
        return Response(
            {"detail": f"All {count} notifications cleared."},
            status=status.HTTP_200_OK
        )
