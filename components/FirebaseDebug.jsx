'use client'

import React from 'react';

const FirebaseDebug = () => {
  const checkFirebaseConfig = () => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    console.log('Firebase Configuration Check:');
    console.log('API Key:', config.apiKey ? 'Present' : 'MISSING');
    console.log('Auth Domain:', config.authDomain ? 'Present' : 'MISSING');
    console.log('Project ID:', config.projectId ? 'Present' : 'MISSING');
    console.log('Storage Bucket:', config.storageBucket ? 'Present' : 'MISSING');
    console.log('Messaging Sender ID:', config.messagingSenderId ? 'Present' : 'MISSING');
    console.log('App ID:', config.appId ? 'Present' : 'MISSING');

    const missing = Object.entries(config).filter(([key, value]) => !value);
    
    if (missing.length > 0) {
      console.error('Missing Firebase configuration:', missing.map(([key]) => key));
      alert(`Missing Firebase configuration: ${missing.map(([key]) => key).join(', ')}`);
    } else {
      console.log('All Firebase configuration present');
      alert('All Firebase configuration is present');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={checkFirebaseConfig}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
      >
        Debug Firebase
      </button>
    </div>
  );
};

export default FirebaseDebug;
