#!/bin/bash
# scripts/deploy.sh
# GitHub Pages deployment helper script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 GitHub Pages Deployment Script${NC}"
echo "=================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Get current branch and PR info
CURRENT_BRANCH=$(git branch --show-current)
PR_NUMBER=""

if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then
    PR_NUMBER=$GITHUB_EVENT_NUMBER
    echo -e "${YELLOW}📋 PR Mode: Deploying PR #${PR_NUMBER}${NC}"
elif [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${YELLOW}🌟 Main Mode: Deploying to production${NC}"
else
    echo -e "${YELLOW}🔧 Development Mode: Branch ${CURRENT_BRANCH}${NC}"
fi

# Set base path for GitHub Pages
if [ -n "$PR_NUMBER" ]; then
    export GITHUB_PAGES_BASE="/space-invaders-js-v100/pr-${PR_NUMBER}/"
    TARGET_DIR="deploy/pr-${PR_NUMBER}"
elif [ "$CURRENT_BRANCH" = "main" ]; then
    export GITHUB_PAGES_BASE="/space-invaders-js-v100/"
    TARGET_DIR="deploy"
else
    export GITHUB_PAGES_BASE="/space-invaders-js-v100/dev-${CURRENT_BRANCH}/"
    TARGET_DIR="deploy/dev-${CURRENT_BRANCH}"
fi

echo -e "${GREEN}📂 Base Path: ${GITHUB_PAGES_BASE}${NC}"
echo -e "${GREEN}🎯 Target Directory: ${TARGET_DIR}${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm ci
fi

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Create deployment directory
echo -e "${YELLOW}📁 Creating deployment directory...${NC}"
mkdir -p "$TARGET_DIR"

# Copy built files
echo -e "${YELLOW}📋 Copying built files...${NC}"
cp -r dist/* "$TARGET_DIR/"

# Generate deployment info
cat > "$TARGET_DIR/deployment-info.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "branch": "$CURRENT_BRANCH",
  "commit": "$(git rev-parse HEAD)",
  "pr_number": "$PR_NUMBER",
  "base_path": "$GITHUB_PAGES_BASE",
  "build_info": {
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)"
  }
}
EOF

echo -e "${GREEN}✅ Deployment prepared successfully!${NC}"
echo -e "${GREEN}📍 Files ready in: ${TARGET_DIR}${NC}"

if [ -n "$PR_NUMBER" ]; then
    echo -e "${GREEN}🌐 Preview URL will be: https://seunakintola.github.io/space-invaders-js-v100/pr-${PR_NUMBER}/${NC}"
elif [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${GREEN}🌐 Production URL will be: https://seunakintola.github.io/space-invaders-js-v100/${NC}"
fi
