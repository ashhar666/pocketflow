# Expense Tracker Backend API

This is the Django REST Framework backend for the Expense Tracker SaaS.

## Prerequisites
- Python 3.8+
- pip

## Setup Instructions

1. **Create and activate a virtual environment (optional but recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Setup**
   Ensure `.env.example` is copied to `.env` (or configure your variables appropriately).
   ```bash
   copy .env.example .env
   ```

4. **Run Migrations**
   ```bash
   python manage.py makemigrations users categories expenses budgets savings
   python manage.py migrate
   ```

5. **Start the Development Server**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Auth
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns JWT)
- `POST /api/auth/logout/` - Logout (blacklists refresh token)
- `POST /api/auth/token/refresh/` - Refresh JWT
- `PUT /api/auth/change-password/` - Change password

### Core Apps
- `GET/POST /api/categories/` - Categories CRUD
- `GET/POST /api/expenses/` - Expenses CRUD and tracking
- `GET /api/expenses/export/` - Download expenses as CSV
- `GET/POST /api/budgets/` - Budgets CRUD
- `GET/POST /api/savings/` - Savings Goals CRUD

### Summary & Analytics
- `GET /api/summary/monthly/`
- `GET /api/summary/weekly/`
- `GET /api/summary/trend/`
- `GET /api/summary/insights/`
