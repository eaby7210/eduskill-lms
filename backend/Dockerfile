# Base image using Alpine Linux and Python 3.12
FROM python:3.12-alpine AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=eduskill.settings

# Set work directory
WORKDIR /app

# Install dependencies for Alpine Linux
RUN apk update && \
    apk add --no-cache gcc musl-dev libffi-dev postgresql-dev libmagic python3-dev build-base \
    ffmpeg && \
    rm -rf /var/cache/apk/*

# Create a non-root user
RUN addgroup -S django && adduser -S django -G django

# Install pipenv
RUN pip install --upgrade pip --no-cache-dir && \
    pip install pipenv --no-cache-dir

# Copy dependency files
COPY --chown=django:django Pipfile Pipfile.lock ./

# Install project dependencies
RUN pipenv install --system --deploy --ignore-pipfile

# Copy project files into the container
COPY --chown=django:django . .



# Backend stage
FROM base AS backend
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate && uvicorn eduskill.asgi:application --host 0.0.0.0 --port 8000"]

# Celery stage
FROM base AS celery
CMD ["celery", "-A", "eduskill.celery:app", "worker", "--loglevel=info"]