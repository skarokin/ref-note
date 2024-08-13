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
		creatorID := classDataRes["creatorID"]

		// if not creator, remove access (update usersWithAccess for classes/classID)
		// if they ARE the creator, delete the class itself
		if username != creatorID { 
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

// assumes classID exists
func DeleteClass(classID string, firestoreClient *firestore.Client, ctx context.Context) error {

	classData, err := GetClassData(classID, firestoreClient, ctx)

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

// params: classCode, className, creatorID, professor(optional), location (optional), meeting(optional)
func CreateClassUtil(classCode string, className string, creatorID string, professor string, location string, meeting string, firestoreClient *firestore.Client, ctx context.Context) (string, error) {
	ref := firestoreClient.Collection("classes").NewDoc()
	
	_, err := ref.Set(ctx, map[string]interface{}{
		"classCode": classCode,
		"className": className,
		"creatorID": creatorID,
		"professor": professor,
		"location": location,
		"meeting": meeting,
		"usersWithAccess": []string{creatorID},
	})
	if err != nil {
		return "", err
	}

	newClassesAccessToArray, err := GetClassesWithAccessTo(creatorID, firestoreClient, ctx)
	if err != nil {
		return "", err
	}
	classID := ref.ID
	newClassesAccessToArray = append(newClassesAccessToArray, classID)

	_, err = firestoreClient.Collection("users").Doc(creatorID).Update(ctx, []firestore.Update{
		{
			Path: "classesWithAccessTo",
			Value: newClassesAccessToArray,
		},
	})
	if err != nil {
		return "", err
	}

	return classID, nil

}