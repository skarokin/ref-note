# ref:note
Student-focused note taking web app with collaborative editing and class sharing. 
- Web app built with Next.js, deployed on Firebase Hosting
- Authentication with OAuth2/Google Sign-In. Sessions managed by Auth.js
- Go API for CRUD operations running on Google Cloud Functions
- NoSQL database on Firestore
- Socket.IO (Node.js) WebSocket server for real-time note collaboration. Nginx for SSL and Certbot to generate/auto-renew certificates. Deployed on EC2 with Docker Compose
- Remirror text editor for efficient note update operations

### app security
- All user session objects generated server-side
- Session object is verified server-side before any API call
- All API calls are performed server-side to prevent tampering

### database schema
- users/[userID] (userID is gmail address w/o the domain)
    - username: string
    - classesWithAccessTo: []string
- classes/[classID] (classID is auto-generated)
    - classCode: string
    - className: string
    - creatorID: string
    - location: string
    - meeting: string
    - professor: string
    - usersWithAccess: []string
- classes/[classID]/notes/[noteName]
    - noteContent: string

### collaborative editing architecture
- user opens some `classes/[classID]/notes/[noteName]`
    - either open a new room if they are the only one, or join it
    - if opening a new room, call Go API to fetch note content from database, then store note content in-memory
- user makes a change on client; send to WebSocket server
    - updates in-memory note content
    - relays this change to all other client as `insertText` commands (provided by Remirror)
- user leaves the room or is disconnected
    - if they are the last user, then call Go API to update database with new note content
        - trying to stay in the free tier of Firestore which is why there are no periodic updates

### go api endpoints
- users:
    - GET `/signin/{userID}` signs in a user via Google Sign-in. If their user ID does not exist in the database, then create a new account with default values. Return their info and classes they have access to
    - POST `/changeUsername` allows a user to change their displayed username (does not affect user ID)
    - DELETE `/deleteUser/{userID}` deletes a user and propagates any necessary changes to classes they were in or classes they created
    - POST `/createClass` creates a class with a unique classID with user-inputted information. This is put on the user level since we need to associate a creator ID and because class creation is done in the user dashboard
- classes:
    - GET `/getClass/{classID}` retrieves all information about a class and displays all notes in the notes subcollection. Any user can call this, but whether or not information is displayed depends on if they have access to the class
    - POST `/createNote` creates a new note in the notes subcollection, enforcing a unique note name per class ID. Initialized as an empty string. Any user with access can create a note
    - DELETE `/deleteClass/{classID}` deletes a class and propagates any necessary changes to users that were in it or the person who created it. Only the class creator can delete the class
    - DELETE `/deleteNote/{classID}/{noteName}` fully deletes a note in the notes subcollection. This is put on the class level since allowing users to delete a note while having one open is omega mendokusai. Only the class creator can delete a note 
    - PATCH `/updatePermissions` updates which users have access to the class. Only the class creator can update permissions
    - PATCH `/updateInfo` updates general class information, i.e. professor, class name, location, etc. Any user with access can update general class information
- notes:
    - GET `/getNote/{classID}/{noteName}` retrieves note content for given class ID and note name. Any user can call this, but whether or not note content is displayed depends on if they have access to the class
    - POST `/updateNote` updates note contents with the state of the in-memory note in the WebSocket server; this is only called after the last person disconnects from the room to keep within Firestore free tier
