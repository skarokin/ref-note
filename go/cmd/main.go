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
	// 2. run `export FIRESTORE_EMULATOR_HOST=localhost:8080`
	// 3. make a new terminal and cd into `go/`
	// 4. run `firebase emulators:start`
	// 5. open the Emulator UI (localhost:4000/firestore) and add a `classes` and `users` collection;
	//    just use the firestore-generated IDs. No need to create notes subcollections.
	// 6. run `go run cmd/main.go`; now we arent accruing costs on prod firestore!
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

	server := api.NewAPIServer(":8080", firestoreClient)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}