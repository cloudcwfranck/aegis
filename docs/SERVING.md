# Serving Documentation

The Aegis documentation is integrated with the web application for seamless access.

## How It Works

The MkDocs documentation is built as a static site and copied to the web application's public directory:

```
packages/web/public/docs/
```

When users click the "Documentation →" button on the landing page, they are directed to `/docs/` which serves the static documentation files.

## Building Documentation

To rebuild and deploy the documentation:

```bash
# Build docs and copy to web app
npm run docs:build

# Or serve docs locally for development
npm run docs:serve
```

## Development Workflow

### Local Development

When working on documentation locally:

```bash
# Terminal 1: Serve web app
npm run dev

# Terminal 2: Serve docs with live reload
npm run docs:serve
```

The web app will be at http://localhost:5173 and docs at http://localhost:8000

### Updating Documentation

1. Edit markdown files in `docs/` directory
2. Test changes with `mkdocs serve`
3. Build and deploy: `npm run docs:build`
4. Commit changes including both docs source and built files

## Production Deployment

In production, the documentation is served alongside the web application:

- **Web App**: https://aegis.gov
- **Documentation**: https://aegis.gov/docs/

The Vite production build automatically includes the `/docs/` directory from the public folder.

## File Structure

```
aegis/
├── docs/               # Documentation source (Markdown)
├── mkdocs.yml         # MkDocs configuration
├── site/              # Built documentation (generated)
└── packages/
    └── web/
        └── public/
            └── docs/  # Documentation served by web app
```

## Search Functionality

The documentation includes built-in search powered by MkDocs Material:
- Search index: `/docs/search/search_index.json` (253KB)
- Supports keyword search across all pages
- Search suggestions and highlighting
