package user

import (
	"fmt"
	"net/http"
	"encoding/json"

	"github.com/skarokin/ref-note/types"
	"github.com/skarokin/ref-note/utils"
	"github.com/gorilla/mux"
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
	router.HandleFunc("/changeDisplayName", h.ChangeDisplayName).Methods("POST")
	router.HandleFunc("/deleteUser/{username}", h.DeleteUser).Methods("DELETE").Name("deleteUser")
	router.HandleFunc("/getDisplayName/{username}", h.GetDisplayName).Methods("GET").Name("getDisplayName")
}

// display dashboard data for user upon signin (fetches user data and data for classes they have access to)
func (h *Handler) SignIn(w http.ResponseWriter, r *http.Request) {
	// extract the {username} from the GET request URL
	vars := mux.Vars(r)
	username := vars["username"]

	fmt.Println("Username:", username)

	userExists, err := utils.CheckUserExists(username, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error checking if user exists:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// if user does not exist, create an account for them
	if !userExists {
		fmt.Println("User does not exist, creating account with default name:", username)
		_, err := h.firestoreClient.Collection("users").Doc(username).Set(r.Context(), map[string]interface{}{
			"displayName": username,
			"classesWithAccessTo": []string{},
		})
		if err != nil {
			fmt.Println("Error creating user:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Println("User created successfully")
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

	// get all classes user has access to
	classesWithAccessTo, err := utils.GetClassesWithAccessTo(username, h.firestoreClient, r.Context())
	if err != nil {
		fmt.Println("Error getting classes with access to:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	classesWithAccessToRes := map[string]interface{}{}
	// loop through each class with access to and get the data
	for _, classID := range classesWithAccessTo {
		classData, err := utils.GetClassData(classID, h.firestoreClient, r.Context())
		if err != nil {
			fmt.Println("Error getting class data:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		classesWithAccessToRes[classID] = classData
	}

	// finally, we return user data and classes they have access to
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"userData": userDataRes,
		"classesWithAccessTo": classesWithAccessToRes,
	})

}

// does not affect userID so no need to propagate to other collections
// this is a unique operation so no need to make it in utils
func (h *Handler) ChangeDisplayName(w http.ResponseWriter, r *http.Request) {
	var req types.ChangeDisplayNameReq
	
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.NewDisplayName == "" {
		http.Error(w, "New username cannot be empty", http.StatusBadRequest)
		return
	}

	_, err = h.firestoreClient.Collection("users").Doc(req.Username).Set(r.Context(), map[string]interface{}{
		"displayName": req.NewDisplayName,
	}, firestore.MergeAll)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// if user is owner of a class, delete the class. else, remove them from class usersWithAccess array
func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	fmt.Println("Username:", username)

	// if user does not exist, can't delete them
	userExists, err := utils.CheckUserExists(username, h.firestoreClient, r.Context()) // boolean 
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} 	

	if userExists {
		classesWithAccessTo, err := utils.GetClassesWithAccessTo(username, h.firestoreClient, r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = utils.DeleteUserClasses(username, classesWithAccessTo, h.firestoreClient, r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return 
		}
	}

	// finally, delete the user
	_, err = h.firestoreClient.Collection("users").Doc(username).Delete(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetDisplayName(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	userData, err := h.firestoreClient.Collection("users").Doc(username).Get(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	displayName := userData.Data()["displayName"]

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"displayName": displayName,
	})
}