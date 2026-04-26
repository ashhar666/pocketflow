# PocketFlow Deployment Guide

This guide covers deploying PocketFlow with **Vercel (Frontend)** and **Hugging Face Spaces (Backend)**.

---

## Architecture

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   Vercel (Frontend)     │ ──────► │  Hugging Face (Backend) │
│   Next.js + Tailwind    │  API    │   Django REST API       │
│   pocketflow.vercel.app │         │   pocketflow.hf.space    │
└─────────────────────────┘         └─────────────────────────┘
                                         │
                                         ▼
                                  ┌─────────────────┐
                                  │   Neon DB       │
                                  │   PostgreSQL    │
                                  └─────────────────┘
```

---

## Part 1: Hugging Face Spaces (Backend)

### Step 1: Create the Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click **Create New Space**
3. Fill in:
   - **Owner**: Your username
   - **Space name**: `pocketflow-backend` (or your choice)
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU (2 vCPU) - free tier
4. Click **Create Space**

### Step 2: Add Secrets

In your Space settings, add these secrets:

| Secret Name | Value |
|-------------|-------|
| `DEBUG` | `False` |
| `SECRET_KEY` | `<generate-a-new-secret-key>` |
| `DATABASE_URL` | `postgresql://<user>:<password>@<host>/<db>?sslmode=require` |
| `CORS_ALLOWED_ORIGINS` | `https://<your-frontend-domain>` |
| `TELEGRAM_WEBHOOK_SECRET` | `<generate-a-random-secret>` |
| `TELEGRAM_BOT_TOKEN` | `<your-telegram-bot-token>` |
| `GEMINI_API_KEY` | `<your-google-ai-api-key>` |
| `FRONTEND_URL` | `https://<your-frontend-domain>` |
| `EMAIL_HOST_USER` | `<your-gmail-address>` |
| `EMAIL_HOST_PASSWORD` | `<your-gmail-app-password>` |

### Step 3: Prepare Backend Files

The Hugging Face Space needs these files in the root:

```
pocketflow/
├── backend/
│   ├── core/
│   ├── users/
│   ├── expenses/
│   ├── ...
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile  ← Create this
├── frontend/ (can be empty or excluded)
└── README.md
```

### Step 4: Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# PocketFlow Backend - Hugging Face Spaces
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy Django app
COPY backend/ .

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run with gunicorn
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
```

### Step 5: Push to Hugging Face

```bash
# Clone your space
git clone https://huggingface.co/spaces/YOUR_USERNAME/pocketflow-backend

# Add your backend files
cp -r backend/* pocketflow-backend/

# Push changes
cd pocketflow-backend
git add .
git commit -m "Deploy PocketFlow backend"
git push
```

### Step 6: Run Migrations

In HF Space settings, create a **Repository secret** with your HF token, then add a **Build command** or manually run:

```bash
python manage.py migrate
```

Your backend will be at: `https://YOUR_USERNAME-pocketflow-backend.hf.space`

---

## Part 2: Vercel (Frontend)

### Step 1: Prepare Frontend

Update `backend/frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://your-hf-space.hf.space/api
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `backend/frontend` (or `frontend`)
   - **Output Directory**: `.next`
5. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR_HF_SPACE.hf.space/api` |
| `NODE_ENV` | `production` |

6. Click **Deploy**

Your frontend will be at: `https://pocketflow.vercel.app`

---

## Part 3: Connect Telegram Webhook

After both deployments:

```bash
# Set the webhook URL
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://YOUR_HF_SPACE.hf.space/api/telegram/webhook/" \
  -d "secret_token=YOUR_TELEGRAM_WEBHOOK_SECRET"
```

---

## Part 4: Verify Deployment

### Health Check
```
GET https://your-hf-space.hf.space/api/health/
```

Expected response:
```json
{"status": "healthy", "database": "ok"}
```

### Test API
```
GET https://your-hf-space.hf.space/api/summary/monthly/
```

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ALLOWED_ORIGINS` in Hugging Face includes your Vercel URL

### 500 Errors
- Check Hugging Face logs in Space settings
- Run migrations: `python manage.py migrate`

### Telegram Not Working
- Verify webhook: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Ensure `TELEGRAM_WEBHOOK_SECRET` matches

---

## Quick Commands

```bash
# Generate new SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Run health check
python health_check.py

# Test Telegram webhook manually
curl -X POST "https://your-hf-space.hf.space/api/telegram/webhook/" \
  -H "Content-Type: application/json" \
  -d '{"message": {"chat": {"id": "YOUR_CHAT_ID"}, "text": "/start"}}'
```

---

**Last Updated**: April 2026
**Version**: 1.4.0
