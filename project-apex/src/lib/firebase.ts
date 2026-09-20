import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDeI0QkTF7nh27ICM-7mXgsSXHuzt5S1OY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'apex-e351e.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://apex-e351e-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'apex-e351e',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'apex-e351e.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '740493413976',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:740493413976:web:f5470ed32c37a1463c842d',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-R6HNDDS8V9',
};

// Initialize Firebase client safely to prevent duplicate initialization during hot reload
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
};

export type { FirebaseUser };

let analytics: any = null;
if (typeof window !== 'undefined') {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      isSupported()
        .then((supported) => {
          if (supported) {
            try {
              analytics = getAnalytics(app);
            } catch {
              // Blocked by client adblocker, ignore safely
            }
          }
        })
        .catch(() => {});
    })
    .catch(() => {});
}

export { analytics };
