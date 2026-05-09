SHELL := /bin/bash

include $(ENV)
export

ENV		= .env

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

logs:
	docker compose logs -f

clean: down
	docker system prune -a -f

fclean: clean
	docker compose down --rmi all --volumes --remove-orphans

.PHONY:  up down logs clean fclean build ps volumes

add-volumes:
	mkdir -p ./data/postgres
	@echo "Created dir volume for database data."

exec-db:
	docker exec -it -it transcendence_postgres psql -U $(shell grep '^POSTGRES_USER=' $(ENV) | cut -d'=' -f2)
