# Generated by Django 5.1.2 on 2024-10-30 01:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tutor', '0008_alter_course_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='videocontent',
            name='hls',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='videocontent',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('processing', 'Processing'), ('completed', 'Completed')], default='pending', max_length=20),
        ),
        migrations.AddField(
            model_name='videocontent',
            name='thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to='lessons/thumbnails'),
        ),
    ]
