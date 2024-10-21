from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserUpdateSerializer
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
            'image': request.data.get('image')
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
