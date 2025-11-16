

import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";


import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig"; 
import { UserProvider } from "./src/context/UserContext";


import LoginScreen from "./src/views/Login.js";
import InicioAdministrador from "./src/views/InicioAdministrador.js";


import InicioEmpleado from "./src/views/InicioEmpleado.js"; 
import VistaEmpleado from "./src/views/VistaEmpleado.js"; 
import GestionMaquinariaEmpleado from "./src/views/empleado_modules/GestionMaquinaria.js";


import InicioProveedor from "./src/views/proveedor_modules/InicioProveedor.js";



import MapaFinca from "./src/views/admin_modules/MapaFinca.js";



const Stack = createNativeStackNavigator();


const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);


const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="InicioAdministrador"
      component={InicioAdministrador}
      options={{ headerShown: false }}
    />
    
    {/* --- (INICIO DE MODIFICACIÓN) --- */}
    {/* 2. Añadir la pantalla del Mapa al Stack del Admin */}
    <Stack.Screen
      name="MapaFinca"
      component={MapaFinca}
      options={{ headerShown: false }}
    />
    {/* --- (FIN DE MODIFICACIÓN) --- */}

  </Stack.Navigator>
  
);


const EmployeeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="InicioEmpleado"
      component={InicioEmpleado}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="VistaEmpleado"
      component={VistaEmpleado}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="GestionMaquinariaEmpleado"
      component={GestionMaquinariaEmpleado}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);


const ProveedorStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="InicioProveedor"
      component={InicioProveedor}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);



export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      try {
        if (authenticatedUser) {
          
          const userDocRef = doc(db, "usuarios", authenticatedUser.uid); 
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
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
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const userRole = user?.role || user?.rol; 

  return (
    <UserProvider>
      <NavigationContainer>
        {(() => {
          if (!user) {
            return <AuthStack />;
          }
          switch (userRole) { 
            case 'admin':
              return <AdminStack />;
            case 'empleado':
              return <EmployeeStack />;
            case 'proveedor': 
              return <ProveedorStack />;
            default:
              return <AuthStack />;
          }
        })()}
      </NavigationContainer>
      <Toast />
    </UserProvider>
  );
}