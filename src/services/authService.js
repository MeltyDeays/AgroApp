// src/services/authService.js

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

/**
 * Inicia sesión de un usuario con email y contraseña en Firebase.
 */
export const loginUser = async (email, password) => {
  if (!email || !password) {
    return { success: false, error: 'Por favor, ingresa correo y contraseña.' };
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    console.error("Error de inicio de sesión en authService:", error.code);
    return { success: false, error: 'Credenciales incorrectas. Intenta nuevamente.' };
  }
};