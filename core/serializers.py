from dj_rest_auth.serializers import UserDetailsSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from tutor.serializers import TeacherSerializer
from students.serializers import StudentSerializer
from django.apps import apps
from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()


class UserSerializer(UserDetailsSerializer):
    teacher_profile = serializers.SerializerMethodField()
    student_profile = serializers.SerializerMethodField()

    class Meta(UserDetailsSerializer.Meta):
        model = User
        fields = UserDetailsSerializer.Meta.fields + (
            'role', 'image', 'is_active', 'is_superuser',
            'teacher_profile', 'student_profile',
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


class UserRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        data['role'] = self.validated_data.get('role', User.Role.STUDENT)
        return data

    def custom_signup(self, request, user):
        # print(request.data)
        user.first_name = self.cleaned_data.get('first_name')
        user.last_name = self.cleaned_data.get('last_name')
        user.role = self.cleaned_data.get('role')
        # print(user.first_name)
        # print(user.last_name)
        user.save()


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
