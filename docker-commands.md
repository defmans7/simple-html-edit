# Docker Compose Commands

## Build and start the service
docker-compose up -d

## Build and start with rebuild (if you made changes)
docker-compose up -d --build

## View logs
docker-compose logs -f html-editor

## Stop the service
docker-compose down

## Stop and remove volumes (if any)
docker-compose down -v

## Check service status
docker-compose ps

## View health check status
docker-compose exec html-editor curl -f http://localhost:3000

## Scale the service (if needed)
docker-compose up -d --scale html-editor=2
