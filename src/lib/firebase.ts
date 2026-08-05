import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import appletConfig from "../../firebase-applet-config.json";

// Web app Firebase configuration (supports Environment variables or Applet Config)
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || appletConfig?.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || appletConfig?.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || appletConfig?.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || appletConfig?.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig?.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || appletConfig?.appId,
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || appletConfig?.measurementId
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics conditionally
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics errors
  });
}

// Initialize Auth service
export const auth = getAuth(app);

// Initialize Firestore with custom database ID from config
const dbId = (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || appletConfig?.firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

// Test Firestore connection on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client offline check:", error.message);
    }
  }
}
testConnection();

export { app, analytics };
export default app;
