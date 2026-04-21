# Use an official Python runtime as a parent image
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.11-slim

# Install runtime dependencies for psycopg2 and reportlab
RUN apt-get update && apt-get install -y \
    libpq5 \
    libjpeg62-turbo \
    && rm -rf /var/lib/apt/lists/*

# Ensure logs are sent to the console immediately
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Hugging Face Spaces requires running as a non-root user (id 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy project files with ownership given to the new user
COPY --chown=user . $HOME/app

# Hugging Face exposes port 7860 by default
EXPOSE 7860

# Run collectstatic, then migrate, then start production server on port 7860 with verbose logging
CMD ["sh", "-c", "echo '==> [STARTUP] Initializing...' && python manage.py collectstatic --no-input && echo '==> [STARTUP] Collectstatic done.' && python manage.py migrate && echo '==> [STARTUP] Migration done. Starting Gunicorn...' && gunicorn core.wsgi:application --bind 0.0.0.0:7860 --access-logfile - --error-logfile -"]
