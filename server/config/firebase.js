/**
 * firebase.js
 * Firebase Admin SDK initialization for v14+.
 * In v14 the SDK is split into subpath packages — we import from them directly.
 */
require('dotenv').config();

const { initializeApp, getApps, cert, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth }      = require('firebase-admin/auth');

if (!getApps().length) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Inline JSON string supplied via env var (production / CI)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Path to a service account file
    credential = applicationDefault();
  } else {
    // Build from individual env vars
    credential = cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    });
  }

  initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || 'onboarding-guide-4ba2f',
  });

  console.log('Firebase Admin SDK initialized.');
}

const db = getFirestore();
// Force REST transport and explicitly target the default database
db.settings({ preferRest: true, databaseId: '(default)' });

const auth = getAuth();

module.exports = { db, auth };
