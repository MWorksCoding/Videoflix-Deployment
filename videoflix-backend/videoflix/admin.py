from django.contrib import admin
from django.contrib.auth import get_user_model
from authemail.admin import EmailUserAdmin
from.models import Video
from import_export import resources
from import_export.admin import ImportExportModelAdmin

class MyUserAdmin(EmailUserAdmin):
    """
    Custom admin configuration for the User model.

    This class extends 'EmailUserAdmin' to provide custom configurations for displaying
    and managing users in the Django admin interface.

    Attributes:
    - fieldsets: Defines the organization of fields in the user admin interface.
      It includes fields like email, password, personal info, permissions, and custom fields.
    """
    fieldsets = (
		(None, {'fields': ('email', 'password')}),
		('Personal Info', {'fields': ('first_name', 'last_name')}),
		('Permissions', {'fields': ('is_active', 'is_staff', 
									   'is_superuser', 'is_verified', 
									   'groups', 'user_permissions')}),
		('Important dates', {'fields': ('last_login', 'date_joined')})
	)

class VideoResource(resources.ModelResource):
    class Meta:
        model = Video
    """
    Custom resource class for handling Video data import and export.
    This class extends the 'ModelResource' class provided by the 'django-import-export'
    package and allows for the import and export of 'Video' model data through the admin interface.
    """
 
class VideoAdmin(ImportExportModelAdmin):
    pass
    """
	Custom admin configuration for the Video model with import/export functionality
	This class extends 'ImportExportModelAdmin', which integrates the 'django-import-export'
	package, enabling the import and export of Video records in the Django admin interface.
	"""

@admin.register(Video)
class VideoAdmin(ImportExportModelAdmin):
    pass
    """
    Registers the 'Video' model with the Django admin site using the custom 'VideoAdmin' class.
    This class includes import/export functionality.
    """

# Unregister the default user model to use the custom 'MyUserAdmin' configuration.
admin.site.unregister(get_user_model())
admin.site.register(get_user_model(), MyUserAdmin)

"""
Unregister the default user model to use the custom 'MyUserAdmin' configuration.
"""
