from django.urls import include, path
from .views import UserUpdateView

urlpatterns = [
    path('', include('dj_rest_auth.urls')),
    path('register/', include('dj_rest_auth.registration.urls')),
    path('user/update/', UserUpdateView.as_view(), name="user_update"),
]
