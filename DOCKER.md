# DevOpsify.ai - Docker Deployment Guide

This guide covers how to run DevOpsify.ai using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Make (optional, but recommended)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/opsflow-sh/devopsify.ai.git
cd devopsify.ai

# 2. Create environment file
cp .env.docker .env
# Edit .env with your settings (optional)

# 3. Build and start everything
make setup

# 4. Access the application
open http://localhost:3000
```

## Available Commands

Run `make help` to see all available commands:

### Setup & Build
| Command | Description |
|---------|-------------|
| `make setup` | First-time setup (build + init + seed) |
| `make build` | Build Docker images |
| `make build-no-cache` | Build without cache |

### Running
| Command | Description |
|---------|-------------|
| `make dev` | Start development mode (hot reload) |
| `make prod` | Start production mode |
| `make up` | Alias for prod |

### Stopping
| Command | Description |
|---------|-------------|
| `make down` | Stop all containers |
| `make clean` | Stop and remove volumes |
| `make purge` | Remove everything (DESTRUCTIVE) |

### Monitoring
| Command | Description |
|---------|-------------|
| `make logs` | View all logs |
| `make logs-app` | View app logs |
| `make logs-db` | View database logs |
| `make status` | Show container status |

### Database
| Command | Description |
|---------|-------------|
| `make db-shell` | Open PostgreSQL shell |
| `make db-backup` | Backup database |
| `make db-restore FILE=path` | Restore from backup |
| `make db-reset` | Drop and recreate database |

### Debugging
| Command | Description |
|---------|-------------|
| `make shell` | Open shell in app container |
| `make test-api` | Test API endpoints |

## Environment Variables

Copy `.env.docker` to `.env` and customize:

```bash
# Database
POSTGRES_USER=devopsify
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=devopsify

# Application
APP_PORT=3000
DB_PORT=5432
APP_URL=http://localhost:3000

# GitHub API (for repo analysis)
GITHUB_TOKEN=ghp_xxxxx

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Architecture

```
┌─────────────────────────────────────────┐
│              Docker Network             │
│  ┌─────────────┐    ┌─────────────┐    │
│  │   App       │    │  PostgreSQL │    │
│  │  (Node.js)  │───▶│   Database  │    │
│  │  Port 3000  │    │  Port 5432  │    │
│  └─────────────┘    └─────────────┘    │
└─────────────────────────────────────────┘
         │
         ▼
    localhost:3000
```

## Development Mode

Development mode mounts your local files and enables hot reload:

```bash
make dev
```

Changes to source files will automatically trigger rebuilds.

## Production Mode

Production mode runs optimized builds:

```bash
make prod
```

The app is built once and runs with minimal overhead.

## Database Management

### Accessing the Database

```bash
# PostgreSQL shell
make db-shell

# Run SQL query
docker compose exec db psql -U devopsify -d devopsify -c "SELECT * FROM users;"
```

### Backup and Restore

```bash
# Create backup
make db-backup
# Creates: backups/backup-YYYYMMDD-HHMMSS.sql

# Restore from backup
make db-restore FILE=backups/backup-20241216-143000.sql
```

### Reset Database

```bash
make db-reset
```

This will:
1. Drop the existing database
2. Create a new database
3. Run schema migrations
4. Seed initial data

## Testing

### Test API Endpoints

```bash
make test-api
```

### Manual Testing

```bash
# Test ping endpoint
curl http://localhost:3000/api/ping

# Test demo endpoint
curl http://localhost:3000/api/demo

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test"}'
```

## Troubleshooting

### Container won't start

```bash
# Check logs
make logs

# Check container status
make status

# Rebuild from scratch
make purge
make setup
```

### Database connection failed

```bash
# Check database is running
docker compose ps db

# Check database logs
make logs-db

# Test connection
docker compose exec db pg_isready -U devopsify
```

### Port already in use

Change the port in `.env`:

```bash
APP_PORT=3001
DB_PORT=5433
```

Then restart:

```bash
make down
make up
```

## Production Deployment

For production deployment, consider:

1. **Use managed PostgreSQL** (AWS RDS, Supabase, etc.)
2. **Set strong passwords** in `.env`
3. **Enable SSL/TLS** with a reverse proxy
4. **Set up monitoring** (health checks are included)
5. **Configure backups** (automated via cron + `make db-backup`)

### Health Checks

The application exposes health check endpoints:

- **App**: `GET /api/ping` - Returns `{ "message": "ping" }`
- **Database**: PostgreSQL readiness check via `pg_isready`

Docker Compose uses these for service dependencies and restart policies.

## Support

- Documentation: https://github.com/opsflow-sh/devopsify.ai
- Issues: https://github.com/opsflow-sh/devopsify.ai/issues
