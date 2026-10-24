import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

// Read config from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if credentials have been populated
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('your_api_key')
  );
};

// Initialize Firebase App singleton safely
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export { app, auth, db };

/**
 * Sign In with Email & Password
 */
export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase configuration keys not detected in .env. Please add your VITE_FIREBASE_* keys.');
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Register / Sign Up with Email, Password & Display Name
 * Also saves user record into Firestore database
 */
export async function registerWithEmail(email, password, displayName = '') {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase configuration keys not detected in .env. Please add your VITE_FIREBASE_* keys.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (displayName) {
    try {
      await updateProfile(user, { displayName });
    } catch (e) {
      console.warn('Could not update profile displayName:', e);
    }
  }

  // Create user document in Firestore database
  if (db) {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email.split('@')[0],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (dbErr) {
      console.warn('Firestore user doc sync warning:', dbErr);
    }
  }

  return user;
}

/**
 * Sign In with Google via Popup
 * Syncs user to Firestore
 */
export async function loginWithGoogle() {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase configuration keys not detected in .env. Please add your VITE_FIREBASE_* keys.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Sync profile to Firestore database
  if (db) {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (dbErr) {
      console.warn('Firestore user doc sync warning:', dbErr);
    }
  }

  return user;
}

/**
 * Sign Out user
 */
export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Save translation session or message to Firestore database
 */
export async function saveUserSessionData(uid, sessionData) {
  if (!db || !uid) return;
  try {
    const userSessionsRef = collection(db, 'users', uid, 'sessions');
    await addDoc(userSessionsRef, {
      ...sessionData,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error('Error saving session to Firestore:', err);
  }
}
