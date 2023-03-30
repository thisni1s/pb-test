FROM golang:alpine AS build

WORKDIR /app

COPY src/go.mod ./
COPY src/go.sum ./
RUN go mod download

COPY src/main.go ./

RUN go build -o /pb


FROM alpine:latest

RUN apk add --no-cache \
        unzip \
        ca-certificates \
        file

RUN mkdir /pb

COPY --from=build /pb /pb/pocketbase

EXPOSE 8080

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
