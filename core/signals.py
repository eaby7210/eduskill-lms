# from django.db.models.signals import post_save
# from django.dispatch import receiver
# # from django.conf import settings
# from .models import User
# from tutor.models import Teacher  # Import Teacher model
# from students.models import Student  # Import Student model


# @receiver(post_save, sender=User)
# def create_profile_on_user_creation(sender, instance, created, **kwargs):
#     """
#     Signal to create profile upon user creation based on role.
#     """
#     if created:
#         # Role is TUTOR, create Teacher profile
#         if instance.role == User.Role.TUTOR:
#             Teacher.objects.create(user=instance)

#         # Role is STUDENT, create Student profile
#         elif instance.role == User.Role.STUDENT:
#             Student.objects.create(user=instance)
