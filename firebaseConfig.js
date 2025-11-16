import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


import { 
  initializeAuth, 
  getReactNativePersistence,
  getAuth,                       
  browserLocalPersistence      
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; 


const firebaseConfig = {
  apiKey: "AIzaSyDPpGSUQPf1JSOkrfUegiyeNtl1aW_LnjU",
  authDomain: "appgranja-b98ca.firebaseapp.com",
  projectId: "appgranja-b98ca",
  storageBucket: "appgranja-b98ca.firebasestorage.app",
  messagingSenderId: "990841062699",
  appId: "1:990841062699:web:9b4033c82c54cb1ee9316e",
  measurementId: "G-8P43BY80LP"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


let auth;

if (Platform.OS === 'web') {
  
  
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  
  
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

const db = getFirestore(app);


export { app, auth, db };