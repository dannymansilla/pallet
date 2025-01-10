# backend/Dockerfile
# Use the official Python image as a parent image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run the Django server
CMD ["python", "palletproject/manage.py", "runserver", "0.0.0.0:8000"]