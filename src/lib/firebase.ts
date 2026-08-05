import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import appletConfig from "../../firebase-applet-config.json";

// Web app Firebase configuration (supports Environment variables or Applet Config or SDK fallback)
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || appletConfig?.apiKey || "AIzaSyDmnPZ3t8VUtF4P-PuTcll9uYVTMM9I6QA",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || appletConfig?.authDomain || "website-cb8c5.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || appletConfig?.projectId || "website-cb8c5",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || appletConfig?.storageBucket || "website-cb8c5.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig?.messagingSenderId || "450392244519",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || appletConfig?.appId || "1:450392244519:web:1687c5dd7051c667d6a902",
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || appletConfig?.measurementId || "G-565BNPH423"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics conditionally (browser environment support)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics errors if blocked or not supported
  });
}

// Initialize Auth service
export const auth = getAuth(app);

// Initialize Firestore (supporting custom database ID if specified)
const dbId = (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || appletConfig?.firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

export { app, analytics };
export default app;
