import os
from unittest import skip
from django.test import TestCase
from videoflix.models import Video
from datetime import date
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework import status
from videoflix.serializers import VideoSerializer
from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory
from django.core.cache import cache
from django_rq import get_queue
from unittest.mock import patch, MagicMock
from videoflix.signals import video_post_save
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

class VideoModelTest(TestCase):

    def setUp(self):
        """
        Sets up the test environment for each test case.
        """
        with open("media/videos/3327959-hd_1920_1080_24fps.mp4", "rb") as video_file:
            self.video = Video.objects.create(
                title="Test Video",
                description="This is a test video.",
                genre="fitness",
                created_at=date.today(),
                video_file=File(video_file),
            )


    def tearDown(self):
        """
        Clean up the uploaded files after tests.
        """
        if self.video.video_file:
            if os.path.exists(self.video.video_file.path):
                os.remove(self.video.video_file.path)

    def test_video_creation(self):
        """
        Test that a Video object is created successfully.
        """
        self.assertIsInstance(self.video, Video)
        self.assertEqual(self.video.title, "Test Video")
        self.assertEqual(self.video.genre, "fitness")
        self.assertEqual(self.video.description, "This is a test video.")

    def test_video_default_date(self):
        """
        Test that the 'created_at' field defaults to today's date.
        """
        self.assertEqual(self.video.created_at, date.today())

    def test_video_file_attached(self):
        """
        Test that the video file is properly attached.
        """
        self.assertTrue(self.video.video_file)
        self.assertIn("3327959-hd_1920_1080_24fps", self.video.video_file.name)


class VideoSerializerTest(TestCase):

    def setUp(self):
        """
        Sets up the test environment for each test case.
        """
        self.video_file = SimpleUploadedFile("3327959-hd_1920_1080_24fps.mp4", b"file_content", content_type="video/mp4")
        self.thumbnail_file = SimpleUploadedFile("test_thumbnail.jpg", b"image_content", content_type="image/jpeg")

        self.video = Video.objects.create(
            title="Test Video",
            description="A test video",
            genre="fitness",
            created_at=date.today(),
            video_file=self.video_file,
            thumbnail_file=self.thumbnail_file
        )

        self.factory = APIRequestFactory()

    def tearDown(self):
        """
        Clean up the uploaded files after tests.
        """
        if self.video.video_file and os.path.exists(self.video.video_file.path):
            os.remove(self.video.video_file.path)
        if self.video.thumbnail_file and os.path.exists(self.video.thumbnail_file.path):
            os.remove(self.video.thumbnail_file.path)

    def test_serialization(self):
        """
        Test that VideoSerializer correctly serializes a Video instance to JSON.
        """
        request = self.factory.get("/api/videos/")
        serializer = VideoSerializer(instance=self.video, context={"request": request})
        data = serializer.data

        self.assertEqual(data["title"], "Test Video")
        self.assertEqual(data["description"], "A test video")
        self.assertEqual(data["genre"], "fitness")
        self.assertIn("3327959-hd_1920_1080_24fps", data["video_file"])
        self.assertIn("/media/thumbnails/test_thumbnail.jpg", data["thumbnail_file"])

    def test_deserialization(self):
        """
        Test that VideoSerializer correctly deserializes JSON data to a Video instance.
        """
        data = {
            "title": "New Test Video",
            "description": "A new test video",
            "genre": "holiday",
            "created_at": date.today(),
            "video_file": self.video_file,
            "thumbnail_file": self.thumbnail_file
        }
        serializer = VideoSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        video_instance = serializer.save()

        self.assertEqual(video_instance.title, "New Test Video")
        self.assertEqual(video_instance.description, "A new test video")
        self.assertEqual(video_instance.genre, "holiday")

    def test_get_video_file(self):
        """
        Test that the `get_video_file` method returns the absolute URL of the video file.
        """
        request = self.factory.get("/api/videos/")
        serializer = VideoSerializer(instance=self.video, context={"request": request})
        video_url = serializer.get_video_file(self.video)

        self.assertIn("3327959-hd_1920_1080_24fps", video_url)

    def test_get_thumbnail_file(self):
        """
        Test that the `get_thumbnail_file` method returns the absolute URL of the thumbnail image.
        """
        request = self.factory.get("/api/videos/")
        serializer = VideoSerializer(instance=self.video, context={"request": request})
        thumbnail_url = serializer.get_thumbnail_file(self.video)

        self.assertIn("/media/thumbnails/test_thumbnail.jpg", thumbnail_url)


class VideoSignalTest(TestCase):

    def setUp(self):
        """
        Sets up the test environment for each test case.
        """
        self.video_file = File(open("media/videos/3327959-hd_1920_1080_24fps.mp4", "rb"))
        self.video = Video.objects.create(
            title="Test Video",
            description="A test video",
            genre="fitness",
            created_at=date.today(),
            video_file=self.video_file,
        )

    def tearDown(self):
        """
        Clean up the uploaded files after tests.
        """
        if self.video.video_file:
            if os.path.exists(self.video.video_file.path):
                os.remove(self.video.video_file.path)


    @patch('videoflix.signals.create_thumbnail')
    @patch('django_rq.enqueue')
    def test_video_post_save_creates_thumbnail_and_enqueues_tasks(self, mock_enqueue, mock_create_thumbnail):
        """
        Tests that the video post_save signal creates a thumbnail and enqueues tasks.
        This test verifies that when a Video instance is saved:
        - A thumbnail is created.
        - The thumbnail file is properly associated with the Video instance.
        - Two tasks (for video conversion) are enqueued.
        It uses mocks to simulate the behavior of the `create_thumbnail`
        function and the task queue. The initial task queue count is checked
        before and after the signal is triggered to ensure that the expected
        number of tasks have been enqueued.
        """

        mock_create_thumbnail.return_value = 'media/thumbnails/3327959-hd_1920_1080_24fps.jpg'
        queue = get_queue('default')
        initial_count = queue.count
        video_post_save(Video, self.video, created=True)

        self.assertTrue(self.video.thumbnail_file)
        self.assertIn('3327959-hd_1920_1080_24fps.jpg', self.video.thumbnail_file.name)
        self.assertEqual(queue.count, initial_count + 2)
        print(f"Mock enqueue called: {mock_enqueue.called}")
        if not mock_enqueue.called:
            print("Warning: mock_enqueue was not called.")


User = get_user_model()

class VideoFlixAPITests(TestCase):
    """
    Test suite for the VideoFlix API views.

    This class contains tests for user authentication, video management, and
    registration/password reset verification.
    """

    def setUp(self):
        """
        Sets up the test environment for each test case.

        Creates an API client for testing.
        """
        self.client = APIClient()
        self.video = Video.objects.create(
            title="Test Video",
            description="A test video",
            genre="fitness",
            video_file='3327959-hd_1920_1080_24fps.mp4'
        )

    def test_user_signup_and_login(self):
        """
        Test user signup, email verification, and login.
        """

        signup_data = {
            'email': 'testuser@example.com',
            'password': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        signup_response = self.client.post('/api/accounts/signup/', signup_data)
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)
        verification_code = 'valid_code'
        verification_response = self.client.get(f'/api/accounts/signup/verify/?code={verification_code}')
        login_response = self.client.post('/login/', {
            'username': 'testuser@example.com',
            'password': 'password123'
        })
        self.assertIn('token', login_response.data)
        self.assertIn('user_id', login_response.data)
        self.assertIn('email', login_response.data)
        self.assertEqual(login_response.data['email'], signup_data['email'])

    def test_user_logout(self):
        """
        Test user logout by deleting the token.
        """
        
        user = User.objects.create_user(
            email='testuser@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + Token.objects.get(user=user).key)
        response = self.client.post('/logout/')
        self.assertEqual(response.data['message'], "Successfully logged out.")
        with self.assertRaises(Token.DoesNotExist):
            Token.objects.get(user=user)

    def test_video_list(self):
        """
        Test fetching the list of videos.
        """
        
        response = self.client.get('/videos/')
        self.assertEqual(len(response.data), 1) 