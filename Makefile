PYTHON ?= python
PIP ?= pip
NPM ?= npm

.PHONY: dev test lint db-up frontend-dev frontend-build frontend-lint

dev:
	cd backend && $(PYTHON) -m uvicorn app.main:app --reload --port 8000

test:
	cd backend && $(PYTHON) -m pytest

lint:
	@echo "Lint commands are scaffolded but not yet wired to project-specific tooling."

db-up:
	docker compose up -d postgres

frontend-dev:
	cd frontend && $(NPM) run dev

frontend-build:
	cd frontend && $(NPM) run build

frontend-lint:
	cd frontend && $(NPM) run lint
