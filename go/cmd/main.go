package main

import (
	"log"
	"context"

	"github.com/akuwuh/ref-note/cmd/api"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

func main() {
	// initialize firestore
	opt := option.WithCredentialsFile("ref-note-credentials.json")
	ctx := context.Background()
	conf := &firebase.Config{ProjectID: "ref-note"}
	app, err := firebase.NewApp(ctx, conf, opt)
	if err != nil {
		log.Fatal(err)
	}

	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		log.Fatal(err)
	}

	defer firestoreClient.Close()

	server := api.NewAPIServer(":8080", firestoreClient)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}