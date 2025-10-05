# Firebase Authentication Setup Guide

## Overview
This application now includes Firebase Authentication and Firestore for user session management. Users can sign in with Google and save their birth card readings to their personal history.

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `mdbc-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider:
   - Click on Google
   - Toggle "Enable"
   - Add your project support email
   - Click "Save"

### 3. Create Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Done"

### 4. Get Firebase Configuration
1. In Firebase Console, go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web app" icon (`</>`)
4. Register app with nickname: `mdbc-web`
5. Copy the configuration object

### 5. Set Environment Variables
Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

### 6. Deploy Firestore Security Rules
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init firestore`
4. Deploy rules: `firebase deploy --only firestore:rules`

Or manually copy the rules from `firestore.rules` to Firebase Console > Firestore > Rules.

## Features Implemented

### Authentication
- **Google Sign-In**: Users can sign in with their Google account
- **User Profile**: Displays user name, email, and avatar
- **Sign Out**: Secure logout functionality

### Session Management
- **Save Sessions**: Users can save their birth card readings
- **Session History**: View all previously saved sessions
- **Load Sessions**: Click any saved session to reload the reading
- **Session Data**: Stores name, birth date, birth card, and timestamp

### Security
- **User-Specific Data**: Users can only access their own data
- **Firestore Rules**: Secure database access rules
- **Authentication Required**: Session saving requires login

## Data Structure

### User Document
```
users/{userId}
├── email: string
├── displayName: string
├── photoURL: string
├── createdAt: timestamp
└── lastLoginAt: timestamp
```

### Session Document
```
users/{userId}/sessions/{sessionId}
├── name: string
├── birthMonth: string
├── birthDay: number
├── birthYear: number
├── birthCard: string
├── createdAt: timestamp
└── sourceVersion: string
```

## Usage

### For Users
1. **Sign In**: Click "Sign in with Google" button
2. **Save Session**: After generating a reading, click "Save Session"
3. **View History**: Click "History" to see saved sessions
4. **Load Session**: Click any saved session to reload it

### For Developers
- Authentication state is managed by `AuthContext`
- Session operations are in `utils/sessionManager.js`
- UI components: `AuthButton.jsx` and `SaveSessionButton.jsx`

## Troubleshooting

### Common Issues
1. **Firebase not initialized**: Check environment variables
2. **Authentication not working**: Verify Google provider is enabled
3. **Database access denied**: Check Firestore security rules
4. **Sessions not saving**: Ensure user is authenticated

### Debug Mode
The app includes debug information in development mode:
- CSV validation status
- Enhanced data loading status
- Console logs for session operations

## Next Steps
1. Set up your Firebase project
2. Configure environment variables
3. Deploy security rules
4. Test authentication flow
5. Verify session saving/loading

## Support
- Firebase Documentation: https://firebase.google.com/docs
- Next.js with Firebase: https://nextjs.org/docs/authentication
