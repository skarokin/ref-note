package api

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/skarokin/ref-note/service/user"
	"github.com/skarokin/ref-note/service/class"
	"github.com/skarokin/ref-note/service/note"
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

	classHandler := class.NewHandler(s.firestoreClient)
	classHandler.RegisterRoutes(router)

	noteHandler := note.NewHandler(s.firestoreClient)
	noteHandler.RegisterRoutes(router)

	// create new CORS handler
	c := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:3000", "ws://localhost:3030", "http://localhost:5173", "https://refnote.app", "https://www.refnote.app"},  // Allow your Next.js app origin
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"*"},
        AllowCredentials: true,
    })

	// wrap router with the CORS handler
    handler := c.Handler(router)

	return http.ListenAndServe(s.addr, handler)
}