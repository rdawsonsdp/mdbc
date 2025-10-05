import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

/**
 * Save a user session to Firestore
 * @param {string} userId - User's Firebase UID
 * @param {Object} sessionData - Session data to save
 * @returns {Promise<string>} Document ID of saved session
 */
export async function saveSession(userId, sessionData) {
  try {
    const { name, birthMonth, birthDay, birthYear, birthCard } = sessionData;
    
    const sessionRef = await addDoc(collection(db, 'users', userId, 'sessions'), {
      name,
      birthMonth,
      birthDay,
      birthYear,
      birthCard,
      createdAt: new Date(),
      sourceVersion: '1.0.0'
    });
    
    console.log('Session saved with ID:', sessionRef.id);
    return sessionRef.id;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

/**
 * Get user's session history
 * @param {string} userId - User's Firebase UID
 * @param {number} limitCount - Number of sessions to fetch (default: 20)
 * @returns {Promise<Array>} Array of session objects
 */
export async function getUserSessions(userId, limitCount = 20) {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const sessions = [];
    
    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return sessions;
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    throw error;
  }
}

/**
 * Delete a user session
 * @param {string} userId - User's Firebase UID
 * @param {string} sessionId - Session document ID
 */
export async function deleteSession(userId, sessionId) {
  try {
    await deleteDoc(doc(db, 'users', userId, 'sessions', sessionId));
    console.log('Session deleted:', sessionId);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

/**
 * Save user profile data to Firestore
 * @param {string} userId - User's Firebase UID
 * @param {Object} profileData - Profile data to save
 */
export async function saveUserProfile(userId, profileData) {
  try {
    const { name, birthMonth, birthDay, birthYear, birthCard } = profileData;
    
    await setDoc(doc(db, 'users', userId), {
      profile: {
        name,
        birthMonth,
        birthDay,
        birthYear,
        birthCard,
        lastUpdated: new Date()
      }
    }, { merge: true });
    
    console.log('User profile saved:', profileData);
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

/**
 * Get user profile data from Firestore
 * @param {string} userId - User's Firebase UID
 * @returns {Promise<Object|null>} User profile data or null
 */
export async function getUserProfile(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.profile || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}
