#!/bin/bash

# Start supervisord in the background
supervisord -n &

# Start Celery worker
celery -A text_to_speech worker -l info &


# Start Django server
if [ -n "$RENDER" ]; then
    python manage.py collectstatic --noinput
    if [[ $CREATE_SUPERUSER ]];
    then
    python manage.py createsuperuser --no-input
    fi
    python manage.py migrate
    gunicorn text_to_speech.wsgi:application
else
    python manage.py runserver 0.0.0.0:8000
fi