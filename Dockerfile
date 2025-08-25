# -----------------------------
# Stage 1: Development
# -----------------------------
FROM node:18-alpine AS development

# Security: Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Install development dependencies
COPY package*.json ./
RUN npm ci --only=development

# Copy source code
COPY . .

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Development server
CMD ["npm", "run", "dev"]

# -----------------------------
# Stage 2: Testing
# -----------------------------
FROM development AS testing

# Run tests
CMD ["npm", "run", "test"]

# -----------------------------
# Stage 3: Build
# -----------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Build production assets
RUN npm run build

# -----------------------------
# Stage 4: Production
# -----------------------------
FROM nginx:alpine AS production

# Security: Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Security: Remove default nginx user
RUN rm /etc/nginx/conf.d/default.conf

# Set correct permissions
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Security headers
RUN echo "add_header X-Frame-Options 'SAMEORIGIN';" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header X-Content-Type-Options 'nosniff';" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header X-XSS-Protection '1; mode=block';" >> /etc/nginx/conf.d/security.conf

# Use non-root user
USER appuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]