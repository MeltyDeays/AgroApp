import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ 1. IMPORTA MÁS FUNCIONES DE FIREBASE/AUTH Y PLATFORM
import { 
  initializeAuth, 
  getReactNativePersistence,
  getAuth,                       // <--- NUEVO para la web
  browserLocalPersistence      // <--- NUEVO para la web
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; // <--- NUEVO para detectar la plataforma

// ⚠️ 2. REEMPLAZA ESTO CON TUS *NUEVAS* CLAVES DESDE LA CONSOLA DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDPpGSUQPf1JSOkrfUegiyeNtl1aW_LnjU",
  authDomain: "appgranja-b98ca.firebaseapp.com",
  projectId: "appgranja-b98ca",
  storageBucket: "appgranja-b98ca.firebasestorage.app",
  messagingSenderId: "990841062699",
  appId: "1:990841062699:web:9b4033c82c54cb1ee9316e",
  measurementId: "G-8P43BY80LP"
};
// Se inicializa la app UNA SOLA VEZ de forma segura
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ 2. AÑADE LA LÓGICA CONDICIONAL
let auth;

if (Platform.OS === 'web') {
  // --- Código para la Web ---
  // Obtenemos la instancia de Auth y luego le aplicamos la persistencia del navegador
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  // --- Tu código original para Móvil (Android/iOS) ---
  // No se borra nada, solo se mete dentro de este 'else'
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

const db = getFirestore(app);

// Se exportan las instancias para ser usadas en otros lados
export { app, auth, db };