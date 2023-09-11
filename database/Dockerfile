# syntax=docker/dockerfile:1

FROM postgres:latest

COPY init.sh /docker-entrypoint-initdb.d/init.sh

LABEL org.opencontainers.image.authors="vzaiets <vzaets.dev@gmail.com>" \
      org.opencontainers.image.description="freehands database" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/VladimirZaets/freehands.git" \
      org.opencontainers.image.title="freehands database" \
      org.opencontainers.image.url="https://freehands.com/" \
      org.opencontainers.image.revision="${GITHUB_SHA}"

EXPOSE 5432