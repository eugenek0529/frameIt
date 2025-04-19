import { db, storage } from '../firebase/firebase.config';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';

// Create Event
export const createEvent = async (eventData, coverImageFile, userId) => {
  try {
    let coverImageUrl = '';
    
    // Handle image upload
    if (coverImageFile) {
      const filename = `${Date.now()}-${coverImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const storageRef = ref(storage, `event-covers/${filename}`);
      const uploadResult = await uploadBytes(storageRef, coverImageFile);
      coverImageUrl = await getDownloadURL(uploadResult.ref);
    }

    // Prepare event data
    const newEventData = {
      ...eventData,
      creatorId: userId,
      creationTimestamp: serverTimestamp(),
      coverImageUrl,
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'events'), newEventData);
    return { id: docRef.id, ...newEventData };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get Event by ID
export const getEventById = async (eventId) => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }
    return { id: eventDoc.id, ...eventDoc.data() };
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

// Get User's Events
export const getUserEvents = async (userId) => {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('creatorId', '==', userId)
    );
    
    const querySnapshot = await getDocs(eventsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user events:', error);
    throw error;
  }
};

// Update Event
export const updateEvent = async (eventId, updateData, newCoverImageFile) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    
    if (newCoverImageFile) {
      const filename = `${Date.now()}-${newCoverImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const storageRef = ref(storage, `event-covers/${filename}`);
      const uploadResult = await uploadBytes(storageRef, newCoverImageFile);
      updateData.coverImageUrl = await getDownloadURL(uploadResult.ref);
    }

    await updateDoc(eventRef, {
      ...updateData,
      lastUpdated: serverTimestamp()
    });

    return { id: eventId, ...updateData };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete Event
export const deleteEvent = async (eventId) => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();

    // Delete cover image if exists
    if (eventData.coverImageUrl) {
      const imageRef = ref(storage, eventData.coverImageUrl);
      await deleteObject(imageRef).catch(err => {
        console.warn('Error deleting image:', err);
      });
    }

    await deleteDoc(doc(db, 'events', eventId));
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Verify Event Access
export const verifyEventAccess = async (eventId, accessCode) => {
  try {
    const event = await getEventById(eventId);
    return event.accessCode === accessCode;
  } catch (error) {
    console.error('Error verifying event access:', error);
    throw error;
  }
}; 