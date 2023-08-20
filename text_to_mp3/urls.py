from django.urls import path, re_path
from . import views

app_name = 'text_to_mp3'

urlpatterns = [
    path('', views.home, name='home'),
    path('convert_input_text', views.convert_input_text, name='convert_input_text'),
    path('convert_file_content', views.convert_file_content, name='convert_file_content'),
    re_path(r'^(?P<task_id>[\w-]+)/$', views.get_conversion_progress, name='task_status'),
    re_path(r'^abort_task/(?P<task_id>[\w-]+)/$', views.abort_task, name='abort_task'),

]
