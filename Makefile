SHELL := /bin/bash

include $(ENV)
export

ENV		= .env
DOMAIN := $(shell grep '^DOMAIN=' $(ENV) | cut -d'=' -f2)


.PHONY: install backend-install gaming-install realtime-install up down logs clean prisma-generate prisma-migrate

install: backend-install gaming-install realtime-install
	@echo "Dependencies installed for backend, gaming and realtime."

backend-install:
	cd backend && npm install

gaming-install:
	cd gaming && npm install

realtime-install:
	cd realtime && npm install

prisma-generate:
	cd backend && npx prisma generate

prisma-migrate:
	cd backend && npx prisma migrate dev --name init

up:
	docker compose up --build -d

down:
	docker compose down

ps:
	docker compose ps

exec-db:
	docker exec -it transcendence_postgres psql -U $(shell grep '^POSTGRES_USER=' $(ENV) | cut -d'=' -f2)

logs:
	docker compose logs -f

clean:
	docker compose down --rmi local --volumes
	@echo "Cleaned up Docker containers, images and volumes."

fclean: clean
	docker compose down --rmi all --volumes --remove-orphans
