from django.utils import timezone
from django.db import models
from django.conf import settings
# from django.core.validators import MinValueValidator


# Create your models here.
class Student(models.Model):
    user = models.OneToOneField(
        unique=True,
        db_index=True,
        related_name="student",
        on_delete=models.CASCADE,
        to=settings.AUTH_USER_MODEL,
        verbose_name="Student Profile",
        related_query_name="student"
    )
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    course = models.ForeignKey('tutor.Course', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(
        Student, on_delete=models.CASCADE,
        related_name='cart_items'
    )

    class Meta:
        unique_together = [['course', 'customer']]


class WishList(models.Model):
    course = models.ForeignKey(
        'tutor.Course', on_delete=models.CASCADE,
        related_name="wish_Courses"
    )
    customer = models.ForeignKey(
        Student, on_delete=models.CASCADE,
        related_name="wish_list"
    )

    class Meta:
        unique_together = [['course', 'customer']]


class Enrolment(models.Model):

    ACTIVE = 'active'
    COMPLETED = 'completed'
    ENROLLMENT_STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (COMPLETED, 'Completed'),
    ]

    course = models.ForeignKey(
        'tutor.Course', on_delete=models.CASCADE,
        related_name="enrolled_courses"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE,
        related_name="enrolments"
    )
    status = models.CharField(
        max_length=10,
        choices=ENROLLMENT_STATUS_CHOICES,
        default=ACTIVE
    )

    date_enrolled = models.DateTimeField(default=timezone.now())
    date_completed = models.DateTimeField(null=True, blank=True)

    progress = models.DecimalField(
        max_digits=5, decimal_places=2,
        default=0.00, help_text="Percentage completion of the course."
    )

    payment_type = models.CharField(
        max_length=2, choices=[
            ('p', 'Paid'),
            ('fr', 'Free')
        ], default='not_paid'
    )

    last_accessed = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['course', 'student']

    def __str__(self):
        return f"{self.student} - {self.course} - {self.status}"


class LessonProgress(models.Model):

    enrolment = models.ForeignKey(
        Enrolment,
        on_delete=models.CASCADE, related_name="lesson_progress"
    )
    lesson = models.ForeignKey(
        'tutor.Lesson', on_delete=models.CASCADE, related_name='progress')

    status = models.CharField(
        max_length=20,
        choices=[
            ('not_started', 'Not Started'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed')
        ],
        default='not_started'
    )

    completed_at = models.DateTimeField(
        null=True, blank=True
    )  # Time when the student marked the lesson as complete

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
