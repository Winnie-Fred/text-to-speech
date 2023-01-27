from django.urls import path
from . import views

app_name = 'text_to_speech'

urlpatterns = [
    path('', views.home, name='home'),
    path('convert_input_text', views.convert_input_text, name='convert_input_text'),
    path('convert_file_content', views.convert_file_content, name='convert_file_content'),

]
