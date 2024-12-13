# Generated by Django 5.1.3 on 2024-11-12 09:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0010_order_payable'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('refunded', 'Refunded')], default='pending', max_length=10),
        ),
    ]