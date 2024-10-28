from django.contrib import admin
from ordered_model.admin import OrderedModelAdmin, OrderedTabularInline
from .models import (
    Teacher, Category, Course,
    Resource, Module, Lesson,
    TextContent, VideoContent, Review
)


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'is_active', 'is_verified',
        'created_at', 'updated_at'
    )
    list_filter = ('is_active', 'is_verified')
    search_fields = ('user__username', 'user__email', 'bio', 'qualifications')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Category)
class CategoryAdmin(OrderedModelAdmin):
    list_display = (
        'name', 'slug', 'parent', 'is_active',
        'order', 'move_up_down_links'
    )
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    ordering = ('order', 'name')


class ModuleInline(OrderedTabularInline):
    model = Module
    fields = ('title', 'order', 'move_up_down_links')
    readonly_fields = ('move_up_down_links',)


class LessonInline(OrderedTabularInline):
    model = Lesson
    fields = ('title', 'lesson_type', 'order', 'move_up_down_links')
    readonly_fields = ('move_up_down_links',)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'teacher', 'category', 'status',
        'is_active', 'price', 'created_at')
    list_filter = ('teacher', 'category', 'is_active',
                   'created_at', 'status'
                   )
    search_fields = ('title', 'description', 'category__name')
    inlines = [ModuleInline]
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-popularity_score', 'title')


@admin.register(Module)
class ModuleAdmin(OrderedModelAdmin):
    list_display = ('title', 'course', 'order', 'move_up_down_links')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
    inlines = [LessonInline]
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('order',)


@admin.register(Lesson)
class LessonAdmin(OrderedModelAdmin):
    list_display = (
        'title', 'module', 'lesson_type',
        'is_active', 'order',
        'move_up_down_links'
    )
    list_filter = ('module', 'lesson_type', 'is_active')
    search_fields = ('title', 'module__title')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('order',)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'resource_type',
        'course', 'is_active', 'created_at'
    )
    list_filter = ('resource_type', 'course', 'is_active')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TextContent)
class TextContentAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'content')
    search_fields = ('lesson__title', 'content')


@admin.register(VideoContent)
class VideoContentAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'video_file')
    search_fields = ('lesson__title', 'video_file')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'course', 'user', 'rating',
        'helpful_count', 'anonymous',
        'review_date'
    )
    list_filter = ('rating', 'anonymous', 'flagged')
    search_fields = ('course__title', 'user__username', 'comment')
    readonly_fields = ('review_date', 'updated_at', 'helpful_count')
