#!/bin/bash

# Start supervisord in the background
supervisord -n &

# Start Celery worker
celery -A text_to_speech worker -l info &


# Start Django server
if [ -n "$LIVE" ]; then
    gunicorn text_to_speech.wsgi:application -c gunicorn_config.py
else
    python manage.py runserver 0.0.0.0:8000
fi