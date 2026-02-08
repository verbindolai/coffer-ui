<p align="center">
  <img src="public/favicon.svg" width="80" alt="Coffer Logo">
</p>

<h1 align="center">Coffer</h1>

<p align="center">
  <strong>Modern coin collection portfolio management with real-time metal valuations</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#development">Development</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## Features

- **Collection Management** - Catalog your coins with detailed metadata: year, country, denomination, grade, metal composition, and more
- **Real-Time Valuations** - Track your portfolio value with live precious metal prices (gold, silver, platinum)
- **Portfolio Analytics** - Visualize your collection's performance with interactive charts and breakdowns
- **3D Coin Viewer** - Examine your coins in an interactive 3D visualization
- **Numista Integration** - Search and import coin data from the world's largest numismatic catalog
- **Dark Theme** - Easy on the eyes with a sleek dark interface and teal accents

## Screenshots

<p align="center">
  <em>Portfolio overview with real-time valuations</em>
</p>

## Quick Start

The easiest way to run Coffer is with Docker. See [coffer-deploy](https://github.com/verbindolai/coffer-deploy) for a complete setup with backend and database.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/verbindolai/coffer2-ui.git
cd coffer2-ui

# Install dependencies
npm install

# Start development server
npm start
```

Navigate to `http://localhost:4200`. The app will automatically reload on file changes.

> **Note:** You'll need the [backend API](https://github.com/verbindolai/coffer2) running for full functionality.

## Development

### Commands

```bash
# Development server with hot reload
npm start

# Build for production
npm run build

# Run unit tests
npm test

# Run linting
npm run lint
```

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Angular |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **3D Graphics** | Three.js |
| **Charts** | Lightweight Charts |
| **Build** | Angular CLI |

## Related Projects

- [coffer](https://github.com/verbindolai/coffer2) - Spring Boot backend API
- [coffer-deploy](https://github.com/verbindolai/coffer-deploy) - Docker deployment

## License

AGPL-3.0 License - See [LICENSE](LICENSE) for details.
