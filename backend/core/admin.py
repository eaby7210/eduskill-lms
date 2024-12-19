from django.contrib import admin
from .models import User, Notification


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    readonly_fields = ('last_login',)
    ordering = ('-date_joined', 'username')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'message', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp', 'sender', 'receiver')
    search_fields = ('message', 'sender__username', 'receiver__username')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
