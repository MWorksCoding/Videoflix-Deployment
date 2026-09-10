from django.db import models
from datetime import date
import datetime
from authemail.models import EmailUserManager, EmailAbstractUser

class MyUser(EmailAbstractUser):
    """
    Custom User model inheriting from EmailAbstractUser.

    This class extends the EmailAbstractUser provided by the authemail package. 
    It uses the user's email address for authentication instead of a username. 
    The EmailUserManager is used as the default manager for managing user queries and operations.
    """
    
    objects = EmailUserManager()
 
class Video(models.Model):
    """
    Model representing a Video entry in the database.

    This class defines the structure for storing video-related information such as 
    title, description, associated files (video and thumbnail), and genre.

    Fields:
    - created_at: Date when the video was added (default is the current date).
    - title: The title of the video (maximum 80 characters).
    - description: A brief description of the video (maximum 500 characters).
    - video_file: A file field to upload the actual video file (optional).
    - thumbnail_file: A file field to upload the video's thumbnail image (optional).
    - genre: The genre of the video, chosen from a predefined set of categories (default is "fitness").
    """
    
    GENRES = [
    ("fitness", "Fitness"),
    ("pets", "Pets"),
    ("holiday", "Holiday"),
    ]
        
    created_at = models.DateField(default=datetime.date.today)
    title = models.CharField(max_length=80)
    description = models.CharField(max_length=500)
    video_file = models.FileField(upload_to="videos", blank=True, null=True)
    thumbnail_file = models.FileField(upload_to="thumbnails", blank=True, null=True)
    genre = models.CharField(max_length=20, choices=GENRES, default="fitness")