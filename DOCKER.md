# Docker Setup Guide

## 🚀 Quick Start

### Option 1: Use the Start Script (Easiest)
```bash
./start.sh
```
Follow the prompts to choose production or development mode.

### Option 2: Direct Docker Commands

#### Production Mode (Recommended for Prototyping)
```bash
docker-compose up --build
```
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health

#### Development Mode (Hot Reload)
```bash
docker-compose -f docker-compose.dev.yml up --build
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📋 What's Included

### Production Setup
- **Frontend**: Nginx-served React app with optimized build
- **Backend**: Node.js Express API server
- **Reverse Proxy**: Nginx handles API routing and static files
- **Health Checks**: Automatic service health monitoring
- **Security**: Basic security headers and gzip compression

### Development Setup
- **Hot Reload**: Both frontend and backend auto-reload on changes
- **Volume Mounts**: Live code editing without rebuilds
- **Debug Friendly**: Full development dependencies available

## 🛠️ Docker Commands

```bash
# Start services
docker-compose up --build                    # Production
docker-compose -f docker-compose.dev.yml up --build  # Development

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild everything
docker-compose up --build --force-recreate

# Clean up (removes containers, networks, volumes)
docker-compose down -v --remove-orphans

# Remove all images
docker system prune -a
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Set to 'production' or 'development'
- `PORT`: Backend port (default: 3001)
- `VITE_API_URL`: Frontend API URL (development only)

### Ports
- **Production**: 80 (frontend), 3001 (backend internal)
- **Development**: 5173 (frontend), 3001 (backend)

### Volumes (Development)
- Source code is mounted for live editing
- `node_modules` are preserved in containers
- Configuration files are mounted for hot reload

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (React/Vite)  │    │   (Node/Express)│
│   Port: 80/5173 │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
         ┌─────────────────┐
         │   Nginx Proxy   │
         │   (Production)  │
         │   Port: 80      │
         └─────────────────┘
```

## 🚨 Troubleshooting

### Port Conflicts
If ports 80, 3001, or 5173 are in use:
```bash
# Check what's using the port
lsof -i :80
lsof -i :3001
lsof -i :5173

# Stop conflicting services or modify docker-compose.yml ports
```

### Build Issues
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Permission Issues (Linux/macOS)
```bash
# Make start script executable
chmod +x start.sh

# Fix file permissions
sudo chown -R $USER:$USER .
```

## 📦 Image Sizes
- **Backend**: ~150MB (Node.js 20 Alpine-based)
- **Frontend**: ~25MB (Nginx + static files)
- **Total**: ~175MB for complete application

## 🔒 Security Features
- Non-root user in containers
- Security headers in Nginx
- Health checks for service monitoring
- Minimal attack surface with Alpine Linux