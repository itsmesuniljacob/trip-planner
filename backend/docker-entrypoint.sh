#!/bin/sh

# Docker entrypoint script for backend
# Handles database migrations and starts the application

set -e

echo "🚀 Starting backend container..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations in production mode
if [ "$NODE_ENV" = "production" ]; then
    echo "🔄 Running production migrations..."
    npx prisma migrate deploy
else
    echo "🔄 Running development migrations..."
    npx prisma db push
fi

# Generate Prisma client (in case it's not already generated)
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🎉 Backend setup complete!"

# Execute the main command
exec "$@"