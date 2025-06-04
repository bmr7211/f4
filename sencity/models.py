# /f4/sencity/models.py
from django.db import models

class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    telphone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # 실제론 해시 저장 필요
    address = models.TextField(blank=True, null=True)

# 이미지 업로드
# class CapturedImage(models.Model):
#     image = models.ImageField(upload_to='captured/')
#     timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name