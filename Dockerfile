# Space Invaders JS Development Environment
# Production-ready Dockerfile with multi-stage build
# Optimized for development, testing, and production builds

# -----------------------------
# Stage 1: Development
# -----------------------------
FROM node:20-alpine AS development

# Security: Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Install development dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl \
    # Required for node-gyp
    python3 \
    # Required for better security scanning
    trivy \
    && rm -rf /var/cache/apk/*

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Security: Set secure defaults
ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_AUDIT=true \
    NPM_CONFIG_AUDIT_LEVEL=moderate \
    # Prevent npm from running scripts automatically
    NPM_CONFIG_IGNORE_SCRIPTS=true \
    # Set strict SSL
    NPM_CONFIG_STRICT_SSL=true

# Switch to non-root user
USER appuser

# Expose development port
EXPOSE 3000

# Default command for development
CMD ["npm", "run", "dev"]

# -----------------------------
# Stage 2: Testing
# -----------------------------
FROM development AS testing

USER root
WORKDIR /app

# Install test-specific dependencies
RUN apk add --no-cache \
    chromium \
    firefox

# Switch back to non-root user
USER appuser

# Default command for testing
CMD ["npm", "run", "test"]

# -----------------------------
# Stage 3: Production Build
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only necessary files
COPY --chown=node:node . .

# Install production dependencies
RUN npm ci --only=production && \
    npm run build

# -----------------------------
# Stage 4: Production Runtime
# -----------------------------
FROM nginx:alpine AS production

# Security: Run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built assets from builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Security headers and configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN"; \
    add_header X-XSS-Protection "1; mode=block"; \
    add_header X-Content-Type-Options "nosniff"; \
    add_header Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\''"; \
    add_header Referrer-Policy "strict-origin-when-cross-origin"; \
    # Gzip compression \
    gzip on; \
    gzip_types text/plain text/css application/javascript; \
    # Cache control \
    location /static/ { \
        expires 1y; \
        add_header Cache-Control "public, no-transform"; \
    } \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Switch to non-root user
USER appuser

# Expose production port
EXPOSE 80

# Health check for production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/health || exit 1

# No CMD needed as nginx will start automatically