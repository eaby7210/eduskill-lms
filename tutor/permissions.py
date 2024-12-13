from rest_framework import permissions


class IsTeacher(permissions.BasePermission):

    def has_permission(self, request, view):
        """
        Return `True` if permission is granted, `False` otherwise.
        """
        return request.user.is_authenticated\
            and\
            hasattr(request.user, "teacher")
