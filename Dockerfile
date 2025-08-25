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

# Install production dependencies
RUN npm ci --only=production && \
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

# Security scanning and linting
RUN npm audit && \
    # Run linting if eslint is configured
    if [ -f ".eslintrc.js" ]; then npm run lint; fi

# Expose development port
EXPOSE 3000

# Switch to non-root user
USER gamedev

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Development command
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS prod
ENV NODE_ENV=production

# Copy only necessary files
COPY --chown=gamedev:spaceinvaders \
    src/ \
    public/ \
    *.html \
    ./

# Build for production
RUN npm run build

# Expose production port
EXPOSE 80

# Switch to non-root user
USER gamedev

# Production command
CMD ["npm", "start"]

# Testing stage
FROM dev AS test
ENV NODE_ENV=test \
    # Configure test coverage requirements
    COVERAGE_THRESHOLD=80

# Run tests
CMD ["npm", "test"]