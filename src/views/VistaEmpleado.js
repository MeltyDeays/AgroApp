import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { auth } from "../../firebaseConfig";

import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  registrarEntradaSalida,
  obtenerHistorialEmpleado,
} from "../services/asistenciaService";
import Toast from "react-native-toast-message";
import styles from "../styles/empleadoStyles.js";


const getFechasFiltro = (filtro) => {
  const fin = new Date();
  const inicio = new Date();
  fin.setHours(23, 59, 59, 999);
  inicio.setHours(0, 0, 0, 0);

  switch (filtro) {
    case "ultimo_mes":
      inicio.setDate(inicio.getDate() - 30);
      break;
    case "mes_anterior":
      inicio.setMonth(inicio.getMonth() - 1, 1);
      fin.setMonth(fin.getMonth(), 0);
      break;
    case "medio_ano":
      inicio.setMonth(inicio.getMonth() - 6);
      break;
    case "ano":
      inicio.setFullYear(inicio.getFullYear() - 1);
      break;
  }
  return { inicio, fin };
};

export default function VistaEmpleado() {
  const [permission, requestPermission] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [modoEscaneo, setModo] = useState("entrada");
  const [mostrarEscanner, setMostrarEscanner] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");

  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState("ultimo_mes");
  
  
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    requestPermission();
  }, []);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      if (authenticatedUser) {
        setUser(authenticatedUser); 
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe(); 
  }, []); 

  
  useEffect(() => {
    
    if (user) {
      setCodigoManual(user.uid); 
      cargarHistorial(); 
    } else {
      setHistorial([]);
    }
  }, [user, filtroActivo]); 
  

  const cargarHistorial = async () => {
    if (!user) return; 
    setCargandoHistorial(true);
    try {
      const { inicio, fin } = getFechasFiltro(filtroActivo);
      const resultados = await obtenerHistorialEmpleado(
        user.uid,
        inicio,
        fin
      );
      setHistorial(resultados);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cargar el historial.",
      });
      console.log(
        "Recuerda crear el índice en Firestore si es la primera vez.", error
      );
    } finally {
      setCargandoHistorial(false);
    }
  };

  const manejarEscaneo = async ({ data }) => {
    setEscaneado(true);
    setMostrarEscanner(false);
    if (!user) return; 
    const codigoEmpleado = user.uid; 
    const esEntrada = modoEscaneo === "entrada";
    try {
      const resultado = await registrarEntradaSalida(codigoEmpleado, esEntrada);
      if (resultado.success) {
        Toast.show({ type: "success", text1: "Éxito", text2: resultado.message });
        await cargarHistorial();
      } else {
        Toast.show({ type: "info", text1: "Información", text2: resultado.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo registrar la asistencia" });
    }
    setTimeout(() => setEscaneado(false), 3000);
  };

  const manejarRegistroManual = async (esEntrada) => {
    if (!user) return; 
    const codigoEmpleado = user.uid; 
    const accionTexto = esEntrada ? "Entrada" : "Salida";
    try {
      const resultado = await registrarEntradaSalida(codigoEmpleado, esEntrada);
      if (resultado.success) {
        Toast.show({ type: "success", text1: "Éxito", text2: resultado.message });
        await cargarHistorial();
      } else {
        Toast.show({ type: "info", text1: "Información", text2: resultado.message });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `No se pudo registrar la ${accionTexto.toLowerCase()}`,
      });
    }
  };

  const manejarCerrarSesion = async () => {
    signOut(auth);
  };

  
  if (!permission || !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#047857" />
        <Text style={{marginTop: 10, color: '#6B7280'}}>Cargando datos de usuario...</Text>
      </View>
    );
  }
  

  if (!permission.granted) {
    return (
      <View style={[styles.container, { padding: 20 }]}>
        <Text style={styles.textoInfo}>
          Necesitamos permiso para usar la cámara.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.textoBoton}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mostrarEscanner) {
    return (
      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={escaneado ? undefined : manejarEscaneo}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <Text style={[styles.headerTitle, { color: 'white' }]}>Escaneando para {modoEscaneo}</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setMostrarEscanner(false)}
          >
            <Text style={styles.textoBoton}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}>
        <View style={styles.mainContainer}>
          <Text style={styles.headerTitle}>Portal del Empleado</Text>
          <Text style={styles.headerSubtitle}>Bienvenido, {user?.email}</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registro por QR</Text>
          <Text style={styles.cardSubtitle}>
            Apunta la cámara al QR del quiosco
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setModo("entrada");
                setMostrarEscanner(true);
              }}
            >
              <Text style={styles.primaryButtonText}>Escanear Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setModo("salida");
                setMostrarEscanner(true);
              }}
            >
              <Text style={styles.secondaryButtonText}>Escanear Salida</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registro Manual</Text>
          <Text style={styles.cardSubtitle}>
            Tu ID de empleado se usa para el registro.
          </Text>
          <TextInput
            style={styles.input}
            value={codigoManual}
            editable={false}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => manejarRegistroManual(true)}
            >
              <Text style={styles.primaryButtonText}>Registrar Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => manejarRegistroManual(false)}
            >
              <Text style={styles.secondaryButtonText}>Registrar Salida</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial de Asistencia</Text>
          <View style={styles.filtrosContainer}>
            <TouchableOpacity
              onPress={() => setFiltroActivo("ultimo_mes")}
              style={[
                styles.filtroBoton,
                filtroActivo === "ultimo_mes" && styles.filtroBotonActivo,
              ]}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroActivo === "ultimo_mes" && styles.filtroTextoActivo,
                ]}
              >
                Último Mes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFiltroActivo("mes_anterior")}
              style={[
                styles.filtroBoton,
                filtroActivo === "mes_anterior" && styles.filtroBotonActivo,
              ]}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroActivo === "mes_anterior" && styles.filtroTextoActivo,
                ]}
              >
                Mes Anterior
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFiltroActivo("medio_ano")}
              style={[
                styles.filtroBoton,
                filtroActivo === "medio_ano" && styles.filtroBotonActivo,
              ]}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroActivo === "medio_ano" && styles.filtroTextoActivo,
                ]}
              >
                6 Meses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFiltroActivo("ano")}
              style={[
                styles.filtroBoton,
                filtroActivo === "ano" && styles.filtroBotonActivo,
              ]}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtroActivo === "ano" && styles.filtroTextoActivo,
                ]}
              >
                Año
              </Text>
            </TouchableOpacity>
          </View>

          {cargandoHistorial ? (
            <ActivityIndicator
              style={{ marginTop: 20 }}
              size="large"
              color="#047857"
            />
          ) : historial.length > 0 ? (
            historial.map((item) => (
              <View key={item.id} style={styles.historialItem}>
                <Text style={styles.historialFecha}>
                  {new Date(item.fecha.seconds * 1000).toLocaleDateString(
                    "es-ES",
                    { weekday: "long", day: "numeric", month: "short" }
                  )}
                </Text>
                <Text style={styles.historialTexto}>
                  Entrada: {item.entrada || "N/A"}
                </Text>
                <Text style={styles.historialTexto}>
                  Salida: {item.salida || "N/A"}
                </Text>
                <Text style={[styles.historialTexto, { fontWeight: "bold" }]}>
                  Estado: {item.estado}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.historialVacio}>
              No hay registros en este período.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={manejarCerrarSesion}
        >
          <Text style={styles.primaryButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}