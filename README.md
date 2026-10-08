# Google Workspace Command Center (GWCC)

## Backend Setup

### 1. Database & Environment
1. Activate virtual environment: `.\.venv\Scripts\Activate` (Windows) or `source .venv/bin/activate` (Mac/Linux)
2. Navigate to backend: `cd backend`
3. Install dependencies: `pip install -r requirements.txt`
4. Run migrations: `python manage.py migrate`

### 2. Google Cloud Console Setup (OAuth & APIs)
For the app to successfully communicate with Google Workspace, you must set up the OAuth credentials and enable the required APIs:

1. **OAuth Redirect URI Setup:**
   - In your Google Cloud Console, navigate to **APIs & Services > Credentials**.
   - Under your OAuth 2.0 Client ID, ensure you add `http://localhost:8001/api/auth/google/callback/` to the **Authorized redirect URIs** (do *not* confuse this with Authorized JavaScript origins).
   - Ensure your `backend/.env` file contains the exact same redirect URI: 
     `GOOGLE_REDIRECT_URI=http://localhost:8001/api/auth/google/callback/`

2. **Enable Google Workspace APIs:**
   - By default, Google Cloud projects have Workspace APIs disabled. You **must** manually enable them, otherwise you will receive a 403 Forbidden error (e.g., "Google Calendar authorization is invalid or unavailable").
   - Navigate to the **Library** in Google Cloud Console (or search the top bar) and **Enable** the following APIs:
     - **Google Calendar API**
     - **Google Drive API**
     - **Google Sheets API**
     - **Gmail API**

### 3. Redis Setup (Required for Celery)
We use Redis as the message broker and result backend for Celery. You can quickly start it using Docker:
For this command to work make sure you have docker running in your background...
```bash
docker run -d -p 6379:6379 --name gwcc-redis redis
```

### 4. Running the Services
To fully run the backend, you will need to open **three separate terminal windows** (ensure your virtual environment is activated and you are in the `backend/` directory in each one):

**Terminal 1: Django API Server**
*Note: We run the server on port 8001 to match our configured Google OAuth redirect URI.*
```bash
python manage.py runserver 8001
```

**Terminal 2: Celery Worker** (Executes background tasks)
*Note: Windows requires the `--pool=solo` flag.*
```bash
celery -A config worker -l info --pool=solo
```

**Terminal 3: Celery Beat** (Triggers scheduled tasks)
```bash
celery -A config beat -l info
```

## Running Tests
To run the complete test suite:
```bash
python manage.py test
```