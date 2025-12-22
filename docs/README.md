# Aegis Documentation

This directory contains the source files for the Aegis DevSecOps Platform documentation.

## Building the Documentation

### Prerequisites

- Python 3.7+
- pip

### Install Dependencies

```bash
pip install mkdocs mkdocs-material mkdocs-material-extensions
```

### Build Documentation

```bash
# Build static site
mkdocs build

# Serve locally with live reload
mkdocs serve
```

The documentation will be available at http://localhost:8000

## Documentation Structure

```
docs/
├── introduction/        # Getting started guides
├── core-concepts/       # Core platform concepts
├── deployment/          # Deployment guides
├── api-reference/       # API documentation
└── guides/             # How-to guides
```

## Search Functionality

The documentation includes built-in search powered by MkDocs Material. Search is automatically generated during the build process.

## Publishing

The documentation is built and deployed automatically via CI/CD.
