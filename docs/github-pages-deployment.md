# GitHub Pages Deployment Guide

This project is configured for automatic deployment to GitHub Pages with PR previews.

## 🚀 Automatic Deployments

### Production Deployment
- **Trigger**: Push to `main` branch
- **URL**: https://seunakintola.github.io/space-invaders-js-v100/
- **Workflow**: Runs after all tests pass

### PR Preview Deployments
- **Trigger**: Opening/updating a Pull Request
- **URL Pattern**: https://seunakintola.github.io/space-invaders-js-v100/pr-{PR_NUMBER}/
- **Workflow**: Runs after tests and performance checks pass

## 🔧 Setup Requirements

### Repository Settings
1. Go to Settings → Pages
2. Set Source to "GitHub Actions"
3. Enable "Enforce HTTPS"

### Required Permissions
The workflow requires these permissions:
- `contents: read` - To checkout the repository
- `pages: write` - To deploy to GitHub Pages
- `id-token: write` - For secure deployment

### Environment Variables
- `GITHUB_PAGES_BASE`: Set automatically based on deployment context
  - Production: `/space-invaders-js-v100/`
  - PR Preview: `/space-invaders-js-v100/pr-{number}/`

## 📋 Manual Deployment

You can manually trigger deployments using the deployment script:

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment preparation
./scripts/deploy.sh
```

## 🧪 Testing Deployments Locally

To test how the app will look when deployed:

```bash
# Build with GitHub Pages base path
GITHUB_PAGES_BASE="/space-invaders-js-v100/" npm run build

# Preview the built version
npm run preview
```

## 📁 Deployment Structure

```
GitHub Pages Root
├── space-invaders-js-v100/          # Production deployment
│   ├── index.html
│   ├── assets/
│   └── deployment-info.json
├── pr-123/                          # PR #123 preview
│   ├── index.html
│   ├── assets/
│   └── deployment-info.json
└── pr-456/                          # PR #456 preview
    ├── index.html
    ├── assets/
    └── deployment-info.json
```

## 🔍 Troubleshooting

### Common Issues

1. **404 on assets**: Check `base` configuration in `vite.config.js`
2. **Workflow fails**: Verify GitHub Pages is enabled in repository settings
3. **Old previews**: PR previews are cleaned up when PRs are closed

### Debug Information

Each deployment includes a `deployment-info.json` file with:
- Build timestamp
- Git commit hash
- Branch information
- PR number (if applicable)
- Build environment details

### Workflow Status

Check the Actions tab to see deployment status:
- ✅ Green: Deployment successful
- ❌ Red: Deployment failed (check logs)
- 🟡 Yellow: Deployment in progress

## 🚨 Security Notes

- Only PRs from repository collaborators trigger deployments
- Secrets are not exposed to PR previews
- All deployments use secure HTTPS
- Content is served from GitHub's CDN

## 📞 Support

If you encounter deployment issues:
1. Check the Actions tab for error logs
2. Verify repository settings
3. Ensure all required permissions are set
4. Review the deployment script output
