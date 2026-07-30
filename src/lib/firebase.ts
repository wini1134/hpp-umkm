import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForFallback123456789',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'linen-theory-t74w7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'linen-theory-t74w7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'linen-theory-t74w7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1044300725151',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1044300725151:web:335f02edb69081e11d1baa',
};

const app = !getApps().length ? initializeApp(config) : getApp();
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
