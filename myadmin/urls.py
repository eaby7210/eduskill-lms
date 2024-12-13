from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CourseViewSet, ModuleViewSet,
    CategoryViewSet, DashboardAPIView
)
from rest_framework_nested.routers import NestedDefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'category', CategoryViewSet, basename='category')

course_router = NestedDefaultRouter(router, 'courses', lookup="course")
course_router.register(
    'modules', viewset=ModuleViewSet, basename="course_modules"
)


urlpatterns = [
    path("", include(course_router.urls)),
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
] + router.urls
