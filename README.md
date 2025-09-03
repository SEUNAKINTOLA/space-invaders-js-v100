# Space Invaders JS

[![CI/CD Pipeline](https://github.com/SEUNAKINTOLA/space-invaders-js-v100/actions/workflows/ci.yml/badge.svg)](https://github.com/SEUNAKINTOLA/space-invaders-js-v100/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/SEUNAKINTOLA/space-invaders-js-v100/actions/workflows/pages.yml/badge.svg)](https://github.com/SEUNAKINTOLA/space-invaders-js-v100/actions/workflows/pages.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://seunakintola.github.io/space-invaders-js-v100/)

Modern Space Invaders implementation with advanced rendering, performance optimization, and Docker containerization.

## 🎮 Play Now

- **Live Demo**: [https://seunakintola.github.io/space-invaders-js-v100/](https://seunakintola.github.io/space-invaders-js-v100/)
- **PR Previews**: Each pull request gets its own preview URL
- **Local Development**: `npm start` to run locally

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
git clone https://github.com/SEUNAKINTOLA/space-invaders-js-v100.git
cd space-invaders-js-v100
docker-compose up --build dev
```
Open http://localhost:5173

### Traditional Setup
```bash
npm install
npm start
```

## 📦 Deployment

This project features automatic deployments:

- **Production**: Deploys to GitHub Pages on main branch
- **PR Previews**: Each PR gets a unique preview URL
- **Docker**: Containerized for consistent environments

See [Deployment Guide](docs/github-pages-deployment.md) for details.

## 🔧 Performance Optimization

Key performance metrics and thresholds:

- Target FPS: 60 (16.67ms per frame)
- Maximum entities: 1000
- Memory warning threshold: 90%
- Garbage collection interval: 1000ms

## 🛡️ Technical Constraints

- Canvas dimensions: 800x600 pixels
- Device pixel ratio support
- Maximum velocity: 10 units/frame
- Collision precision: 2 pixels

## 🎮 Game Constants

### Player Configuration
- Initial lives: 3
- Movement speed: 5 units
- Shoot cooldown: 250ms
- Size: 32x32 pixels

### Enemy Configuration
- Grid: 5 rows x 11 columns
- Spacing: 50px horizontal, 40px vertical
- Movement speed: 2 units (increases with level)
- Points: 30/20/10 (top/middle/bottom rows)

## 📊 Performance Monitoring

The game includes real-time performance monitoring:

- FPS counter (development mode)
- Memory usage tracking
- Frame time warnings
- Entity count monitoring

## 🔄 Game States

- MENU
- PLAYING
- PAUSED
- GAME_OVER
- HIGH_SCORE

## 🏆 Scoring System

- High score tracking (top 10)
- Combo multiplier: 1.5x
- Combo timeout: 1000ms
- Level completion bonus: 1000 points

## 🛠️ Development Guidelines

1. Follow Clean Architecture principles
2. Maintain test coverage above 80%
3. Document all public APIs
4. Use performance monitoring tools
5. Follow security best practices

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

- File an issue on GitHub
- Check documentation in `/docs`
- Review performance benchmarks

---
Built with ❤️ by [Your Team Name]