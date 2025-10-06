# Backend Dockerfile
FROM node:20-alpine

# Install curl for health checks and other utilities
RUN apk add --no-cache curl openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for Prisma)
RUN npm ci

# Copy Prisma schema first (for better caching)
COPY prisma ./prisma

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run build

# Keep Prisma CLI for migrations in production
RUN npm prune --production && npm install prisma

# Copy and set up entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
RUN chown nodejs:nodejs /usr/local/bin/docker-entrypoint.sh
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Set entrypoint and default command
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]