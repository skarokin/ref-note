package note

// import (
// 	"fmt"
// 	"net/http"
// 	"encoding/json"

// 	"github.com/gorilla/mux"
// 	"google.golang.org/grpc/codes"
// 	"google.golang.org/grpc/status"
// 	"cloud.google.com/go/firestore"
// )

// type Handler struct {
// 	firestoreClient *firestore.Client
// }

// func NewHandler(firestoreClient *firestore.Client) *Handler {
// 	return &Handler{
// 		firestoreClient: firestoreClient,
// 	}
// }

// func (h *Handler) RegisterRoutes(router *mux.Router) {
// 	router.HandleFunc("/editNote", h.AddNote).Methods("POST")
// 	router.HandleFunc("/deleteNote", h.DeleteNote).Methods("DELETE")
// }