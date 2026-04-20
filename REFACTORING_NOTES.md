# Refactoring & Improvements — Completed

## What Was Done

### Security Fixes (Critical)
- [x] `.env` added to `.gitignore` and removed from git tracking
- [x] New `SECRET_KEY` generated (replaced default insecure key)
- [x] `ALLOWED_HOSTS` changed from `['*']` to configurable via `.env`
- [x] JWT tokens now stored in **HTTP-only cookies** (XSS-resistant)
  - Backend: `users/cookie_utils.py`, `core/authentication.py`, updated auth views
  - Frontend: `api.ts` now uses `withCredentials: true`, removed client-side cookie setting
  - Frontend: `AuthContext.tsx` simplified — no more token management
- [x] Rate limiting added to `scan_receipt` endpoint (20/hour)
- [x] `page_size` capped at 100 (prevent `?page_size=10000` abuse)

### Performance Optimizations
- [x] Database indexes added to all models:
  - `Expense`: `(user, date)`, `(user, category)`, `(user, is_recurring)`, `(date, amount)`
  - `Income`: Same indexes
  - `Budget`: `(user, month, year)`, `(user, category)`
  - `SavingsGoal`: `(user)`, `(user, deadline)`
  - `Category`: `(user)`, `(user, category_type)`
  - `User`: `(email)`, `(telegram_chat_id)`
- [x] `select_related('category')` added to Expense and Income ViewSets (fixes N+1 queries)
- [x] Shared date-range utility created: `summary/date_utils.py`
- [x] Shared PDF service module created: `summary/pdf_service.py`

### Code Quality
- [x] Savings `add_money` validation improved (TypeError handling, overfunding warning)
- [x] `.env.example` updated with proper placeholder values and instructions

### Feature Completion
- [x] Savings add_money validation (positive amount check, overfunding warning)

## Remaining Work (Not Yet Done)

### Summary Views Refactoring
The `summary/views.py` file (767 lines) should be split into:
- `views/monthly.py` — MonthlySummaryView
- `views/weekly.py` — WeeklySummaryView
- `views/trend.py` — TrendSummaryView
- `views/insights.py` — InsightsSummaryView
- `views/activity.py` — RecentActivityView
- `views/reports.py` — DownloadReportView, ComparisonReportView
- `views/comparison.py` — ComparisonSummaryView

Each should import from `date_utils.py` and `pdf_service.py`.

### Recurring Transactions Auto-Generation
Models have `is_recurring` and `recurrence_type` fields but no automation.
Create a Django management command:
```python
python manage.py generate_recurring_transactions
```
This should:
1. Find all expenses/income with `is_recurring=True`
2. Check if a transaction for this period already exists
3. Create new entries for the current period if missing

### Testing
- Set up `pytest-django`
- Write tests for:
  - Auth endpoints (register, login, token refresh, logout)
  - CRUD endpoints (expenses, income, budgets, savings)
  - Summary endpoints
  - Rate limiting on scan_receipt

### Infrastructure
- Create `Dockerfile` for Django backend
- Create `Dockerfile` for Next.js frontend
- Create `docker-compose.yml` with:
  - Django service
  - Next.js service
  - PostgreSQL service
  - Redis service (for caching + Celery)

## How to Apply Changes

1. **Rotate ALL exposed secrets** — The old credentials were in git history. You MUST:
   - Create a new Supabase database password (or use a new database)
   - Delete and recreate your Gmail App Password at https://myaccount.google.com/apppasswords
   - Revoke and recreate your Telegram Bot Token via @BotFather
   - Delete and recreate your Gemini API Key at https://aistudio.google.com/app/apikey
   - Update all values in `backend/.env`

2. **Run database migrations** for the new indexes:
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Update `.env`** — Set a proper `ALLOWED_HOSTS` value if deploying to production.

4. **Frontend rebuild** — The frontend now relies on HTTP-only cookies for auth. Make sure your backend and frontend are on the same domain (or use proper CORS with credentials).

## Breaking Changes

### JWT Auth Flow
- **Before**: Frontend stored tokens in regular cookies via `js-cookie`, sent `Authorization: Bearer` header
- **After**: Backend sets HTTP-only cookies on login/register/refresh. Frontend no longer handles tokens.
- **Migration**: Users will need to log in again after this change (old cookies won't work).

### Auth API Response Format
- **Before**: Login/register returned `{ user, access, refresh }`
- **After**: Login/register returns `{ user }` only. Tokens are in cookies.
- **Frontend**: `login()` function signature changed from `login(access, refresh, user)` to `login(user)`.
