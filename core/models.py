from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.core.exceptions import ValidationError


class User(AbstractUser):

    class Role(models.TextChoices):

        STUDENT = 'STUD', 'Student'
        TUTOR = 'TUTR', 'Tutor'
    email = models.EmailField(unique=True, max_length=245)
    image = models.ImageField(
        upload_to='images/profiles',
        blank=True, null=True
    )
    role = models.CharField(
        max_length=4,
        choices=Role.choices,
    )


class Notification(models.Model):
    sender = models.ForeignKey(
        User, related_name='sent_notifications', on_delete=models.CASCADE)
    receiver = models.ForeignKey(
        User, related_name='received_notifications', on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    user_role = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.message[:50]}..."
