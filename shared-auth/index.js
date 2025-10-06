// Shared Authentication Library for MDBC Applications
// Export all authentication components and utilities

export { AuthProvider, useAuth } from './auth-context.jsx';
export { default as AuthButton } from './auth-button.jsx';
export { auth, db, googleProvider } from './firebase-config.js';

// Utility functions for session management
export const sessionManager = {
  // Add session management functions here
  saveSession: async (userId, sessionData) => {
    // Implementation for saving sessions
  },
  getUserSessions: async (userId) => {
    // Implementation for getting user sessions
  }
};

// Configuration helper
export const getAppConfig = () => {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'mdbc',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    firebaseConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    }
  };
};
