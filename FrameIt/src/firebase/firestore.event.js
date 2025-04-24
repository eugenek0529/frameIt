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
  serverTimestamp,
  setDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject,
  getStorage,
  listAll
} from 'firebase/storage';
import QRCode from 'qrcode';

const DEFAULT_CAPACITY = 30;

// Helper function to generate a 4-digit access code
const generateAccessCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a number between 1000-9999
};

// Helper function to generate QR code
const generateQRCode = async (eventId) => {
  try {
    // Generate QR code with event ID and higher quality settings
    const qrCodeDataUrl = await QRCode.toDataURL(eventId, {
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Convert data URL to blob
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const qrCodeRef = ref(storage, `events/${eventId}/qr-code.png`);
    await uploadBytes(qrCodeRef, blob, {
      contentType: 'image/png'
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(qrCodeRef);
    return downloadURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Create Event
export const createEvent = async (eventData, coverImageFile, userId) => {
  try {
    // Generate access code
    const accessCode = generateAccessCode();

    // Create event document
    const eventRef = doc(collection(db, 'events'));
    const eventId = eventRef.id;

    // Generate QR code and get URL
    const qrCodeUrl = await generateQRCode(eventId);

    // Prepare event data
    const eventWithMetadata = {
      ...eventData,
      accessCode,
      qrCodeUrl,
      creatorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tags: eventData.tags ? eventData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      attendees: [] // Initialize empty attendees array
    };

    // If there's a cover image, upload it
    if (coverImageFile) {
      const imageRef = ref(storage, `events/${eventId}/cover`);
      await uploadBytes(imageRef, coverImageFile);
      eventWithMetadata.coverImageUrl = await getDownloadURL(imageRef);
    }

    // Save event data
    await setDoc(eventRef, eventWithMetadata);

    // Add event to creator's myEvents array
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      myEvents: arrayUnion({
        eventId,
        eventName: eventData.name,
        role: 'creator',
        joinedAt: new Date().toISOString()
      })
    });

    return {
      id: eventId,
      ...eventWithMetadata,
    };
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
    
    // If there's a new cover image, upload it
    if (newCoverImageFile) {
      const imageRef = ref(storage, `events/${eventId}/cover`);
      await uploadBytes(imageRef, newCoverImageFile);
      updateData.coverImageUrl = await getDownloadURL(imageRef);
    }

    // Update the event
    await updateDoc(eventRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
      tags: updateData.tags ? updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
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
    // First get the event data
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();

    // Delete files from Storage
    const storage = getStorage();

    // 1. Delete cover image if exists
    if (eventData.coverImageUrl) {
      try {
        const coverImageRef = ref(storage, `events/${eventId}/cover`);
        await deleteObject(coverImageRef);
        console.log('Cover image deleted successfully');
      } catch (error) {
        console.error('Error deleting cover image:', error);
      }
    }

    // 2. Delete QR code if exists
    if (eventData.qrCodeUrl) {
      try {
        const qrCodeRef = ref(storage, `events/${eventId}/qr-code.png`);
        await deleteObject(qrCodeRef);
        console.log('QR code deleted successfully');
      } catch (error) {
        console.error('Error deleting QR code:', error);
      }
    }

    // 3. Delete the entire event folder in storage (in case there are other files)
    try {
      const eventFolderRef = ref(storage, `events/${eventId}`);
      const filesList = await listAll(eventFolderRef);
      
      // Delete all remaining files in the folder
      await Promise.all(
        filesList.items.map(fileRef => deleteObject(fileRef))
      );
      console.log('All event files deleted successfully');
    } catch (error) {
      console.error('Error deleting event folder:', error);
    }

    // Collect all users who need to be updated
    const usersToUpdate = new Set(); // Using Set to avoid duplicates
    
    // 1. Add creator
    usersToUpdate.add(eventData.creatorId);
    
    // 2. Add all attendees who are authenticated users
    eventData.attendees?.forEach(attendee => {
      if (attendee.userId) { // Only for authenticated users
        usersToUpdate.add(attendee.userId);
      }
    });

    console.log(`Updating myEvents for ${usersToUpdate.size} users`);

    // Update each user's document
    await Promise.all(
      Array.from(usersToUpdate).map(async (userId) => {
        const userRef = doc(db, 'users', userId);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            // Get current myEvents array
            const myEvents = userDoc.data().myEvents || [];
            
            // Filter out the deleted event
            const updatedMyEvents = myEvents.filter(event => event.eventId !== eventId);
            
            // Update the user document
            await updateDoc(userRef, {
              myEvents: updatedMyEvents
            });
            
            console.log(`Successfully updated myEvents for user ${userId}`);
          }
        } catch (error) {
          console.error(`Error updating user ${userId}:`, error);
          // Continue with other users even if one fails
        }
      })
    );

    // Finally delete the event document
    await deleteDoc(eventRef);

    console.log('Event deleted and all users updated successfully');
  } catch (error) {
    console.error('Error in deleteEvent:', error);
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

// Add or update attendee
export const addAttendeeToEvent = async (eventId, attendeeData) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();
    const existingAttendee = eventData.attendees?.find(
      attendee => attendee.email === attendeeData.email
    );

    if (existingAttendee) {
      // If attendee exists, update their information
      const updatedAttendees = eventData.attendees.map(attendee => 
        attendee.email === attendeeData.email
          ? {
              ...attendee,
              name: attendeeData.name, // Update name in case it changed
              relationship: attendeeData.relationship, // Update relationship in case it changed
              lastJoinedAt: new Date().toISOString() // Track their latest join
            }
          : attendee
      );

      await updateDoc(eventRef, {
        attendees: updatedAttendees,
        updatedAt: serverTimestamp()
      });

      return { ...existingAttendee, updated: true };
    } else {
      // If attendee doesn't exist, add them as new
      const newAttendee = {
        ...attendeeData,
        joinedAt: new Date().toISOString(),
        lastJoinedAt: new Date().toISOString()
      };

      await updateDoc(eventRef, {
        attendees: arrayUnion(newAttendee),
        updatedAt: serverTimestamp()
      });

      return { ...newAttendee, new: true };
    }
  } catch (error) {
    console.error('Error adding/updating attendee:', error);
    throw error;
  }
};

// Add this new function
export const checkAttendeeStatus = async (eventId, userId) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      return false;
    }

    const event = eventDoc.data();
    
    // Check if user exists in attendees array
    return event.attendees?.some(attendee => 
      attendee.userId === userId || 
      (attendee.email === userId) // This handles the case where we pass email instead of userId
    ) || false;
  } catch (error) {
    console.error('Error checking attendee status:', error);
    return false;
  }
};