// App.js

import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";

// --- Importaciones de Firebase ---
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig"; 

// --- Importaciones de tus Vistas ---
import LoginScreen from "./src/views/Login.js";
import InicioAdministrador from "./src/views/InicioAdministrador.js";
import VistaAdministrador from "./src/views/admin_modules/GestionMaquinaria.js";

// --- IMPORTACIONES DE EMPLEADO (ACTUALIZADAS) ---
import InicioEmpleado from "./src/views/InicioEmpleado.js"; // <-- NUEVO: El menú principal del empleado
import VistaEmpleado from "./src/views/VistaEmpleado.js"; // <-- Ya existía (Asistencia)
import GestionMaquinariaEmpleado from "./src/views/empleado_modules/GestionMaquinaria.js"; // <-- NUEVO: Maquinaria


const Stack = createNativeStackNavigator();

// Stack para usuarios no autenticados
const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Stack para usuarios con rol de Administrador
// (Sin cambios, InicioAdministrador maneja su propia navegación interna)
const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="InicioAdministrador"
      component={InicioAdministrador}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
  
);

// --- STACK DE EMPLEADO (ACTUALIZADO) ---
// Ahora contiene 3 pantallas, comenzando por el menú InicioEmpleado
const EmployeeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="InicioEmpleado" // 1. Esta es ahora la pantalla principal del empleado
      component={InicioEmpleado}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="VistaEmpleado" // 2. Esta es tu pantalla de Asistencia
      component={VistaEmpleado}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="GestionMaquinariaEmpleado" // 3. Esta es la nueva pantalla de Maquinaria
      component={GestionMaquinariaEmpleado}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// --- COMPONENTE PRINCIPAL APP (SIN CAMBIOS EN LA LÓGICA) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      try {
        if (authenticatedUser) {
          
          // Usamos "usuarios" como en tu archivo original
          const userDocRef = doc(db, "usuarios", authenticatedUser.uid); 
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // Añadimos el rol y otros datos de Firestore al objeto de usuario
            setUser({ ...authenticatedUser, ...userDoc.data() }); 
          } else {
            console.warn("Usuario autenticado pero sin documento en Firestore (en 'usuarios').");
            setUser(authenticatedUser); 
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error al obtener datos de usuario:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe; 
  }, []);

  if (loading) {
    // (Tu estilo de loading original)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Comprobamos 'role' o 'rol' como en tu archivo original
  const userRole = user?.role || user?.rol; 

  return (
    <>
      <NavigationContainer>
        {(() => {
          if (!user) {
            return <AuthStack />;
          }
          // El switch ahora funciona con el nuevo EmployeeStack
          switch (userRole) { 
            case 'admin':
              return <AdminStack />;
            case 'empleado': // <-- Esto ahora carga el menú de empleado
              return <EmployeeStack />;
            default:
              // Si no tiene rol (o un rol no reconocido), va al login
              return <AuthStack />;
          }
        })()}
      </NavigationContainer>
      <Toast />
    </>
  );
}