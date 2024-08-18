package main

import (
	"log"
	"context"
	"os"

	"github.com/akuwuh/ref-note/cmd/api"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

func main() {
	// initialize firestore
	opt := option.WithCredentialsFile("ref-note-credentials.json")
	ctx := context.Background()
	
	conf := &firebase.Config{
		ProjectID: "ref-note",
	}		
	
	// create firestore emulator connection (in prod we can literally just delete this if statement and it
	// will connect to prod firestore instance)
	// BEFORE RUNNING `go run cmd/main.go`:
	// 1. cd into `go/`
	// 2. run `firebase emulators:start` (starts firestore emulator on localhost:8080)
	// 3. open firestore emulator UI and add `classes` and `users` collections; just use firestore-generated IDs
	// 4. open a new terminal and cd into `go/`
	// 5. run `export FIRESTORE_EMULATOR_HOST=localhost:8080`
	// 6. run `go run cmd/main.go`
	// NOTE: delete cookies in browser to ensure auth is reset
    if emulatorHost := os.Getenv("FIRESTORE_EMULATOR_HOST"); emulatorHost != "" {
        log.Printf("Connecting to Firestore emulator at %s", emulatorHost)
        conf.DatabaseURL = "http://" + emulatorHost
    }						

	app, err := firebase.NewApp(ctx, conf, opt)
	if err != nil {
		log.Fatal(err)
	}

	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		log.Fatal(err)
	}

	defer firestoreClient.Close()

	// firestore emulator is on 8080 so use 8000 for API server
	server := api.NewAPIServer(":8000", firestoreClient)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}