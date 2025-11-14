// src/views/InicioEmpleado.js
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import styles from '../styles/empleadoStyles'; 
import { CheckSquare, Tractor, LogOut } from 'lucide-react-native'; 
// --- 1. Importa la campana ---
import NotificationBellEmpleado from '../components/NotificationBellEmpleado'; 

export default function InicioEmpleado() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const manejarCerrarSesion = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}>
        <View style={styles.mainContainer}>

          {/* --- 2. Modifica la cabecera --- */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: 8 
          }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Portal del Empleado</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
                Bienvenido, {user?.displayName || user?.email}
              </Text>
            </View>
            {/* --- 3. Añade la campana --- */}
            <NotificationBellEmpleado />
          </View>
          {/* --- Fin de la modificación --- */}


          {/* Tarjeta de Asistencia */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <CheckSquare size={24} color="#10B981" />
              <Text style={[styles.cardTitle, { marginLeft: 8, marginBottom: 0 }]}>Asistencia</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Registra tu entrada y salida, y consulta tu historial.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('VistaEmpleado')} 
            >
              <Text style={styles.primaryButtonText}>Ir a Asistencia</Text>
            </TouchableOpacity>
          </View>

          {/* Tarjeta de Maquinaria */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Tractor size={24} color="#2563EB" />
              <Text style={[styles.cardTitle, { marginLeft: 8, marginBottom: 0 }]}>Maquinaria</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Consulta la disponibilidad y reserva maquinaria.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#2563EB' }]} 
              onPress={() => navigation.navigate('GestionMaquinariaEmpleado')} // Navega a la vista de empleado
            >
              <Text style={styles.primaryButtonText}>Ir a Maquinaria</Text>
            </TouchableOpacity>
          </View>

          {/* Botón de Salir */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={manejarCerrarSesion}
          >
            <LogOut size={16} color="#FFFFFF" />
            <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}