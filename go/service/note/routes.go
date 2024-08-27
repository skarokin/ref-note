package note

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	// // "google.golang.org/grpc/codes"
	// // "google.golang.org/grpc/status"
	"cloud.google.com/go/firestore"
	// "google.golang.org/api/iterator"
	"github.com/akuwuh/ref-note/types"
	"github.com/akuwuh/ref-note/utils"
	// "github.com/akuwuh/ref-note/types"
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
	router.HandleFunc("/createNote", h.CreateNote).Methods("POST")
	router.HandleFunc("/deleteNote/{classID}/{noteName}", h.DeleteNote).Methods("DELETE").Name("deleteNote")
	router.HandleFunc("/getNote/{classID}/{noteName}", h.GetNote).Methods("GET").Name("getNote")
	router.HandleFunc("/updateNote", h.UpdateNote).Methods("POST")
}

func (h *Handler) CreateNote(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error parsing form: %v", err), http.StatusBadRequest)
		return
	}

	classID := r.FormValue("classID")
	noteName := r.FormValue("noteName")
	username := r.FormValue("username")		// if endpoint is called, assumes that user has access to classID

	// strip all whitespace from noteName (client also does this but this is just in case)
	noteName = strings.ReplaceAll(noteName, " ", "")

	if noteName == "" {
		http.Error(w, "Note name is required", http.StatusBadRequest)
		return
	}

	fmt.Println("Attempting to create note ", noteName, " for class ", classID)

	// if user was able to call this endpoint, they are allowed to create a note for the class
	// first, check if noteName exists for classID
	notesMetadata, err := utils.GetNotesMetadata(classID, h.firestoreClient, r.Context())
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting notes metadata: %v", err), http.StatusInternalServerError)
		return
	}

	if notesMetadata[noteName] != nil {
		http.Error(w, "Note name already exists", http.StatusBadRequest)
		return
	}

	// finally, add the note w/ default metadata
	err = utils.AddNoteToClass(classID, noteName, username, h.firestoreClient, r.Context())
	if err != nil {
		http.Error(w, fmt.Sprintf("Error adding note to class: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) DeleteNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classID := vars["classID"]
	noteName := vars["noteName"]

	fmt.Println("Attempting to delete note ", noteName, " for class ", classID)

	// finally, delete the note. assumes it exists
	err := utils.DeleteNoteFromClass(classID, noteName, h.firestoreClient, r.Context())
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting note from class: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classID := vars["classID"]
	noteName := vars["noteName"]
	username := r.URL.Query().Get("username")

	fmt.Println("Attempting to get note ", noteName, " for class ", classID, " for user ", username)

	// first, check if user has access to class ID
	classesWithAccessTo, err := utils.GetClassesWithAccessTo(username, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error getting classes with access to: ", err)
		http.Error(w, fmt.Sprintf("Error getting classes with access to: %v", err), http.StatusInternalServerError)
		return
	}

	hasAccess := false
	for _, classWithAccessTo := range classesWithAccessTo {
		if classWithAccessTo == classID {
			hasAccess = true
		}
	}

	if !hasAccess {
		fmt.Println("User does not have access to class ", classID)
		http.Error(w, "User does not have access to class", http.StatusUnauthorized)
		return
	}

	// then, return note if exists
	noteContent, err := h.firestoreClient.Collection("classes").Doc(classID).Collection("notes").Doc(noteName).Get(r.Context())
	if err != nil {
		fmt.Println("Error getting note: ", err)
		http.Error(w, fmt.Sprintf("Error getting note: %v", err), http.StatusInternalServerError)
		return
	}

	http.Header.Add(w.Header(), "content-type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"note": noteContent.Data()["note"],
	})
}

// assumed that if a user can call this, they have access to the classID
func (h *Handler) UpdateNote(w http.ResponseWriter, r *http.Request) {
	var updateNoteReq types.UpdateNoteReq
	err := json.NewDecoder(r.Body).Decode(&updateNoteReq)
	if err != nil {
		fmt.Println("Error decoding request: ", err)
		http.Error(w, fmt.Sprintf("Error decoding request: %v", err), http.StatusBadRequest)
		return
	}

	fmt.Println(updateNoteReq)
	
	classID := updateNoteReq.ClassID
	noteName := updateNoteReq.NoteName
	newNoteContent := updateNoteReq.NewNoteContent

	fmt.Println("Attempting to update note ", noteName, " for class ", classID)

	err = utils.UpdateNoteInClass(classID, noteName, newNoteContent, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error updating note in class: ", err)
		http.Error(w, fmt.Sprintf("Error updating note in class: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

}