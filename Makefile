SHELL := /bin/bash

PYTHON ?= python3
PNPM := corepack pnpm
VENV_DIR := .venv
UVICORN := $(VENV_DIR)/bin/uvicorn
PIP := $(VENV_DIR)/bin/pip

API_HOST ?= 127.0.0.1
API_PORT ?= 8000
WEB_PORT ?= 3000

CLIENT_ID ?= demo
STORE_API_URL ?= http://127.0.0.1:8000
NEXT_PUBLIC_STORE_API_URL ?= http://127.0.0.1:8000
ADMIN_TOKEN ?= e2e-admin

.PHONY: help install install-web install-api dev-api dev-web dev build e2e

help:
	@echo "Targets:"
	@echo "  make install      - install pnpm deps + python venv deps"
	@echo "  make dev-api      - run FastAPI on $(API_HOST):$(API_PORT)"
	@echo "  make dev-web      - run Next.js on :$(WEB_PORT)"
	@echo "  make dev          - run api + web together"
	@echo "  make build        - run monorepo build"
	@echo "  make e2e          - run Playwright e2e"

install: install-web install-api

install-web:
	corepack enable
	$(PNPM) install

install-api:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		$(PYTHON) -m venv $(VENV_DIR); \
	fi
	$(PIP) install --upgrade pip
	$(PIP) install -r apps/api/requirements.txt

dev-api:
	@if [ ! -x "$(UVICORN)" ]; then \
		echo "Missing $(UVICORN). Run: make install-api"; \
		exit 1; \
	fi
	set -a; \
	if [ -f apps/api/.env ]; then source apps/api/.env; fi; \
	set +a; \
	$(UVICORN) apps.api.main:app --host $(API_HOST) --port $(API_PORT) --reload

dev-web:
	@if [ ! -d "node_modules" ]; then \
		echo "Missing node_modules. Run: make install-web"; \
		exit 1; \
	fi
	CLIENT_ID="$(CLIENT_ID)" \
	STORE_API_URL="$(STORE_API_URL)" \
	NEXT_PUBLIC_STORE_API_URL="$(NEXT_PUBLIC_STORE_API_URL)" \
	ADMIN_TOKEN="$(ADMIN_TOKEN)" \
	$(PNPM) --filter web dev -- --port $(WEB_PORT)

dev:
	@set -euo pipefail; \
	$(MAKE) dev-api & API_PID=$$!; \
	$(MAKE) dev-web & WEB_PID=$$!; \
	trap 'kill $$API_PID $$WEB_PID >/dev/null 2>&1 || true' INT TERM EXIT; \
	wait

build:
	$(PNPM) build

e2e:
	$(PNPM) e2e
