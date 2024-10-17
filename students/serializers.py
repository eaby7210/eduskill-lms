from rest_framework import serializers
from django.apps import apps
from .models import Student, CartItem, WishList
from tutor.serializers import CourseListSerializer
Course = apps.get_model('tutor', 'Course')


class StudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Student
        fields = [
            'id', 'bio', 'is_active',
            'is_verified', 'created_at',
            'updated_at'
            ]


class CartItemListSerializer(serializers.ModelSerializer):
    course = CourseListSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'course', 'created_at']


class WishItemListSerializer(serializers.ModelSerializer):
    course = CourseListSerializer()

    class Meta:
        model = WishList
        fields = ['id', 'course']


class CartItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = CartItem
        fields = ['id', 'course', 'created_at']

    def validate_course(self, value):
        """
        Check if the course exists before adding to cart.
        """
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(
                "The selected course does not exist."
                )
        return value


class WishItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = WishList
        fields = ['id', 'course']

    def validate_course(self, value):
        """
        Check if the course exists before adding to wishlist.
        """
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(
                "The selected course does not exist."
                )
        return value
