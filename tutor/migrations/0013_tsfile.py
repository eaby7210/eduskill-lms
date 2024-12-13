# Generated by Django 5.1.4 on 2024-12-07 03:29

import django.db.models.deletion
import tutor.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tutor', '0012_delete_review'),
    ]

    operations = [
        migrations.CreateModel(
            name='TSFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ts_file', models.FileField(upload_to=tutor.models.ts_file_upload_to)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('video_content', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ts_files', to='tutor.videocontent')),
            ],
        ),
    ]