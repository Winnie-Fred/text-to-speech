from django.urls import path
from . import views

app_name = 'text_to_speech'

urlpatterns = [
    path('', views.home, name='home'),
    path('convert_entered_text', views.convert_entered_text, name='convert_entered_text')

]
