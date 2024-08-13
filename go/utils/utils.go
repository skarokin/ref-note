package utils

import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"cloud.google.com/go/firestore"
)

func CheckUserExists(username string, firestoreClient *firestore.Client, ctx Context) (bool, error) {
	_, err := firestoreClient.Collection("users").Doc(username).Get(ctx) // queries users collection for document username
	
	if err != nil {
		if status.Code(err) == codes.NotFound { // not a real error
			return false, nil
		} else { // any other error 
			return false, err
		}
	} else { // no error == user found
		return true, nil 
	}
}

// assume user exists
func GetClasses(username string, firestoreClient *firestore.Client, ctx Context) ([]string, error) {
	userData, err := h.firestoreClient.Collection("users").Doc(username).Get(ctx)
	if err != nil { // error getting user (some error)
		return []string{}, err
	}

	userDataRes := userData.Data() // response

	classesWithAccessToRes := []string{}
	
	for _, classID := range userDataRes["classesWithAccessTo"].([]interface {}) {
		classID := classID.(string)
		classData, err := h.firestoreClient.Collection("classes").Doc(classID).Get(ctx)
		if err != nil {
			return []string{}, err
		}

		classesWithAccessToRes = append(classesWithAccessToRes, classID)
	}

	return classesWithAccessToRes, nil
}

// assume user exists
func DeleteUserClasses(username string, classes []string, firestoreClient *firestore.Client, ctx Context) error {
	for _, classID := range classes {
		classID := classID.(string)
		classData, err := h.firestoreClient.Collection("classes").Doc(classID).Get(ctx)
		if err != nil {
			return err
		}
		creatorID := classData["creatorID"]

		if username != creatorID { // they dont own it, remove 
			var newUsersAccessArray []string
			for _, userWithAccess := range classData["usersWithAccess"] {
				if username != userWithAccess {
					newUsersAccessArray = append(newUsersAccessArray, userWithAccess)
				} 
			}

			classData["usersWithAccess"] = newUsersAccessArray
			_, err := h.firestoreClient.Collection("classes").Doc(classID).Update(ctx, []firestore.Update{
				{
					usersWithAccess: newUsersAccessArray,
				},
			})
			if err != nil {
				return err
			}
		} else { // delete class 
			_, err := firestoreClient.Collection("classes").Doc(classID).Delete(ctx)
			if err != nil {
				return err
			}
		}
	}

	return nil
}