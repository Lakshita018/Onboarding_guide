# Firebase + Cloudinary Setup Guide

## 1. Firebase Admin SDK — Service Account Key

The server uses **Firebase Admin SDK** to verify ID tokens and read/write Firestore.
It needs a Service Account private key.

### How to get it

1. Open [Firebase Console](https://console.firebase.google.com/) → select your project **onboarding-guide-4ba2f**
2. Go to **Project Settings** (gear icon) → **Service Accounts** tab
3. Click **Generate new private key** → save the downloaded JSON file

### How to configure it (choose one method)

#### Method A — individual env vars (recommended for local dev)

Create `server/.env` with:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=<clientEmail from the JSON>
FIREBASE_PRIVATE_KEY="<privateKey from the JSON — keep the quotes, keep \n as-is>"

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

The `privateKey` field looks like:
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----\n
```
Copy it **exactly** (including the `\n` escape sequences) and wrap in double-quotes.

#### Method B — JSON file path

Place the downloaded JSON as `server/serviceAccountKey.json` and set:

```
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

#### Method C — inline JSON string (production / CI)

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"onboarding-guide-4ba2f",...}
```

---

## 2. Firestore — Enable Email/Password Auth

1. Firebase Console → **Authentication** → **Sign-in method** tab
2. Enable **Email/Password** provider

---

## 3. Firestore — Seed the Admin user

The Firestore `users` collection already has an admin document.
If it does **not** exist yet, create it manually in the Firebase Console:

**Collection:** `users`  
**Document ID:** *(any — e.g. click Auto-ID or use the Firebase Auth UID of the admin)*

**Fields:**
| Field | Value |
|-------|-------|
| name | IBM Admin |
| email | admin@ibm.com |
| role | admin |
| status | ACTIVE |
| department | HR |
| createdAt | *(server timestamp)* |

Then create the matching **Firebase Auth** user:
1. Firebase Console → **Authentication** → **Add user**
2. Email: `admin@ibm.com`, Password: *(choose a strong password)*
3. Copy the generated UID
4. In Firestore → `users` collection, rename the document ID to that UID (or create it with the UID as the doc ID)

---

## 4. Cloudinary

Add your Cloudinary credentials to `server/.env`:
- `CLOUDINARY_CLOUD_NAME` — from your Cloudinary dashboard
- `CLOUDINARY_API_KEY` — from your Cloudinary dashboard
- `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard

---

## 5. Running the application

```bash
# Terminal 1 — Start backend
cd server
npm install        # if not done
npm run dev

# Terminal 2 — Start frontend
cd client
npm install        # if not done
npm run dev
```

The backend will print `Firebase Admin SDK initialized.` and `Cloudinary configured for cloud: v5meggxj` on startup.

---

## What changed vs the SQLite version

| Area | Before | After |
|------|--------|-------|
| Authentication | JWT + bcrypt + SQLite | Firebase Auth (client) + Firebase ID token verification (server) |
| User storage | SQLite `users` table | Firestore `users` collection |
| Employee data | SQLite `employees` table | Firestore `employees` collection |
| Documents | Stored on disk at `uploads/` | Uploaded to Cloudinary; URL stored in Firestore `documents` |
| Checklist | SQLite `checklist_items` table | Firestore `checklists` collection |
| Tasks | SQLite `tasks` table | Firestore `tasks` collection |
| Access requests | SQLite `access_requests` table | Firestore `accessRequests` collection |
| Chat logs | SQLite `chat_logs` table | Firestore `chatLogs` collection |
| Socket.IO | Unchanged | Unchanged |
| Role routing | Unchanged | Unchanged |
| UI | Unchanged | Unchanged |
