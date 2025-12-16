# DevOpsify.ai - Docker Makefile
# ================================
# Complete Docker deployment management

.PHONY: help build up down restart logs shell db-shell init seed clean purge dev prod status test

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Project name
PROJECT := devopsify

#----------------------------------------------
# HELP
#----------------------------------------------
help: ## Show this help message
	@echo ""
	@echo "$(CYAN)DevOpsify.ai - Docker Commands$(NC)"
	@echo "================================"
	@echo ""
	@echo "$(GREEN)Quick Start:$(NC)"
	@echo "  make setup    - First time setup (build + init + seed)"
	@echo "  make dev      - Start development environment"
	@echo "  make prod     - Start production environment"
	@echo ""
	@echo "$(GREEN)Available Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

#----------------------------------------------
# SETUP & INITIALIZATION
#----------------------------------------------
setup: ## First time setup - build, initialize DB, seed data
	@echo "$(GREEN)🚀 Setting up DevOpsify.ai...$(NC)"
	@make build
	@make init
	@make seed
	@echo "$(GREEN)✅ Setup complete! Run 'make dev' or 'make prod' to start.$(NC)"

init: ## Initialize the database schema
	@echo "$(CYAN)📦 Initializing database...$(NC)"
	@docker compose up -d db
	@echo "Waiting for database to be ready..."
	@sleep 5
	@docker compose exec -T db psql -U $${POSTGRES_USER:-devopsify} -d $${POSTGRES_DB:-devopsify} -f /docker-entrypoint-initdb.d/01-schema.sql 2>/dev/null || true
	@echo "$(GREEN)✅ Database initialized$(NC)"

seed: ## Seed the database with initial data
	@echo "$(CYAN)🌱 Seeding database...$(NC)"
	@docker compose exec -T db psql -U $${POSTGRES_USER:-devopsify} -d $${POSTGRES_DB:-devopsify} -f /docker-entrypoint-initdb.d/02-seed.sql 2>/dev/null || true
	@echo "$(GREEN)✅ Database seeded$(NC)"

#----------------------------------------------
# BUILD
#----------------------------------------------
build: ## Build Docker images
	@echo "$(CYAN)🔨 Building Docker images...$(NC)"
	@docker compose build
	@echo "$(GREEN)✅ Build complete$(NC)"

build-no-cache: ## Build Docker images without cache
	@echo "$(CYAN)🔨 Building Docker images (no cache)...$(NC)"
	@docker compose build --no-cache
	@echo "$(GREEN)✅ Build complete$(NC)"

#----------------------------------------------
# RUN
#----------------------------------------------
dev: ## Start development environment with hot reload
	@echo "$(GREEN)🚀 Starting DevOpsify.ai (development)...$(NC)"
	@docker compose --profile dev up app-dev db

prod: ## Start production environment
	@echo "$(GREEN)🚀 Starting DevOpsify.ai (production)...$(NC)"
	@docker compose up -d app db
	@echo ""
	@echo "$(GREEN)✅ DevOpsify.ai is running!$(NC)"
	@echo "   App:      http://localhost:$${APP_PORT:-3000}"
	@echo "   Database: localhost:$${DB_PORT:-5432}"
	@echo ""
	@echo "Run 'make logs' to view logs"

up: prod ## Alias for prod

start: prod ## Alias for prod

#----------------------------------------------
# STOP & CLEANUP
#----------------------------------------------
down: ## Stop all containers
	@echo "$(YELLOW)🛑 Stopping containers...$(NC)"
	@docker compose down
	@echo "$(GREEN)✅ Stopped$(NC)"

stop: down ## Alias for down

restart: ## Restart all containers
	@echo "$(YELLOW)🔄 Restarting...$(NC)"
	@docker compose restart
	@echo "$(GREEN)✅ Restarted$(NC)"

clean: ## Stop containers and remove volumes
	@echo "$(RED)🧹 Cleaning up (keeping data)...$(NC)"
	@docker compose down -v --remove-orphans
	@echo "$(GREEN)✅ Cleaned$(NC)"

purge: ## Remove everything including data (DESTRUCTIVE!)
	@echo "$(RED)⚠️  This will delete ALL data! Press Ctrl+C to cancel...$(NC)"
	@sleep 3
	@docker compose down -v --remove-orphans --rmi local
	@docker volume rm $(PROJECT)_postgres_data 2>/dev/null || true
	@echo "$(GREEN)✅ Purged$(NC)"

#----------------------------------------------
# MONITORING & DEBUGGING
#----------------------------------------------
logs: ## View logs (all containers)
	@docker compose logs -f

logs-app: ## View app logs only
	@docker compose logs -f app

logs-db: ## View database logs only
	@docker compose logs -f db

status: ## Show container status
	@echo "$(CYAN)📊 Container Status$(NC)"
	@echo "==================="
	@docker compose ps

shell: ## Open shell in app container
	@docker compose exec app /bin/sh

db-shell: ## Open PostgreSQL shell
	@docker compose exec db psql -U $${POSTGRES_USER:-devopsify} -d $${POSTGRES_DB:-devopsify}

#----------------------------------------------
# DATABASE OPERATIONS
#----------------------------------------------
db-backup: ## Backup database to ./backups/
	@echo "$(CYAN)💾 Backing up database...$(NC)"
	@mkdir -p backups
	@docker compose exec -T db pg_dump -U $${POSTGRES_USER:-devopsify} $${POSTGRES_DB:-devopsify} > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✅ Backup saved to backups/$(NC)"

db-restore: ## Restore database from backup (usage: make db-restore FILE=backups/backup.sql)
	@if [ -z "$(FILE)" ]; then echo "$(RED)Error: specify FILE=path/to/backup.sql$(NC)"; exit 1; fi
	@echo "$(YELLOW)📥 Restoring from $(FILE)...$(NC)"
	@docker compose exec -T db psql -U $${POSTGRES_USER:-devopsify} -d $${POSTGRES_DB:-devopsify} < $(FILE)
	@echo "$(GREEN)✅ Restored$(NC)"

db-reset: ## Reset database (drop and recreate)
	@echo "$(RED)⚠️  Resetting database...$(NC)"
	@docker compose exec -T db psql -U $${POSTGRES_USER:-devopsify} -c "DROP DATABASE IF EXISTS $${POSTGRES_DB:-devopsify};"
	@docker compose exec -T db psql -U $${POSTGRES_USER:-devopsify} -c "CREATE DATABASE $${POSTGRES_DB:-devopsify};"
	@make init
	@make seed
	@echo "$(GREEN)✅ Database reset complete$(NC)"

#----------------------------------------------
# TESTING
#----------------------------------------------
test: ## Run tests
	@echo "$(CYAN)🧪 Running tests...$(NC)"
	@docker compose exec app pnpm test || pnpm test

test-api: ## Test API endpoints
	@echo "$(CYAN)🧪 Testing API endpoints...$(NC)"
	@echo "Testing /api/ping..."
	@curl -s http://localhost:$${APP_PORT:-3000}/api/ping | jq . || echo "App not running"
	@echo ""
	@echo "Testing /api/demo..."
	@curl -s http://localhost:$${APP_PORT:-3000}/api/demo | jq . || echo "App not running"

#----------------------------------------------
# UTILITIES
#----------------------------------------------
env-example: ## Create .env file from example
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✅ Created .env from .env.example$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env already exists$(NC)"; \
	fi

check-deps: ## Check if Docker and Docker Compose are installed
	@echo "$(CYAN)Checking dependencies...$(NC)"
	@which docker > /dev/null || (echo "$(RED)Docker not found$(NC)" && exit 1)
	@which docker > /dev/null && echo "$(GREEN)✓ Docker$(NC)"
	@docker compose version > /dev/null 2>&1 || (echo "$(RED)Docker Compose not found$(NC)" && exit 1)
	@docker compose version > /dev/null 2>&1 && echo "$(GREEN)✓ Docker Compose$(NC)"
	@echo "$(GREEN)All dependencies installed!$(NC)"
