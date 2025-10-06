# Shared Authentication Library for MDBC Applications

This library provides shared authentication functionality across multiple MDBC applications using Firebase.

## Features

- 🔐 **Google Sign-In** - OAuth with Google
- 📧 **Email/Password Authentication** - Traditional login
- 🔄 **Password Reset** - Forgot password functionality
- 👤 **User Profile Management** - Shared user data across apps
- 📱 **Cross-App Session** - Login once, access all apps
- 🎨 **Customizable UI** - Flexible styling options

## Installation

### Option 1: Copy Files (Recommended for now)
Copy the `shared-auth` folder to each of your applications.

### Option 2: NPM Package (Future)
```bash
npm install @mdbc/shared-auth
```

## Setup

### 1. Environment Variables
Add these to your `.env.local` file in each application:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: App identification
NEXT_PUBLIC_APP_NAME=your_app_name
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Firebase Console Setup
In your Firebase Console → Authentication → Settings → Authorized domains, add all your application domains:

```
localhost
127.0.0.1
app1.vercel.app
app2.vercel.app
app3.vercel.app
your-custom-domain.com
```

### 3. Enable Authentication Methods
In Firebase Console → Authentication → Sign-in method:
- ✅ Enable **Google**
- ✅ Enable **Email/Password**

## Usage

### Basic Setup

```jsx
// app/layout.js
import { AuthProvider } from '../shared-auth';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Using AuthButton

```jsx
// components/LoginPage.jsx
import { AuthButton } from '../shared-auth';

export default function LoginPage() {
  return (
    <div>
      <h1>Welcome to App 2</h1>
      <AuthButton 
        showHistory={false}  // Hide history for this app
        showEmailAuth={true} // Show email auth
        customStyles={{
          googleButton: { backgroundColor: '#your-color' },
          emailButton: { backgroundColor: '#your-color' }
        }}
      />
    </div>
  );
}
```

### Using Auth Context

```jsx
// components/ProtectedContent.jsx
import { useAuth } from '../shared-auth';

export default function ProtectedContent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <p>Email: {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Application Structure

```
your-app/
├── shared-auth/           # Copy this folder
│   ├── auth-context.jsx   # Authentication context
│   ├── auth-button.jsx    # Login/logout button
│   ├── firebase-config.js # Firebase configuration
│   └── index.js          # Main exports
├── app/
│   └── layout.js         # Wrap with AuthProvider
├── components/
│   └── YourComponent.jsx # Use useAuth() hook
└── .env.local           # Firebase config
```

## Shared User Data

When users sign in, their data is automatically shared across all applications:

```javascript
// User document structure in Firestore
{
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  lastLoginAt: timestamp,
  createdAt: timestamp,
  applications: {
    "app1": {
      lastAccessed: timestamp,
      version: "1.0.0"
    },
    "app2": {
      lastAccessed: timestamp,
      version: "1.0.0"
    }
  }
}
```

## Customization

### Custom Styling
```jsx
<AuthButton 
  customStyles={{
    googleButton: { 
      backgroundColor: '#your-color',
      borderRadius: '8px'
    },
    emailButton: { 
      backgroundColor: '#your-color' 
    }
  }}
/>
```

### Conditional Features
```jsx
<AuthButton 
  showHistory={false}    // Hide session history
  showEmailAuth={false}  // Hide email authentication
/>
```

## Troubleshooting

### Common Issues

1. **"Domain not authorized"**
   - Add your domain to Firebase Console → Authentication → Authorized domains

2. **"Popup blocked"**
   - Allow popups for your domain in browser settings

3. **"Configuration missing"**
   - Check all environment variables are set correctly

### Debug Mode
The library includes comprehensive error logging. Check browser console for detailed error messages.

## Security Notes

- All authentication is handled by Firebase
- User data is stored securely in Firestore
- Each application can only access its own user data
- Cross-app authentication is seamless and secure

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Firebase configuration
3. Ensure all domains are authorized
4. Check environment variables
