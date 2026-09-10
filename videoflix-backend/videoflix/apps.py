from django.apps import AppConfig


class VideoflixConfig(AppConfig):
    """
    Configuration class for the 'videoflix' application.

    This class defines some basic configuration for the app, such as its name 
    and the default type of primary key fields for models. Additionally, 
    it contains a 'ready' method which is called when the app is fully 
    loaded and ready to be used.
    
    Attributes:
    - default_auto_field: Defines the default primary key field type for the models in the app. 
                          In this case, it's set to 'BigAutoField', which is an integer field.
    - name: Specifies the name of the application, which is 'videoflix'.
    
    Methods:
    - ready: This method is automatically called when the application is ready. 
             It's used here to import and register signal handlers.
    """
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'videoflix'
    
    def ready(self):
        """
        This method is called once the app is ready.

        In this method, we import the 'signals' module, which contains the signal handlers 
        that are used to automatically perform certain actions based on specific events 
        (like model save or delete).
        """
        
        from . import signals
