package user

import (
	"fmt"
	"net/http"
	"encoding/json"

	"github.com/gorilla/mux"
	"github.com/akuwuh/ref-note/utils"
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
	router.HandleFunc("/signin/{username}", h.SignIn).Methods("GET").Name("signin")
	router.HandleFunc("/changeUsername", h.ChangeUsername).Methods("POST")
	router.HandleFunc("/deleteAccount/{username}", h.DeleteAccount).Methods("DELETE").Name("deleteAccount")
}

// upon sign in, check if user exists in db. if not, create their account.
// return user data (jwt handled by nextauth)
func (h *Handler) SignIn(w http.ResponseWriter, r *http.Request) {
	// extract the {username} from the GET request URL
	vars := mux.Vars(r)
	username := vars["username"]

	fmt.Println("Username:", username)

	_, err := h.firestoreClient.Collection("users").Doc(username).Get(r.Context())
	// codes.NotFound is a constant from google.golang.org/grpc/codes. This is how we check if a doc exists in firestore
	// so, if there is an error AND the error code is NotFound then the user does not exist and we should create their account
	if err != nil {
		if status.Code(err) == codes.NotFound {
			fmt.Println("User does not exist, creating account with default name:", username)
			_, err := h.firestoreClient.Collection("users").Doc(username).Set(r.Context(), map[string]interface{}{
				"username": username,
				"classesWithAccessTo": []string{},
			})
			if err != nil {
				fmt.Println("Error creating user:", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			fmt.Println("User created successfully")
		} else {
			fmt.Println("Error checking if user exists:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		fmt.Println("User exists already")
	}

	// user exists now (either they did before or we just created them), get their data
	userData, err := h.firestoreClient.Collection("users").Doc(username).Get(r.Context())
	if err != nil {
		fmt.Println("Error getting user data:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// store user data (for later use)
	userDataRes := userData.Data()

	classesWithAccessToRes := map[string]interface{}{}
	// loop through each class with access to
	for _, classID := range userDataRes["classesWithAccessTo"].([]interface {}) {
		classID := classID.(string)
		classData, err := h.firestoreClient.Collection("classes").Doc(classID).Get(r.Context())
		if err != nil {
			fmt.Println("Error getting class data:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		classesWithAccessToRes[classID] = classData.Data()
	}

	// finally, we return user data and classes they have access to
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"userData": userDataRes,
		"classesWithAccessTo": classesWithAccessToRes,
	})

}

func (h *Handler) ChangeUsername(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	newUsername := r.FormValue("newUsername")
	if newUsername == "" {
		fmt.Println("newUsername is required")
		http.Error(w, "newUsername is required", http.StatusBadRequest)
		return
	}

	// the userID is their gmail address w/o the domain
	username := r.FormValue("username")

	_, err = h.firestoreClient.Collection("users").Doc(username).Set(r.Context(), map[string]interface{}{
		"username": newUsername,
	}, firestore.MergeAll)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	fmt.Println("Username:", username)

	userExists, err := utils.CheckUserExists(username, h.firestoreClient, r.Context()) // boolean 
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} 	

	var classes []string{}
	if userExists {
		classes, err = utils.GetClasses(username, h.firestoreClient, r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = utils.DeleteUserClasses(username, classes, h.firestoreClient, r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return 
		}
	}

	w.WriteHeader(http.StatusOK)
}
