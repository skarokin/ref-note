package class

import (
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/akuwuh/ref-note/utils"
	"github.com/gorilla/mux"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
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
	router.HandleFunc("/createClass", h.CreateClass).Methods("POST")
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

// creates a class
func (h *Handler) CreateClass(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	classCode := r.FormValue("classCode")
	className := r.FormValue("className")
	creatorID := r.FormValue("username")
	professor := r.FormValue("professor")
	location := r.FormValue("location")
	meeting := r.FormValue("meeting")

	fmt.Println("Class Code:", classCode)
	fmt.Println("Class Name:", className)
	fmt.Println("Creator ID:", creatorID)
	fmt.Println("Professor:", professor)
	fmt.Println("Location:", location)
	fmt.Println("Meeting:", meeting)

	classID, err := utils.CreateClassUtil(classCode, className, creatorID, professor, location, meeting, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Erorr Creating Class: ", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully created class with ID:", classID)	

	w.WriteHeader(http.StatusOK)
}