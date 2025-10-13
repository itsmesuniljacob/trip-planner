#!/bin/bash

# Quick Start Script for Trip Planner
# This script sets up the entire development environment with one command

set -e

echo "🚀 Starting Trip Planner Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

echo "📦 Building and starting services..."

# Start development environment
docker-compose -f docker-compose.dev.yml up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
echo "🗄️  Waiting for database..."
until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres -d trip_planner_dev > /dev/null 2>&1; do
    sleep 2
done

echo "🔄 Running database migrations..."
docker-compose -f docker-compose.dev.yml exec -T backend npm run db:migrate:dev

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Services available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   Database: localhost:5433"
echo ""
echo "📊 Health check: http://localhost:3001/health"
echo ""
echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
echo "📝 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🎉 Happy coding!"