-- Database initialization script for production
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (though it should be created by POSTGRES_DB)
-- SELECT 'CREATE DATABASE trip_planner' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'trip_planner')\gexec

-- Set up any additional database configuration
-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The actual schema will be created by Prisma migrations
-- This file is mainly for any additional setup that might be needed