from django.urls import path
from django.urls.conf import include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter


tutor_router = DefaultRouter()


tutor_router.register(
    prefix='courses', viewset=views.CourseViewSet, basename='tutor_courses'
)
tutor_router.register(
    r'tsfiles', viewset=views.TSFileViewSet, basename='tsfile')
tutor_router.register(
    prefix='chats', viewset=views.TeacherChatViewSet, basename='tutor_chats'
)
course_router = NestedDefaultRouter(tutor_router, 'courses', lookup='course')
course_router.register(
    'modules', viewset=views.ModuleViewSet, basename="tutor_modules"
)

module_router = NestedDefaultRouter(course_router, 'modules', lookup='module')
module_router.register(
    'lessons', viewset=views.LessonViewSet, basename="tutor_lessons"
)

urlpatterns = [

    path('tutor/', include(tutor_router.urls)),
    path('tutor/', include(course_router.urls)),
    path('tutor/', include(module_router.urls)),
    path("tutor/become_tutor/", view=views.TeacherView.as_view(),
         name="become_teacher"),
    path('tutor/dashboard/', view=views.TutorDashboardAPIView.as_view(),
         name='tutor-dashboard'),
]
