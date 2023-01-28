from django.contrib import admin

# Register your models here.
from django.contrib import admin
 
# Register your models here.
from .models import SpeechFile
 
@admin.register(SpeechFile)
class SpeechAdmin(admin.ModelAdmin):
   pass