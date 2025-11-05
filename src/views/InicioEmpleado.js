import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import styles from '../styles/empleadoStyles'; // Reutilizamos tus estilos!
import { CheckSquare, Tractor, LogOut } from 'lucide-react-native'; // O 'react-native-vector-icons'

export default function InicioEmpleado() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const manejarCerrarSesion = async () => {
    await signOut(auth);
    // El listener en App.js se encargará de moverlo al Login
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}>
        <View style={styles.mainContainer}>
          <Text style={styles.headerTitle}>Portal del Empleado</Text>
          <Text style={styles.headerSubtitle}>Bienvenido, {user?.displayName || user?.email}</Text>

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
              onPress={() => navigation.navigate('VistaEmpleado')} // Navega a tu vista de asistencia
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
              style={[styles.primaryButton, { backgroundColor: '#2563EB' }]} // Botón azul
              onPress={() => navigation.navigate('GestionMaquinariaEmpleado')} // Navega a la nueva vista
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