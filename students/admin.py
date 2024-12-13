from django.contrib import admin
from .models import (Student, Wallet, CartItem, WishList, Enrolment,
                     LessonProgress, Address, Order, OrderItem,
                     RazorpayOrders, Review)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'is_active',
                    'is_verified', 'created_at', 'updated_at')
    search_fields = ('user__username', 'bio')
    list_filter = ('is_active', 'is_verified')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('student', 'wallet_balance')
    search_fields = ('student__user__username',)
    readonly_fields = ('student',)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('course', 'customer', 'created_at')
    search_fields = ('course__title', 'customer__user__username')
    readonly_fields = ('created_at',)


@admin.register(WishList)
class WishListAdmin(admin.ModelAdmin):
    list_display = ('course', 'customer')
    search_fields = ('course__title', 'customer__user__username')


@admin.register(Enrolment)
class EnrolmentAdmin(admin.ModelAdmin):
    list_display = ('course', 'student', 'status', 'date_enrolled',
                    'date_completed', 'progress',
                    'payment_type', 'last_accessed')
    search_fields = ('course__title', 'student__user__username')
    list_filter = ('status', 'payment_type')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('enrolment', 'lesson', 'status',
                    'completed_at', 'created_at', 'updated_at')
    search_fields = ('enrolment__course__title',
                     'enrolment__student__user__username')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('name', 'street_address', 'city',
                    'state', 'postal_code', 'country')
    search_fields = ('name', 'street_address', 'city',
                     'state', 'postal_code', 'country')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'order_date', 'status',
                    'total_amount', 'payable', 'is_paid',
                    'created_at', 'updated_at')
    search_fields = ('student__user__username',)
    list_filter = ('status', 'is_paid')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'course', 'price')
    search_fields = ('order__id', 'course__title')


@admin.register(RazorpayOrders)
class RazorpayOrdersAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'rzr_payment_id', 'rzr_signature')
    search_fields = ('order__id', 'rzr_payment_id', 'rzr_signature')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'rating', 'created_at',
                    'updated_at', 'is_active', 'is_flagged')
    search_fields = ('student__user__username', 'course__title')
    list_filter = ('is_active', 'is_flagged')
    readonly_fields = ('created_at', 'updated_at')
