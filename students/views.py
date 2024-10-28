from rest_framework import mixins, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CartItem, WishList
from .serializers import (
    CartItemSerializer, CartItemListSerializer,
    WishItemSerializer, WishItemListSerializer
)


class CartItemViewSet(mixins.CreateModelMixin,
                      mixins.ListModelMixin,
                      viewsets.GenericViewSet):

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return CartItemListSerializer
        else:
            return CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(customer=self.request.user.student)

    def perform_create(self, serializer):
        student = self.request.user.student
        print(self.request.data)
        course = serializer.validated_data['course']

        # Check if the cart item already exists
        cart_item, created = CartItem.objects.get_or_create(
            course=course, customer=student
        )

        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            cart_item.delete()  # If it exists, delete it
            return Response(status=status.HTTP_204_NO_CONTENT)


class WishListViewSet(mixins.CreateModelMixin,
                      mixins.ListModelMixin,
                      viewsets.GenericViewSet):

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return WishItemListSerializer
        else:
            return WishItemSerializer

    def get_queryset(self):
        return WishList.objects.filter(customer=self.request.user.student)

    def perform_create(self, serializer):
        student = self.request.user.student
        course = serializer.validated_data['course']

        wish_item, created = WishList.objects.get_or_create(
            course=course, customer=student
        )

        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            wish_item.delete()  # If it exists, delete it
            return Response(status=status.HTTP_204_NO_CONTENT)
