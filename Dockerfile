# Base image using Alpine Linux and Python 3.12
FROM python:3.12-alpine

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

# Install pipenv
RUN pip install --upgrade pip --no-cache-dir && \
    pip install pipenv --no-cache-dir

# Copy Pipfile and Pipfile.lock
COPY Pipfile Pipfile.lock ./

# Install project dependencies
RUN pipenv install --system --deploy

# Copy project files into the container
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run migrations and start the development server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000 && uvicorn eduskill.asgi:application --host 0.0.0.0 --port 8000"]
