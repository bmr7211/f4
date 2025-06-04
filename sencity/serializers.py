# /f4/sencity/serializers.py
from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'name', 'telphone', 'email', 'password', 'address']

    def create(self, validated_data):
        return super().create(validated_data)