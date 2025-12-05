import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const CONFIG_KEY = 'dourado_ercolin_firebase_config';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// HARDCODED CONFIGURATION - Dourado & Ercolin
// This ensures the app loads directly without the Setup Screen.
const DEFAULT_CONFIG: FirebaseConfig = {
    apiKey: "AIzaSyALje9uxZcgzuVWg3AN0f-qqMn_Hkx3YJU",
    authDomain: "aplicativo-tarefas-cfc13.firebaseapp.com",
    projectId: "aplicativo-tarefas-cfc13",
    storageBucket: "aplicativo-tarefas-cfc13.firebasestorage.app",
    messagingSenderId: "916761113972",
    appId: "1:916761113972:web:5469b764552b412fe66821"
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

export const saveConfig = (config: FirebaseConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  initFirebase(config);
  window.location.reload(); 
};

export const getConfig = (): FirebaseConfig => {
  // Check local storage first (in case of overrides), otherwise use default
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const initFirebase = (config: FirebaseConfig = getConfig()) => {
  if (!config) return null;
  
  try {
    if (!app) {
      app = initializeApp(config);
      db = getFirestore(app);
    }
    return db;
  } catch (error) {
    console.error("Failed to initialize Firebase", error);
    return null;
  }
};

export const getDb = () => {
  if (!db) {
    initFirebase();
  }
  return db;
};

// Always returns true now because we have the DEFAULT_CONFIG
export const isConfigured = () => true;