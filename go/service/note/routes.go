package note

import (
	"fmt"
	"net/http"
	"encoding/json"

	"github.com/gorilla/mux"
	// "google.golang.org/grpc/codes"
	// "google.golang.org/grpc/status"
	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
	"github.com/akuwuh/ref-note/utils"
)

type Handler struct {
	firestoreClient *firestore.Client
}

func NewHandler(firestoreClient *firestore.Client) *Handler {
	return &Handler{
		firestoreClient: firestoreClient,
	}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	// router.HandleFunc("/editNote", h.AddNote).Methods("POST")
	// router.HandleFunc("/deleteNote", h.DeleteNote).Methods("DELETE")
	router.HandleFunc("/retrieveNotes/{classID}", h.RetrieveNotes).Methods("GET").Name("retrieveNotes")
}


func (h *Handler) RetrieveNotes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classID := vars["classID"]
	fmt.Println("Retrieving Notes For Class ID:", classID)

	var notes []map[string]interface{};
	iter := h.firestoreClient.Collection("classes").Doc(classID).Collections(r.Context())
	for {
		collRef, err := iter.Next()
		fmt.Println("Collection ID:", collRef.ID)
		if err == iterator.Done {
			fmt.Println("No Notes Found")
			break
		}
		if err != nil {
			fmt.Println("Error retrieving notes:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		if collRef.ID == "notes" {
			fmt.Println("Fetching Notes for class ID:", classID)
			notes, err = utils.RetrieveNotesHelper(collRef, r.Context());
			if err != nil {
				fmt.Println("Error retrieving notes:", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			break
		}
	}

	fmt.Println("Notes Found:", notes)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(notes)
}