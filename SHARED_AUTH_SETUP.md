# Shared Authentication Setup Guide

## 🎯 **Overview**
This guide will help you set up shared authentication across your MDBC applications using the same Firebase project.

## 📋 **Step-by-Step Setup**

### **Step 1: Firebase Console Configuration**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `cardology-1558b`
3. **Add Authorized Domains**:
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Click **"Add domain"**
   - Add all your application domains:

```
localhost
127.0.0.1
mdbc.vercel.app
app2.vercel.app
app3.vercel.app
your-custom-domain.com
```

### **Step 2: Copy Shared Auth Library**

Copy the `shared-auth` folder to each of your applications:

```bash
# For App 2
cp -r shared-auth /path/to/app2/

# For App 3  
cp -r shared-auth /path/to/app3/
```

### **Step 3: Environment Variables**

Add these to `.env.local` in each application:

```env
# Firebase Configuration (same for all apps)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCoDKkpvPIo2yQ26tb5B9VCyjRRTyaY7cM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cardology-1558b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cardology-1558b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cardology-1558b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=544328054089
NEXT_PUBLIC_FIREBASE_APP_ID=1:544328054089:web:d8925a754fd750abd9d698

# App-specific identification
NEXT_PUBLIC_APP_NAME=app2
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### **Step 4: Update App Layout**

In each application's `app/layout.js`:

```jsx
import './globals.css'
import { AuthProvider } from '../shared-auth'

export const metadata = {
  title: 'App 2 - MDBC',
  description: 'Your app description',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-serif">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### **Step 5: Add Authentication to Pages**

In your login/authentication pages:

```jsx
import { AuthButton } from '../shared-auth'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-600 mb-2">App 2</h1>
          <p className="text-gray-600">Your app description</p>
        </div>
        
        <div className="space-y-4">
          <AuthButton 
            showHistory={false}  // Hide history for this app
            showEmailAuth={true} // Show email auth
          />
        </div>
      </div>
    </div>
  )
}
```

### **Step 6: Use Authentication in Components**

```jsx
import { useAuth } from '../shared-auth'

export default function ProtectedComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>

  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <p>Email: {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

## 🔄 **How It Works**

### **Single Sign-On Experience**
1. User signs in to **App 1** (MDBC)
2. User visits **App 2** → Automatically signed in
3. User visits **App 3** → Automatically signed in
4. User signs out from any app → Signed out from all apps

### **Shared User Data**
- All user data stored in same Firestore database
- Profile information shared across applications
- Session history tracked per application
- Centralized user management

### **User Document Structure**
```javascript
{
  email: "user@example.com",
  displayName: "John Doe", 
  photoURL: "https://...",
  lastLoginAt: timestamp,
  createdAt: timestamp,
  applications: {
    "mdbc": {
      lastAccessed: timestamp,
      version: "1.0.0"
    },
    "app2": {
      lastAccessed: timestamp, 
      version: "1.0.0"
    },
    "app3": {
      lastAccessed: timestamp,
      version: "1.0.0"
    }
  }
}
```

## 🎨 **Customization Options**

### **Different Styling per App**
```jsx
<AuthButton 
  customStyles={{
    googleButton: { 
      backgroundColor: '#your-app-color',
      borderRadius: '12px'
    },
    emailButton: { 
      backgroundColor: '#your-app-color' 
    }
  }}
/>
```

### **Feature Toggles**
```jsx
<AuthButton 
  showHistory={false}    // Hide session history
  showEmailAuth={false}  // Google-only authentication
/>
```

## 🚀 **Deployment**

### **Vercel Environment Variables**
Add the same environment variables to each Vercel project:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all `NEXT_PUBLIC_FIREBASE_*` variables

### **Domain Authorization**
Make sure to add your Vercel domains to Firebase authorized domains:
- `app1.vercel.app`
- `app2.vercel.app` 
- `app3.vercel.app`

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Domain not authorized"**
   - Add domain to Firebase Console → Authentication → Authorized domains

2. **"Configuration missing"**
   - Check all environment variables are set
   - Verify `.env.local` file exists

3. **"Popup blocked"**
   - Allow popups for your domain
   - Check browser settings

### **Debug Mode**
The shared auth library includes comprehensive logging. Check browser console for detailed error messages.

## 📊 **Benefits**

- ✅ **Single Sign-On** - Login once, access all apps
- ✅ **Shared User Data** - Profile and preferences sync
- ✅ **Centralized Management** - One Firebase project
- ✅ **Consistent Experience** - Same auth flow everywhere
- ✅ **Easy Maintenance** - Update auth logic in one place
- ✅ **Scalable** - Add new apps easily

## 🎯 **Next Steps**

1. **Set up Firebase domains** (most important)
2. **Copy shared-auth library** to other apps
3. **Add environment variables** to each app
4. **Update layouts** to use AuthProvider
5. **Test cross-app authentication**
6. **Deploy and verify** on all domains

Your users will now have a seamless experience across all your MDBC applications! 🚀
