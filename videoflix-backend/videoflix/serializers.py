from rest_framework import serializers
from .models import Video
from django.conf import settings
from django.contrib.auth.models import User


class VideoSerializer(serializers.ModelSerializer):
    """
    Serializer for the Video model.
    
    This class is used to convert Video model instances into JSON and vice versa, 
    allowing for easy serialization and deserialization when interacting with 
    video-related API endpoints.
    """
    
    class Meta:
        """
        Meta options for the VideoSerializer.
        
        Specifies the model to be serialized (Video) and the fields to include in the 
        serialized representation, which in this case is all fields of the model.
        """
        model = Video
        fields = "__all__"
    
    def get_video_file(self, video):
        """
        Retrieve the absolute URL of the video file.
        
        This method constructs the full URL to the video file if the request method is GET 
        and the video file exists. It ensures that the client receives the complete URL 
        to access the video file instead of just the relative path.
        
        Parameters:
        - video (Video): The Video model instance from which to get the video file URL.
        
        Returns:
        - str: The absolute URL of the video file, if available.
        """
        
        if self.context["request"].method == "GET" and video.video_file:
            return self.context["request"].build_absolute_uri(video.video_file.url)

    def get_thumbnail_file(self, video):
        """
        Retrieve the absolute URL of the thumbnail image file.
        
        This method constructs the full URL to the thumbnail image if the request method is GET 
        and the thumbnail file exists. It ensures that the client receives the complete URL 
        to access the thumbnail image instead of just the relative path.
        
        Parameters:
        - video (Video): The Video model instance from which to get the thumbnail image URL.
        
        Returns:
        - str: The absolute URL of the thumbnail image, if available.
        """
        
        if self.context["request"].method == "GET" and video.thumbnail_file:
            return self.context["request"].build_absolute_uri(video.thumbnail_file.url)