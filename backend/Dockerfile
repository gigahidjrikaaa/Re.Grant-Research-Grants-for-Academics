FROM python:alpine

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE 1
# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copy requirements.txt first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# The PORT environment variable will be set by docker-compose.yml (e.g., 5000)
# The application (e.g., FastAPI/Uvicorn) should listen on 0.0.0.0 and this port.
# Replace `main:app` with your actual Python module and FastAPI app instance name if different.
# For example, if your main file is `app/server.py` and FastAPI instance is `fastapi_app`,
# it would be `app.server:fastapi_app`.
# This CMD assumes your app reads the PORT env var or you hardcode it to 5000 in the app.
# If Uvicorn needs to take the port from $PORT env var directly in CMD:
# CMD sh -c "uvicorn main:app --host 0.0.0.0 --port $PORT"
# However, the current docker-compose sets PORT=5000, so this is fine:
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]