# Generated by Django 5.1.2 on 2024-10-29 10:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0004_alter_enrolment_date_enrolled'),
    ]

    operations = [
        migrations.AlterField(
            model_name='enrolment',
            name='status',
            field=models.CharField(choices=[('active', 'Active'), ('completed', 'Completed'), ('notstarted', 'Not Started')], default='active', max_length=10),
        ),
    ]