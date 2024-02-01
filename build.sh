#!/bin/bash

pip install -r requirements.txt

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
else
    python manage.py runserver 0.0.0.0:8000
fi