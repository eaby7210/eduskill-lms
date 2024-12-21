from dj_rest_auth.serializers import (
    UserDetailsSerializer, PasswordChangeSerializer
)
from dj_rest_auth.registration.serializers import RegisterSerializer
from tutor.serializers import TeacherSerializer
from students.serializers import StudentSerializer
from allauth.account.models import EmailAddress
from django.apps import apps
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification
User = get_user_model()


class UserSerializer(UserDetailsSerializer):
    teacher_profile = serializers.SerializerMethodField()
    student_profile = serializers.SerializerMethodField()
    email_verified = serializers.SerializerMethodField()

    class Meta(UserDetailsSerializer.Meta):
        model = User
        fields = UserDetailsSerializer.Meta.fields + (
            'role', 'image', 'is_active', 'is_superuser',
            'teacher_profile', 'student_profile', 'email_verified'
        )
        read_only_fields = UserDetailsSerializer.Meta.read_only_fields + (
            'is_active', 'is_superuser', 'role'
        )

    def get_teacher_profile(self, obj):
        """Dynamically loads the TeacherSerializer from the tutor app"""
        Teacher = apps.get_model('tutor', 'Teacher')
        try:
            teacher = Teacher.objects.get(user=obj)
            return TeacherSerializer(teacher).data
        except Teacher.DoesNotExist:
            return None

    def get_student_profile(self, obj):
        """Dynamically loads the StudentSerializer from the student app"""
        Student = apps.get_model('students', 'Student')
        try:
            student = Student.objects.get(user=obj)
            return StudentSerializer(student).data
        except Student.DoesNotExist:
            return None

    def get_email_verified(self, obj):
        """Checks if the user's email is verified"""
        try:
            email_address = EmailAddress.objects.get(user=obj, primary=True)
            return email_address.verified
        except EmailAddress.DoesNotExist:
            return False


class UserRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    # role = serializers.ChoiceField(choices=User.Role.choices)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        # data['role'] = self.validated_data.get('role', User.Role.STUDENT)
        return data

    def custom_signup(self, request, user):
        user.first_name = self.cleaned_data.get('first_name')
        user.last_name = self.cleaned_data.get('last_name')
        # user.role = self.cleaned_data.get('role')
        user.save()


class UserUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'image']


class UserListSerializer(serializers.ModelSerializer):
    # teacher_profile = serializers.SerializerMethodField()
    # student_profile = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'name', 'username', 'email', 'role', 'is_active',
            # 'teacher_profile', 'student_profile'
        ]

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    # def get_teacher_profile(self, obj):
    #     """Dynamically loads the TeacherSerializer from the tutor app"""
    #     Teacher = apps.get_model('tutor', 'Teacher')
    #     try:
    #         teacher = Teacher.objects.get(user=obj)
    #         return TeacherSerializer(teacher).data
    #     except Teacher.DoesNotExist:
    #         return None


class CustomPasswordChangeSeralizer(PasswordChangeSerializer):
    current_password = serializers.CharField(required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'sender',
            'receiver',
            'message',
            'timestamp',
            'is_read',
            'user_role',
        ]
