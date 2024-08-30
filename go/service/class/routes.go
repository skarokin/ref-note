package class

import (
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/skarokin/ref-note/utils"
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
	router.HandleFunc("/getClass/{classID}/{username}", h.GetClass).Methods("GET").Name("getClass")
	router.HandleFunc("/createClass", h.CreateClass).Methods("POST")
	router.HandleFunc("/getClassCreator/{classID}", h.GetClassCreator).Methods("GET").Name("getClassCreator")
	router.HandleFunc("/changeClassCode", h.ChangeClassCode).Methods("POST")
	router.HandleFunc("/changeClassName", h.ChangeClassName).Methods("POST")
	router.HandleFunc("/changeClassLocation", h.ChangeClassLocation).Methods("POST")
	router.HandleFunc("/changeClassMeetingSchedule", h.ChangeClassMeetingSchedule).Methods("POST")
	router.HandleFunc("/changeClassProfessor", h.ChangeClassProfessor).Methods("POST")
	router.HandleFunc("/addUserToClass", h.AddUserToClass).Methods("POST")
	router.HandleFunc("/deleteClass/{classID}", h.DeleteClass).Methods("DELETE").Name("deleteClass")
	router.HandleFunc("/removeUserFromClass", h.RemoveUserFromClass).Methods("POST")
}

func (h *Handler) GetClass(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classID := vars["classID"]
	username := vars["username"]

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

	// check if user calling this endpoint has access to the class
	hasAccess := false
	usersWithAccess := classDoc.Data()["usersWithAccess"].([]interface {})
	for _, user := range usersWithAccess {
		if user.(string) == username {
			hasAccess = true
			break
		}
	}

	if !hasAccess {
		fmt.Println("User does not have access to class")
		http.Error(w, "User does not have access to class", http.StatusForbidden)
		return
	}

	// class exists, now get notes for class and attach to response
	notesMetadata, err := utils.GetNotesMetadata(classID, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error getting notes metadata:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"classData": classDoc.Data(),
		"notesMetadata": notesMetadata,
	})
}

// creates a class
func (h *Handler) CreateClass(w http.ResponseWriter, r *http.Request) {
	// bro what? for some reason ParseForm doesnt work but ParseMultipartForm does... lol
	err := r.ParseMultipartForm(32 << 20) 
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	classCode := r.FormValue("classCode")
	className := r.FormValue("className")
	creatorUsername := r.FormValue("username")
	professor := r.FormValue("professor")
	location := r.FormValue("location")
	meeting := r.FormValue("meeting")

	fmt.Println("Class Code:", classCode)
	fmt.Println("Class Name:", className)
	fmt.Println("Creator ID:", creatorUsername)
	fmt.Println("Professor:", professor)
	fmt.Println("Location:", location)
	fmt.Println("Meeting:", meeting)

	classID, err := utils.CreateClass(classCode, className, creatorUsername, professor, location, meeting, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Erorr Creating Class: ", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully created class with ID:", classID)	

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetClassCreator(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classID := vars["classID"]

	creatorUsername, err := utils.GetClassOwner(classID, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error getting class owner:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Class Creator:", creatorUsername)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(creatorUsername)
}

func (h *Handler) ChangeClassCode(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	classID := r.FormValue("classID")
	classCode := r.FormValue("classCode")

	_, err = h.firestoreClient.Collection("classes").Doc(classID).Set(r.Context(), map[string]interface{}{
		"classCode": classCode,
	}, firestore.MergeAll)
	if err != nil {
		fmt.Println("Error changing class code:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully changed class code to:", classCode)

	w.WriteHeader(http.StatusOK)

}

func (h *Handler) ChangeClassName(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	classID := r.FormValue("classID")
	className := r.FormValue("className")

	_, err = h.firestoreClient.Collection("classes").Doc(classID).Set(r.Context(), map[string]interface{}{
		"className": className,
	}, firestore.MergeAll)
	if err != nil {
		fmt.Println("Error changing class name:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully changed class name to:", className)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) ChangeClassLocation(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	classID := r.FormValue("classID")
	location := r.FormValue("location")

	_, err = h.firestoreClient.Collection("classes").Doc(classID).Set(r.Context(), map[string]interface{}{
		"location": location,
	}, firestore.MergeAll)
	if err != nil {
		fmt.Println("Error changing class location:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully changed class location to:", location)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) ChangeClassMeetingSchedule(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	classID := r.FormValue("classID")
	meeting := r.FormValue("meeting")

	_, err = h.firestoreClient.Collection("classes").Doc(classID).Set(r.Context(), map[string]interface{}{
		"meeting": meeting,
	}, firestore.MergeAll)
	if err != nil {
		fmt.Println("Error changing class meeting:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully changed class meeting to:", meeting)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) ChangeClassProfessor(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	classID := r.FormValue("classID")
	professor := r.FormValue("professor")

	_, err = h.firestoreClient.Collection("classes").Doc(classID).Set(r.Context(), map[string]interface{}{
		"professor": professor,
	}, firestore.MergeAll)
	if err != nil {
		fmt.Println("Error changing class professor:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully changed class professor to:", professor)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) AddUserToClass(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	classID := r.FormValue("classID")
	username := r.FormValue("username")

	err = utils.AddUserToClass(classID, username, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error adding user to class:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully added user to class")
	w.WriteHeader(http.StatusOK)
	
}

func (h *Handler) DeleteClass(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classID := vars["classID"]

	fmt.Println("Deleting class with ID:", classID)

	// assumes that user is authorized to delete the class 
	err := utils.DeleteClass(classID, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error deleting class:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Successfully deleted class")
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) RemoveUserFromClass(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	classID := r.FormValue("classID")
	usernameToRemove := r.FormValue("usernameToRemove")

	fmt.Printf("Removing user %s from class %s\n", usernameToRemove, classID)

	err = utils.RemoveUserFromClass(classID, usernameToRemove, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error removing user access:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	
}