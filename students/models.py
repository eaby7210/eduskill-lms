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
