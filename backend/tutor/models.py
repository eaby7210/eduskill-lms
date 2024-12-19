import os
from datetime import timezone
from django.db import models
from django.conf import settings
from autoslug import AutoSlugField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from ordered_model.models import OrderedModel
# from django.db.models.signals import post_save, pre_delete
# from django.dispatch import receiver


class Teacher(models.Model):
    user = models.OneToOneField(
        unique=True,
        db_index=True,
        related_name="teacher",
        on_delete=models.CASCADE,
        to=settings.AUTH_USER_MODEL,
        verbose_name="Teacher Profile",
        related_query_name="teacher"
    )
    bio = models.TextField(blank=True, null=True)
    qualifications = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username


class Category(OrderedModel):
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        db_index=True,
        on_delete=models.SET_NULL,
        related_name='subcategories'
    )
    name = models.CharField(max_length=255, unique=True)
    slug = AutoSlugField(
        populate_from="name", max_length=50, unique=True, always_update=True
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Tracking and analytics
    # courses_count = models.PositiveIntegerField(default=0)
    order_with_respect_to = 'parent'

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Course(models.Model):

    DRAFT = 'draft'
    PENDING_APPROVAL = 'pending_approval'
    PUBLISHED = 'published'
    BLOCKED = 'blocked'

    COURSE_STATUS_CHOICES = [
        (DRAFT, 'Saved as Draft'),
        (PENDING_APPROVAL, 'Saved for Approval'),
        (PUBLISHED, 'Published Public'),
        (BLOCKED, 'Blocked')
    ]

    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name='courses',
        db_index=True
    )
    title = models.CharField(max_length=255)
    slug = AutoSlugField(
        populate_from='title', max_length=50, unique=True,
        db_index=True
    )
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True,
        db_index=True
    )
    # Content and structure
    syllabus = models.TextField(blank=True)
    duration = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Duration in hours",
        validators=[MinValueValidator(1)]
    )
    # Enrollment and pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[
        MinValueValidator(0.00)
    ])
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True, blank=True,
        validators=[
            MinValueValidator(0.00),
            MaxValueValidator(100.0)
        ])  # check price is non-zero
    course_thumbnail = models.ImageField(
        upload_to='course_thumbnails/', blank=True, null=True
    )
    # Status and tracking
    status = models.CharField(
        max_length=20,
        choices=COURSE_STATUS_CHOICES,
        default=DRAFT,
        db_index=True
    )
    is_active = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(
        null=True, blank=True
    )
    last_updated = models.DateTimeField(auto_now=True)
    # Additional info
    requirements = models.TextField(blank=True, null=True)
    learning_objectives = models.TextField(blank=True)
    target_audience = models.CharField(max_length=255, blank=True)
    completion_certificate = models.BooleanField(default=False)
    # Admin/meta information
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    popularity_score = models.FloatField(default=0.0)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-popularity_score', 'title']

    def clean(self):
        """
        Custom validation to enforce status transitions.
        """
        if self.pk:  # If the course already exists
            previous_status = Course.objects.get(pk=self.pk).status

            # Enforce status transition rules
            if previous_status == self.DRAFT and self.status in [
                self.BLOCKED, self.PUBLISHED
            ]:
                print("sfgsdfgsdfgsdfgsdfg")
                print(self.status)
                raise ValidationError(
                    "You can only move from 'Draft' to 'Pending Approval'."
                )
            if previous_status == self.PENDING_APPROVAL and self.status in [
                self.BLOCKED
            ]:
                raise ValidationError(
                    "You can only move from 'Pending Approval' to 'Published'."
                )
            if previous_status == self.PUBLISHED:
                if self.status in [
                    self.PENDING_APPROVAL,
                ]:

                    raise ValidationError(
                        "A 'Published' course can only transition\
                            to 'Blocked'."
                    )

            if previous_status == self.BLOCKED and\
                    self.status in [
                        self.PENDING_APPROVAL
                    ]:
                raise ValidationError(
                    "A 'Blocked' course can only transition\
                        back to 'Published'."
                )

    def save(self, *args, **kwargs):

        self.clean()
        if self.status == self.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()

        super().save(*args, **kwargs)

    def soft_delete(self):
        self.is_active = False
        self.save()

    def delete(self, *args, **kwargs):
        if self.is_active:
            self.soft_delete()
        else:
            super().delete(*args, **kwargs)


class Resource(models.Model):
    RESOURCE_TYPES = [('file', 'File'), ('link', 'Link'), ('text', 'Text')]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    # Resource type: file, link, or text
    resource_type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    file = models.FileField(
        upload_to='resources/files/', blank=True, null=True
    )
    link = models.URLField(blank=True, null=True)

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE,
        related_name='resources',
        blank=True, null=True
    )
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class Module(OrderedModel):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="modules"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    # order = models.PositiveIntegerField(
    #     default=0, validators=[MinValueValidator(0)]
    #     )  # populated sequentially based
    # on the number of modules
    duration = models.DurationField(
        null=True, blank=True
    )  # module duration can't be longer than the total course duration.
    is_active = models.BooleanField(default=True)
    resources = models.ManyToManyField(
        Resource, blank=True, related_name="modules"
    )  # Resource model should linked and validated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # index for views_count and courses_count
    order_with_respect_to = 'course'

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order']


class Lesson(OrderedModel):
    LESSON_TYPES = [('text', 'Text'), ('video', 'Video')]

    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500, blank=True, null=True)
    lesson_type = models.CharField(max_length=10, choices=LESSON_TYPES)
    duration = models.DurationField(
        blank=True, null=True
    )  # Duration of video lessons
    # order = models.PositiveIntegerField(
    #     blank=True, null=True, default=0
    #     )  # For ordering lessons within a module
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name='lessons'
    )
    is_active = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    resources = models.FileField(
        upload_to='lessons/resources/', blank=True, null=True
    )
    is_free = models.BooleanField(default=False)
    order_with_respect_to = 'module'

    def __str__(self):
        return self.title

    def clean(self):
        if self.lesson_type == 'text' and not hasattr(self, 'text_content'):
            raise ValidationError("Text content is missing for a text lesson.")
        if self.lesson_type == 'video' and not hasattr(self, 'video_content'):
            raise ValidationError(
                "Video content is missing for a video lesson."
            )
        if hasattr(self, 'text_content') and hasattr(self, 'video_content'):
            raise ValidationError(
                "A lesson cannot have both text and video content."
            )


class TextContent(models.Model):
    lesson = models.OneToOneField(
        Lesson, on_delete=models.CASCADE, related_name='text_content'
    )
    content = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Text content for {self.lesson.title}"


class VideoContent(models.Model):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    STATUS_CHOICES = (
        (PENDING, "Pending"),
        (PROCESSING, "Processing"),
        (COMPLETED, "Completed"),
    )
    lesson = models.OneToOneField(
        Lesson, on_delete=models.CASCADE, related_name='video_content'
    )
    video_file = models.FileField(
        upload_to='lessons/videos/', blank=True, null=True
    )
    thumbnail = models.ImageField(max_length=255,
                                  upload_to='lessons/thumbnails',
                                  blank=True, null=True
                                  )
    hls = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING,
    )

    def get_basename(self):
        return f"{str(self.id)}__{os.path.basename(self.video_file.name)}"

    def __str__(self):
        return f"Video content for {self.lesson.title}"


def ts_file_upload_to(instance, filename):
    return f'ts_files/{instance.video_content.id}/{filename}'


class TSFile(models.Model):
    video_content = models.ForeignKey(
        VideoContent, on_delete=models.CASCADE, related_name='ts_files'
    )
    ts_file = models.FileField(upload_to=ts_file_upload_to)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TS file for {self.video_content.lesson.title}"
