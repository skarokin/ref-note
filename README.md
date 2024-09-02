# ref:note
Student-focused note taking web app with collaborative editing and class sharing. 
- Web app built with Next.js, deployed on Vercel
- Authentication with OAuth2/Google Sign-In. Sessions managed by Auth.js
- Go API for CRUD operations running on Google Cloud Run
- WebSocket (Node.js) server for real-time note collaboration. Uses Yjs documents to sync data between clients. Deployed on Google Cloud Run (as a separate instance)
- NoSQL database on Firestore
- BlockNote editor for actual note taking

### app security
- All user session objects generated server-side
- Session object is verified server-side before any API call
- Granular access is checked before any API call
- All API calls are performed server-side to prevent tampering
