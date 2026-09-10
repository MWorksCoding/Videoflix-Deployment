from django.conf import settings
from django.shortcuts import render
import requests
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from videoflix.models import Video
from videoflix.serializers import VideoSerializer
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect

# Create your views here.

CACHE_TTL = getattr(settings, "CACHE_TTL", DEFAULT_TIMEOUT)

class LoginView(ObtainAuthToken):
    """
    Custom view for user login.
    It inherits from Django Rest Framework's ObtainAuthToken class.
    
    POST method: Authenticates the user with email and password, 
    generates a token for the session, and returns the token along 
    with user details (ID and email).
    
    Parameters:
    - request: HTTP POST request containing 'username' and 'password'.
    
    Returns:
    - Response: A JSON response containing token, user_id, and email.
    """
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })  
        

class LogoutView(APIView):
    """
    Custom view for user logout.
    
    POST method: Requires authentication. The token of the authenticated user 
    is deleted, effectively logging out the user.
    
    Parameters:
    - request: HTTP POST request with authentication token.
    
    Returns:
    - Response: JSON message confirming successful logout.
    """
    
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        token = Token.objects.get(user=request.user)
        token.delete()
        request.auth.delete()
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
    
    
class VideoViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing video resources.
    
    Provides CRUD operations on the 'Video' model, restricted to authenticated users.
    
    Parameters:
    - queryset: List of all videos, ordered by creation time.
    - serializer_class: Serializer for the 'Video' model.
    
    Permission:
    - IsAuthenticated: Only authenticated users can access this viewset.
    """
    
    queryset = Video.objects.all().order_by("created_at")
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]


# @method_decorator(cache_page(CACHE_TTL))
class VideoView(APIView):
    """
    Custom API view for handling video resources.
    
    GET method:
    - If a primary key (pk) is provided, fetch a specific video by ID.
    - If no pk is provided, fetch all available videos.
    
    Returns serialized video data in JSON format. Only accessible to authenticated users.
    
    Parameters:
    - request: HTTP GET request.
    - pk (optional): Primary key of the video.
    
    Returns:
    - Response: Serialized video data (single or list) in JSON format.
    """
    
    permission_classes = [IsAuthenticated]
    def get(self, request, pk=None, format=None):
        try:
            if pk:
                video = get_object_or_404(Video, pk=pk)
                serializer = VideoSerializer(video, context={'request': request})
            else:
                videos = Video.objects.all()
                serializer = VideoSerializer(videos, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
class RegisterVerified(APIView):
    """
    Custom API view for handling user registration verification.
    
    GET method: Receives a verification code from the request's query parameters.
    Sends a request to the authemail verification endpoint to verify the user.
    
    On success:
    - Redirects the user to the frontend's registration success page.
    On failure:
    - Redirects to a 404 page.
    
    Parameters:
    - request: HTTP GET request with 'code' query parameter.
    
    Returns:
    - HttpResponseRedirect: Redirects the user based on verification status.
    """
    
    def get(self, request, *args, **kwargs):
        verification_code = request.query_params.get('code', None)
        verify_url = f"http://127.0.0.1:8000/api/accounts/signup/verify/?code={verification_code}"
        try:
            response = requests.get(verify_url)
            if response.status_code == 200:
                return HttpResponseRedirect('http://localhost:4200/register-verified')
            else:
                return HttpResponseRedirect('http://localhost:4200/404')
        except requests.exceptions.RequestException as e:
            return HttpResponseRedirect('http://localhost:4200/404')
        
        
class PasswordResetVerified(APIView):
    """
    Custom API view for handling password reset verification.
    
    GET method: Receives a verification code from the request's query parameters.
    Sends a request to the authemail password reset verification endpoint.
    
    On success:
    - Redirects the user to the frontend password reset page with the verification code.
    On failure:
    - Redirects to a 404 page.
    
    Parameters:
    - request: HTTP GET request with 'code' query parameter.
    
    Returns:
    - HttpResponseRedirect: Redirects the user based on verification status.
    """
    
    def get(self, request, *args, **kwargs):
        verification_code = request.query_params.get('code', None)
        verify_url = f"http://127.0.0.1:8000/api/accounts/password/reset/verify/?code={verification_code}"
        try:
            response = requests.get(verify_url)
            if response.status_code == 200:
                return HttpResponseRedirect(f'http://localhost:4200/password-reset?code={verification_code}')
            else:
                return HttpResponseRedirect('http://localhost:4200/404')
        except requests.exceptions.RequestException as e:
            return HttpResponseRedirect('http://localhost:4200/404')