#!/bin/sh
set -e
python manage.py makemigrations
python manage.py migrate
uvicorn eduskill.asgi:application --host 0.0.0.0 --port 8000

