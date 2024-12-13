from rest_framework import permissions


class IsEnrolledInCourse(permissions.BasePermission):
    """
    Custom permission to check if the user is enrolled in the course
    associated with the lesson they are trying to access.
    """

    def has_object_permission(self, request, view, obj):
        # Assume `obj` is a Lesson instance.
        user = request.user
        if not user.is_authenticated:
            return False
        return obj.module.course.enrolled_courses.filter(
            student=user.student
        ).exists()


class IsEnrolledInCourseObj(permissions.BasePermission):
    """
    Custom permission to check if the user is enrolled in the course
    associated with the lesson they are trying to access.
    """

    def has_object_permission(self, request, view, obj):
        # Assume `obj` is a Lesson instance.
        user = request.user
        if not user.is_authenticated:
            return False
        return obj.enrolled_courses.filter(
            student=user.student
        ).exists()
