# Google Workspace Command Center (GWCC)

## Backend Setup

### 1. Database & Environment
1. Activate virtual environment: `.\.venv\Scripts\Activate` (Windows) or `source .venv/bin/activate` (Mac/Linux)
2. Navigate to backend: `cd backend`
3. Install dependencies: `pip install -r requirements.txt`
4. Run migrations: `python manage.py migrate`

### 2. Redis Setup (Required for Celery)
We use Redis as the message broker and result backend for Celery. You can quickly start it using Docker:
For this command to work make sure you have docker running in your background...
```bash
docker run -d -p 6379:6379 --name gwcc-redis redis
```

### 3. Running the Services
To fully run the backend, you will need to open **three separate terminal windows** (ensure your virtual environment is activated and you are in the `backend/` directory in each one):

**Terminal 1: Django API Server**
```bash
python manage.py runserver
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