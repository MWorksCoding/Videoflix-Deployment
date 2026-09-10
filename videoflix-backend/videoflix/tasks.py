import subprocess # run commands from terminal
from django.conf import settings
import os

# In Docker, ffmpeg is installed system-wide and available on PATH as "ffmpeg".
# Override via the FFMPEG_PATH env var if you need an absolute path (e.g. local macOS dev).
FFMPEG_PATH = os.getenv("FFMPEG_PATH", "ffmpeg")

def create_thumbnail(source_path, time="00:00:01", width=854 , height=480):
    """
    Create a thumbnail for a video file at a specified time.
    
    This function uses the FFMPEG tool to generate a thumbnail image 
    from a video. The thumbnail is saved in the 'thumbnails' directory 
    within the MEDIA_ROOT.
    
    Parameters:
    - source_path (str): The path to the video file from which to generate the thumbnail.
    - time (str, optional): The timestamp (in HH:MM:SS) at which to capture the thumbnail. Defaults to "00:00:00".
    - width (int, optional): The width of the thumbnail. Defaults to 640 pixels.
    - height (int, optional): The height of the thumbnail. Defaults to 360 pixels.
    
    Returns:
    - str: The file path to the generated thumbnail image.
    """
    
    file_name = os.path.splitext(os.path.basename(source_path))[0]
    thumbnail_path = os.path.join(settings.MEDIA_ROOT, "thumbnails", f"{file_name}.jpg")
    cmd = '{} -i "{}" -ss {} -vframes 1 -vf "scale={}:{}" -update 1 "{}"'.format(
       FFMPEG_PATH, source_path, time, width, height, thumbnail_path
    )
    subprocess.run(cmd, shell=True)
    return thumbnail_path


def convert720p(source_path):

    """
    Convert a video to 720p resolution.
    
    This function uses the FFMPEG tool to convert a video file to 
    720p resolution and saves it with a new file name.
    
    Parameters:
    - source_path (str): The path to the original video file.
    
    Returns:
    - None
    """

    new_file_name = convert_path(source_path, "720p")
    cmd = (
        '{} -i "{}" -s hd720 -c:v libx264 -crf 23 -c:a aac -strict -2 "{}"'.format(
           FFMPEG_PATH, source_path, new_file_name
        )
    )
    subprocess.run(cmd, shell=True)


def convert360p(source_path):
    """
    Convert a video to 360p resolution.
    
    This function uses the FFMPEG tool to convert a video file to 
    360p resolution and saves it with a new file name.
    
    Parameters:
    - source_path (str): The path to the original video file.
    """
    new_file_name = convert_path(source_path, "360p")
    cmd = (
        '{} -i "{}" -s 640x360 -c:v libx264 -crf 23 -c:a aac -strict -2 "{}"'.format(
           FFMPEG_PATH, source_path, new_file_name
        )
    )
    subprocess.run(cmd, shell=True)
    

def convert120p(source_path):
    """
    Convert a video to 120p resolution.
    
    This function uses the FFMPEG tool to convert a video file to 
    120p resolution and saves it with a new file name.
    
    Parameters:
    - source_path (str): The path to the original video file.
    """
    new_file_name = convert_path(source_path, "120p")
    cmd = (
        '{} -i "{}" -s 160x120 -c:v libx264 -crf 23 -c:a aac -strict -2 "{}"'.format(
           FFMPEG_PATH, source_path, new_file_name
        )
    )
    subprocess.run(cmd, shell=True)
    

def rename_to_1080p(source_path):
    """
    Rename the original file to have '_1080p' appended.
    
    Parameters:
    - source_path (str): The path to the original video file.
    
    Returns:
    - new_file_name: The renamed file path with '_1080p'.
    """
    new_file_name = convert_path(source_path, "1080p")
    os.rename(source_path, new_file_name)
    return new_file_name


def convert_path(source_path, resolution):
    """
    Generate a new file name for the converted video based on resolution.
    
    This helper function modifies the original video file's path by appending
    the resolution suffix (e.g., '_720p') to the file name.
    
    Parameters:
    - source_path (str): The path to the original video file.
    - resolution (str): The resolution suffix (e.g., '120p', '360p', '720p', '1080p') to append to the file name.
    
    Returns:
    - str: The new file path with the resolution suffix added to the file name.
    """
    
    dot_index = source_path.rfind(".")
    base_name = source_path[:dot_index]
    ext = source_path[dot_index:]
    return f"{base_name}_{resolution}{ext}"