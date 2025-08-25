# syntax=docker/dockerfile:1.4

# ===== Stage 1: Development =====
FROM node:20.9-slim AS development
LABEL maintainer="Space Invaders JS Team"
LABEL description="Development environment for Space Invaders JS"

# Set working directory
WORKDIR /app

# Install development dependencies and security updates
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 install --no-cache-dir pytest pytest-cov

# Copy project files
COPY . .

# Install Node.js dependencies (if package.json exists)
# Note: Currently no package.json in project, but prepared for future
ONBUILD COPY package*.json ./
ONBUILD RUN if [ -f package.json ]; then npm install; fi

# Development port exposure
EXPOSE 3000

# Default development command
CMD ["python3", "-m", "http.server", "3000"]

# ===== Stage 2: Testing =====
FROM development AS testing

# Install additional testing dependencies
RUN pip3 install --no-cache-dir \
    selenium \
    webdriver_manager \
    pytest-xdist

# Run tests
CMD ["pytest", "tests/", "-v", "--cov=src"]

# ===== Stage 3: Production Build =====
FROM node:20.9-slim AS builder
WORKDIR /build

# Copy only necessary files for production
COPY src/ ./src/
COPY index.html ./
COPY src/styles/ ./src/styles/

# Production optimization placeholder
# (Future: Add minification, bundling when build tools are added)

# ===== Stage 4: Production Runtime =====
FROM nginx:1.25-alpine AS production
LABEL maintainer="Space Invaders JS Team"
LABEL description="Production environment for Space Invaders JS"

# Install security updates
RUN apk update && apk upgrade && \
    rm -rf /var/cache/apk/*

# Copy built files from builder stage
COPY --from=builder /build/ /usr/share/nginx/html/

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
    add_header Content-Security-Policy "default-src '\''self'\''; img-src '\''self'\'' data:; style-src '\''self'\'' '\''unsafe-inline'\''"; \
    # Compression \
    gzip on; \
    gzip_types text/plain text/css application/javascript; \
    # Cache control \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ { \
        expires 30d; \
        add_header Cache-Control "public, no-transform"; \
    } \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose production port
EXPOSE 80

# Use non-root user for security
RUN adduser -D -H -u 1000 -s /sbin/nologin www-data
USER www-data

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Default command uses nginx's default entrypoint