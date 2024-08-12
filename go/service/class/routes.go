package class

import (
	"fmt"
	"net/http"
	"encoding/json"

	"github.com/gorilla/mux"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"cloud.google.com/go/firestore"
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
	router.HandleFunc("/getClass/{classID}", h.GetClass).Methods("GET").Name("getClass")
}

func (h *Handler) GetClass(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classID := vars["classID"]

	fmt.Println("Class ID:", classID)

	classDoc, err := h.firestoreClient.Collection("classes").Doc(classID).Get(r.Context())
	if err != nil {
		if status.Code(err) == codes.NotFound {
			fmt.Println("Class does not exist")
			http.Error(w, "Class does not exist", http.StatusNotFound)
			return
		} else {
			fmt.Println("Error checking if class exists:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	fmt.Println("Class found:", classDoc.Data())

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(classDoc.Data())
}