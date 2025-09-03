# syntax=docker/dockerfile:1.4
# Space Invaders JS Development Environment
# Optimized for development workflow with security and performance considerations

# Use Node.js LTS with Alpine for minimal attack surface
FROM node:20-alpine AS base

# Set secure defaults
ENV NODE_ENV=development \
    # Reduce npm verbosity and disable update notifications
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    # Ensure proper handling of Node.js processes
    NODE_OPTIONS="--max-old-space-size=4096" \
    # Set secure permissions
    NPM_CONFIG_UNSAFE_PERM=false

# Create non-root user for security
RUN addgroup -S spaceinvaders && \
    adduser -S -G spaceinvaders gamedev && \
    mkdir -p /app && \
    chown -R gamedev:spaceinvaders /app

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY --chown=gamedev:spaceinvaders package*.json ./

# Install ALL dependencies (production will be stripped later if needed)
RUN npm ci --ignore-scripts && \
    # Clean npm cache
    npm cache clean --force

# Development dependencies stage
FROM base AS dev
ENV NODE_ENV=development

# Install development dependencies
RUN npm ci && \
    # Add common development tools
    apk add --no-cache \
        git \
        curl \
        python3 \
        make \
        g++ \
        # Required for some npm packages
        python3-dev

# Copy source code
COPY --chown=gamedev:spaceinvaders . .

# Create vite cache directory with proper permissions
RUN mkdir -p /app/node_modules/.vite && \
    chown -R gamedev:spaceinvaders /app/node_modules && \
    chmod -R 755 /app/node_modules

# Security scanning and linting
RUN npm audit || true && \
    # Run linting if eslint is configured
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then npm run lint; fi

# Switch to non-root user before exposing ports
USER gamedev

# Expose development port (Vite default is 5173)
EXPOSE 5173

# Health check on correct port
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5173/ || exit 1

# Development command
CMD ["npm", "run", "start"]

# Production build stage
FROM base AS prod
ENV NODE_ENV=production

# Copy source files needed for build
COPY --chown=gamedev:spaceinvaders src/ ./src/
COPY --chown=gamedev:spaceinvaders index.html ./
COPY --chown=gamedev:spaceinvaders vite.config.js ./

# Build for production
RUN npm run build

# Expose production port
EXPOSE 80

# Switch to non-root user
USER gamedev

# Production command - serve the built files
CMD ["npm", "run", "start:prod"]

# Testing stage
FROM dev AS test
ENV NODE_ENV=test \
    # Configure test coverage requirements
    COVERAGE_THRESHOLD=80

# Run tests
CMD ["npm", "test"]