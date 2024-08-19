package utils

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

func CheckUserExists(username string, firestoreClient *firestore.Client, ctx context.Context) (bool, error) {
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

// assume user exists; doesnt return the data of the class but returns what classID the user can access
func GetClassesWithAccessTo(username string, firestoreClient *firestore.Client, ctx context.Context) ([]string, error) {
	userData, err := firestoreClient.Collection("users").Doc(username).Get(ctx)
	if err != nil { 
		return []string{}, err
	}

	var classesWithAccessTo []string

	// this is weird but necessary to extract string values from the interface array
	for _, classID := range userData.Data()["classesWithAccessTo"].([]interface {}) {
		classID := classID.(string)
		classesWithAccessTo = append(classesWithAccessTo, classID)
	}

	return classesWithAccessTo, nil
}

// extract class data from firestore, assumes class exists
func GetClassData(classID string, firestoreClient *firestore.Client, ctx context.Context) (map[string]interface{}, error) {
	classData, err := firestoreClient.Collection("classes").Doc(classID).Get(ctx)
	if err != nil {
		return nil, err
	}

	return classData.Data(), nil
}

// assume user exists. this handles class deletion if user is creator, or user leaving class if not creator
func DeleteUserClasses(username string, classes []string, firestoreClient *firestore.Client, ctx context.Context) error {
	// for each class, check if user is creator. if they are, delete the class. else, remove user from usersWithAccess
	for _, classID := range classes {
		classData, err := firestoreClient.Collection("classes").Doc(classID).Get(ctx)
		if err != nil {
			return err
		}

		classDataRes := classData.Data()		
		creatorUsername := classDataRes["creatorUsername"]

		// if not creator, remove access (update usersWithAccess for classes/classID)
		// if they ARE the creator, delete the class itself
		if username != creatorUsername { 
			var newUsersAccessArray []string
			for _, userWithAccess := range classDataRes["usersWithAccess"].([]interface {}) {
				userWithAccess := userWithAccess.(string)
				if username != userWithAccess {
					newUsersAccessArray = append(newUsersAccessArray, userWithAccess)
				} 
			}

			_, err := firestoreClient.Collection("classes").Doc(classID).Update(ctx, []firestore.Update{
                {
                    Path:  "usersWithAccess",
                    Value: newUsersAccessArray,
                },
            })
			if err != nil {
				return err
			}
		} else { 
			err := DeleteClass(classID, firestoreClient, ctx)
			if err != nil {
				return err
			}

		}
	}

	return nil
}

// assumes classID exists and request is valid (user is authorized to delete class)
func DeleteClass(classID string, firestoreClient *firestore.Client, ctx context.Context) error {

	classData, err := GetClassData(classID, firestoreClient, ctx)
	if err != nil {
		return err
	}

	// for each user with access to the class, remove the class from their classesWithAccessTo
	for _, userWithAccess := range classData["usersWithAccess"].([]interface {}) {
		userWithAccess := userWithAccess.(string)
		classesWithAccessTo, err := GetClassesWithAccessTo(userWithAccess, firestoreClient, ctx)
		if err != nil {
			return err
		}

		newClassesWithAccessTo := []string{}
		for _, classWithAccessTo := range classesWithAccessTo {
			if classWithAccessTo != classID {
				newClassesWithAccessTo = append(newClassesWithAccessTo, classWithAccessTo)
			}
		}

		_, err = firestoreClient.Collection("users").Doc(userWithAccess).Update(ctx, []firestore.Update{
			{
				Path: "classesWithAccessTo",
				Value: newClassesWithAccessTo,
			},
		})
		if err != nil {
			return err
		}
	}
	
	// delete the notes subcollection
	err = deleteNotesSubcollection(classID, firestoreClient, ctx)
	if err != nil {
		return err
	}

	// finally, delete the class itself
	_, err = firestoreClient.Collection("classes").Doc(classID).Delete(ctx)
	if err != nil {
		return err
	}

	return nil

}

func deleteNotesSubcollection(classID string, firestoreClient *firestore.Client, ctx context.Context) error {
	iter := firestoreClient.Collection("classes").Doc(classID).Collection("notes").Documents(ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return err
		}

		_, err = doc.Ref.Delete(ctx)
		if err != nil {
			return err
		}
	}

	return nil
}

// params: classCode, className, creatorUsername, professor(optional), location (optional), meeting(optional)
func CreateClass(classCode string, className string, creatorUsername string, professor string, location string, meeting string, firestoreClient *firestore.Client, ctx context.Context) (string, error) {
	ref := firestoreClient.Collection("classes").NewDoc()
	
	_, err := ref.Set(ctx, map[string]interface{}{
		"classCode": classCode,
		"className": className,
		"creatorUsername": creatorUsername,
		"professor": professor,
		"location": location,
		"meeting": meeting,
		"usersWithAccess": []string{creatorUsername},
	})
	if err != nil {
		return "", err
	}

	// update creator's classesWithAccessTo
	newClassesAccessToArray, err := GetClassesWithAccessTo(creatorUsername, firestoreClient, ctx)
	if err != nil {
		return "", err
	}

	classID := ref.ID
	newClassesAccessToArray = append(newClassesAccessToArray, classID)

	_, err = firestoreClient.Collection("users").Doc(creatorUsername).Update(ctx, []firestore.Update{
		{
			Path: "classesWithAccessTo",
			Value: newClassesAccessToArray,
		},
	})
	if err != nil {
		return "", err
	}

	// create a new notes subcollection
	// collections require at least one document so a default note is created w/ dummy data
	err = createFirstNote(classID, firestoreClient, ctx); if err != nil {
		return "", err
	}

	return classID, nil

}

func GetClassOwner(classID string, firestoreClient *firestore.Client, ctx context.Context) (string, error) {
	classDoc, err := firestoreClient.Collection("classes").Doc(classID).Get(ctx)
	if err != nil {
		return "", err
	}

	classData := classDoc.Data()
	ownerUsername := classData["creatorUsername"].(string)

	return ownerUsername, nil
}

func createFirstNote(classID string, firestoreClient *firestore.Client, ctx context.Context) error {
	_, err := firestoreClient.Collection("classes").Doc(classID).Collection("notes").Doc("myFirstNote").Set(ctx, map[string]interface{}{
		"note": "This is your first note! You can add collaborators by updating class settings.",
	})
	if err != nil {
		return err
	}

	return nil
}

func AddUserToClass(classID string, username string, firestoreClient *firestore.Client, ctx context.Context) error {
	// first, check if user exist
	userExists, err := CheckUserExists(username, firestoreClient, ctx)
	if err != nil {
		return err
	}

	if !userExists {
		return status.Error(codes.NotFound, "User does not exist")
	}

	// update class usersWithAccess
	classData, err := GetClassData(classID, firestoreClient, ctx)
	if err != nil {
		return err
	}

	usersWithAccess := classData["usersWithAccess"].([]interface {})
	usersWithAccess = append(usersWithAccess, username)

	_, err = firestoreClient.Collection("classes").Doc(classID).Update(ctx, []firestore.Update{
		{
			Path: "usersWithAccess",
			Value: usersWithAccess,
		},
	})
	if err != nil {
		return err
	}

	// update user classesWithAccessTo
	userClassesWithAccessTo, err := GetClassesWithAccessTo(username, firestoreClient, ctx)
	if err != nil {
		return err
	}

	userClassesWithAccessTo = append(userClassesWithAccessTo, classID)
	_, err = firestoreClient.Collection("users").Doc(username).Update(ctx, []firestore.Update{
		{
			Path: "classesWithAccessTo",
			Value: userClassesWithAccessTo,
		},
	})
	if err != nil {
		return err
	}

	return nil
}

// disallows creator removing himself
func RemoveUserFromClass(classID string, username string, firestoreClient *firestore.Client, ctx context.Context) error {
	classOwner, err := GetClassOwner(classID, firestoreClient, ctx)
	if err != nil {
		return err
	}

	if classOwner == username {
		return status.Error(codes.PermissionDenied, "Creator cannot remove themselves from class")
	}

	// update usersWithAccess
	classData, err := GetClassData(classID, firestoreClient, ctx)
	if err != nil {
		return err
	}

	usersWithAccess := classData["usersWithAccess"].([]interface {})
	newUsersWithAccess := []string{}

	for _, userWithAccess := range usersWithAccess {
		if userWithAccess.(string) != username {
			newUsersWithAccess = append(newUsersWithAccess, userWithAccess.(string))
		}
	}

	_, err = firestoreClient.Collection("classes").Doc(classID).Update(ctx, []firestore.Update{
		{
			Path: "usersWithAccess",
			Value: newUsersWithAccess,
		},
	})
	if err != nil {
		return err
	}

	// finally, update user classesWithAccessTo
	classesWithAccessTo, err := GetClassesWithAccessTo(username, firestoreClient, ctx)
	if err != nil {
		return err
	}

	newClassesWithAccessTo := []string{}
	for _, classWithAccessTo := range classesWithAccessTo {
		if classWithAccessTo != classID {
			newClassesWithAccessTo = append(newClassesWithAccessTo, classWithAccessTo)
		}
	}

	_, err = firestoreClient.Collection("users").Doc(username).Update(ctx, []firestore.Update{
		{
			Path: "classesWithAccessTo",
			Value: newClassesWithAccessTo,
		},
	})
	if err != nil {
		return err
	}

	return nil
}