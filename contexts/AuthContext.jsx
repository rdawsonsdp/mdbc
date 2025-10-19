'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth timeout - setting loading to false');
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      try {
        if (user) {
          // Create or update user document in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLoginAt: serverTimestamp(),
            createdAt: serverTimestamp()
          }, { merge: true });
          
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        // Still set user even if Firestore write fails
        setUser(user);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('AuthContext: Starting Google sign in...');
      console.log('AuthContext: Firebase config check:', {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Present' : 'Missing'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('AuthContext: Google sign in successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('AuthContext: Error signing in with Google:', error);
      console.error('AuthContext: Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update the user's display name
      if (displayName) {
        await result.user.updateProfile({ displayName });
      }
      return result.user;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
