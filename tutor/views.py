# from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.viewsets import (
    ReadOnlyModelViewSet, ModelViewSet
)
from rest_framework.permissions import AllowAny
from .models import (
    Category, Course, Module, Lesson
)
from .serializers import (
    CategoryListSerializer, CategorySerializer, CourseRetrivalSerializer,
    CourseListSerializer, CourseSerializer,
    ModuleListSerializer, ModuleSerializer,
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
        # status=Course.PUBLISHED
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


class ModuleViewSet(ModelViewSet):

    def get_queryset(self):
        return Module.objects.filter(course__slug=self.kwargs['course_slug'])

    def get_serializer_class(self):
        if self.action == 'list':
            return ModuleListSerializer
        else:
            return ModuleSerializer

    def perform_create(self, serializer):
        course = Course.objects.get(slug=self.kwargs['course_slug'])
        serializer.save(course=course)


class LessonViewSet(ModelViewSet):

    serializer_class = LessonSerializer

    def get_queryset(self):
        print(self.kwargs['module_pk'])
        return Lesson.objects.filter(module__id=self.kwargs['module_pk'])

    def perform_create(self, serializer):
        module = Module.objects.get(id=self.kwargs['module_pk'])
        serializer.save(module=module)
