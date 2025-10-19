# Firebase Admin SDK Setup

To enable server-side book context loading, you need to set up Firebase Admin SDK.

## Option 1: Service Account Key (Recommended for Development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `cardology-1558b`
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Add these environment variables to your `.env.local`:

```env
# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=cardology-1558b
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cardology-1558b.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
```

## Option 2: Default Credentials (For Production)

If deploying to Vercel, you can use default credentials by setting the service account as a secret in Vercel.

## Current Status

Without these environment variables, the system will:
- ✅ Work with basic ChatGPT responses
- ❌ Not load book content for context
- ✅ Still provide cardology-based business advice

## Test Book Context

After setting up the environment variables:

1. Upload a book at `/book-upload`
2. Test chat at `/chat-test`
3. Ask: "What are my high vibration traits?"
4. Response should reference your uploaded book content

