For migration:
* [golang-migrate](https://github.com/golang-migrate/migrate)
* docker pull postgres:latest
* docker run --name freehands-postgres -e POSTGRES_PASSWORD=<password> -e PGOPTIONS="-c custom.db_freehands_user_password=<password>" -d -p 5432:5432 postgres:latest
* docker exec -i freehands-postgres bin/bash < ./database/init.sh
* export POSTGRESQL_URL='postgres://freehands:<password>@localhost:5432/freehands?sslmode=disable&search_path=api'
* migrate -path ./database/migration -database $POSTGRESQL_URL up