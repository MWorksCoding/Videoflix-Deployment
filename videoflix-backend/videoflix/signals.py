from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import Video
import os
from .tasks import convert720p, convert120p, convert360p, rename_to_1080p, convert_path, create_thumbnail
from django_rq import enqueue
import django_rq

from django.core.cache import cache


@receiver(post_save, sender=Video)
def video_post_save(sender, instance, created, **kwargs):
    """
    Signal receiver for handling actions after a Video instance is saved.
    Run "brew services start redis" to start caching
    Run "python3 manage.py runserver " to get started
    Run "python3 manage.py rqworker" to run worker
    Run "brew services stop redis" to stop caching

    This function performs the following actions when a new Video instance is created:
    - Generates a thumbnail if not already present.
    - Enqueues video conversion tasks for 720p and 480p formats.
    - Clears the cache.

    Args:
    - sender: The model class (Video), instance sender.
    - instance: The actual instance being saved (video object in this case).
    - created: A boolean indicating if a new record was created.
    - **kwargs: Additional keyword arguments.
    """

    if created:
        if not instance.thumbnail_file.name:
            thumbnail_path = create_thumbnail(instance.video_file.path)
            instance.thumbnail_file.name = thumbnail_path[
            len(settings.MEDIA_ROOT) + 1 :
            ]
            instance.save()
        queue = django_rq.get_queue("default", autocommit=True)
        queue.enqueue(convert720p, instance.video_file.path)
        queue.enqueue(convert360p, instance.video_file.path)
        queue.enqueue(convert120p, instance.video_file.path)
        queue.enqueue(rename_to_1080p, instance.video_file.path)
        cache.clear()