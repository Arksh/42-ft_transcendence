SHELL := /bin/bash

include $(ENV)
export

ENV		= .env
<<<<<<< HEAD
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
=======

# descomentar cuando tenga que existir el .env
#$(ENV):
#	@exit 1

all: build

build: #$(ENV)
	docker compose -f ./docker-compose.yml build

up:
	docker compose -f ./docker-compose.yml up --build -d

down:
	docker compose -f ./docker-compose.yml down -v

ps:
	docker compose -f ./docker-compose.yml ps

volumes:
	docker volume ls
>>>>>>> main

logs:
	docker compose logs -f

<<<<<<< HEAD
clean:
	docker compose down --rmi local --volumes
	@echo "Cleaned up Docker containers, images and volumes."

fclean: clean
	docker compose down --rmi all --volumes --remove-orphans
=======
clean: down
	docker system prune -a -f

fclean: clean
	docker compose down --rmi all --volumes --remove-orphans

.PHONY:  up down logs clean fclean build ps volumes
>>>>>>> main
