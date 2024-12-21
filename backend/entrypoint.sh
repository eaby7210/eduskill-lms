#!/bin/sh
set -e
python manage.py migrate
python manage.py collectstatic --noinput
tmux new-session -d -s django "uvicorn eduskill.asgi:application --host 0.0.0.0 --port 8000"
tmux new-session -d -s celery "celery -A eduskill.celery:app worker --loglevel=info"
tmux attach-session -t django