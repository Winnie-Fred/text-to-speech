#!/bin/bash

# Start supervisord in the background
supervisord -n &

# Start Celery worker
celery -A text_to_speech worker -l info &

python manage.py collectstatic --noinput

python manage.py migrate


if [ "$CREATE_SUPERUSER" = "True" ];
then
  echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')" | python manage.py shell
  echo "Created superuser"
fi

gunicorn text_to_speech.wsgi:application
