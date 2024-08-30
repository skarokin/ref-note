FROM golang:alpine

WORKDIR ${GOPATH}/src/github.com/skarokin/ref-note

COPY go.mod go.sum ./
RUN go mod tidy && go mod download
COPY . .

EXPOSE 8080

RUN go build -o main cmd/main.go

CMD ["./main"]