# /f4/sencity/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserProfileSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class SignUpView(APIView):
    def post(self, request):
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': ''}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailDuplicateCheckView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': ''}, status=status.HTTP_400_BAD_REQUEST)
        is_duplicate = User.objects.filter(email=email).exists()
        return Response({'is_duplicate': is_duplicate})

# from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse
# from .models import CapturedImage
#
# @csrf_exempt
# def upload_image(request):
#     if request.method == 'POST' and request.FILES.get('image'):
#         image = request.FILES['image']
#         CapturedImage.objects.create(image=image)
#         return JsonResponse({'status': 'success'})
#     return JsonResponse({'status': 'error'}, status=400)