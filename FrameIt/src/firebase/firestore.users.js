import {doc, setDoc} from "firebase/firestore"
import { db } from "./firebase.config.js"

export const createUserDocument = async (user) => {
    if (!user) {
        console.error("No user provided to createUserDocument");
        return;
    }
    console.log("db object:", db);
    console.log("user.uid:", user.uid);

    // create a ref to the usr doc
    console.log("Creating document for user:", user);
    const userRef = doc(db, 'users', user.uid); 

    // user data to be stored
    const userData = {
        uid: user.uid,
        displayName: user.displayName || 'user', 
        email: user.email, 
        createdAt: new Date().toISOString(),
        myEvents: []  // Initialize empty myEvents array
    }; 

    try {
        // create and update the user document
        await setDoc(userRef, userData); 
        console.log("User document created successfully");
        return userRef;
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
}