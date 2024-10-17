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
