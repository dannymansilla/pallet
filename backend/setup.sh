#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! python manage.py check > /dev/null 2>&1; do
    sleep 1
done

# Create migrations for all apps
echo "Creating migrations..."
python manage.py makemigrations accounts
python manage.py makemigrations inventory auctions orders integrations notifications

# Apply migrations
echo "Applying migrations..."
python manage.py migrate

# Initialize database with admin user and organization
echo "Initializing database..."
python manage.py init_db

echo "Setup complete!" 