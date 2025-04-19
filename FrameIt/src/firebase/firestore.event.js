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
  setDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import QRCode from 'qrcode';

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
      qrCodeUrl, // Store the URL
      creatorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tags: eventData.tags ? eventData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    };

    // If there's a cover image, upload it
    if (coverImageFile) {
      const imageRef = ref(storage, `events/${eventId}/cover`);
      await uploadBytes(imageRef, coverImageFile);
      eventWithMetadata.coverImageUrl = await getDownloadURL(imageRef);
    }

    // Save event data
    await setDoc(eventRef, eventWithMetadata);

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
    // Get event data first to check for images
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();

    // Delete cover image if it exists
    if (eventData.coverImageUrl) {
      const imageRef = ref(storage, `events/${eventId}/cover`);
      try {
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Error deleting cover image:', error);
      }
    }

    // Delete QR code if it exists
    if (eventData.qrCodeUrl) {
      // QR code URL is stored as a string, so no need to delete from storage
    }

    // Delete the event document
    await deleteDoc(doc(db, 'events', eventId));
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