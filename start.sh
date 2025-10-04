#!/bin/bash

# Group Trip Planner - Quick Start Script

echo "🚀 Starting Group Trip Planner..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Ask user which mode to run
echo "Choose running mode:"
echo "1) Production (recommended for demos)"
echo "2) Development (with hot reload)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "🏗️  Building and starting in production mode..."
        echo "Frontend will be available at: http://localhost"
        echo "Backend API will be available at: http://localhost/api"
        echo ""
        docker-compose up --build
        ;;
    2)
        echo ""
        echo "🏗️  Building and starting in development mode..."
        echo "Frontend will be available at: http://localhost:5173"
        echo "Backend API will be available at: http://localhost:3001"
        echo ""
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
        exit 1
        ;;
esac