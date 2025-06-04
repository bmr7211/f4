# /f4/sencity/urls.py
from django.urls import path
from .views import SignUpView, EmailDuplicateCheckView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('check-email/', EmailDuplicateCheckView.as_view(), name='check-email'),
]