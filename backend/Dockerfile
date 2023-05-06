# syntax=docker/dockerfile:1

FROM golang:1.19-alpine

WORKDIR /app

COPY go1.mod ./
COPY go1.sum ./
RUN go mod download

COPY . ./

LABEL org.opencontainers.image.authors="VZaiets <vzaets.dev@gmail.com>" \
      org.opencontainers.image.description="freeHands backend" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/VladimirZaets/freehand.git" \
      org.opencontainers.image.title="freeHand" \
      org.opencontainers.image.url="https://freeHand.com/" \
      org.opencontainers.image.revision="${GITHUB_SHA}"

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD curl --fail http://localhost:8080/ping || exit 1

RUN go build -o freehands ./app

CMD [ "./freehands", "server", "--debug"]