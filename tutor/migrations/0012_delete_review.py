# Generated by Django 5.1.3 on 2024-11-19 15:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tutor', '0011_alter_videocontent_thumbnail'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Review',
        ),
    ]