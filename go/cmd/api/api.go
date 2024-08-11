package api

import (
	"log"
	"net/http"
	"github.com/gorilla/mux"

	"github.com/akuwuh/ref-note/service/user"
	// "github.com/akuwuh/ref-note/service/class"
	// "github.com/akuwuh/ref-note/service/note"
	"cloud.google.com/go/firestore"
)

type APIServer struct {
	addr 			string
	firestoreClient *firestore.Client
}

func NewAPIServer(addr string, firestoreClient *firestore.Client) *APIServer {
	return &APIServer{
		addr: addr,
		firestoreClient: firestoreClient,
	}
}

// initialize router, database, and other dependencies
func (s *APIServer) Run() error {
	router := mux.NewRouter()

	log.Println("Listening on", s.addr)

	userHandler := user.NewHandler(s.firestoreClient)
	userHandler.RegisterRoutes(router)

	// classHandler := class.NewHandler(s.FirestoreClient)
	// classHandler.RegisterRoutes()

	// noteHandler := note.NewHandler(s.FirestoreClient)
	// noteHandler.RegisterRoutes()

	return http.ListenAndServe(s.addr, router)
}