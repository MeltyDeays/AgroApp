import React, { useState, useEffect, useMemo } from "react"; // Añadido useMemo
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { registrarEntradaSalida, obtenerRegistrosAsistencia } from "../services/asistenciaService";
import QRCode from 'react-native-qrcode-svg';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import styles from "../styles/asistenciaStyles"; // Asegúrate que la ruta es correcta

export function VistaAsistencia({ navigation }) {
  // --- ESTADOS ---
  const [registrosAsistencia, setRegistrosAsistencia] = useState([]);
  const [codigoEmpleado, setCodigoEmpleado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  
  const [qrKioscoData, setQrKioscoData] = useState('');
  const [mostrarEscanner, setMostrarEscanner] = useState(false);
  const [modoEscaneo, setModoEscaneo] = useState('entrada');
  const [escaneado, setEscaneado] = useState(false);

  // --- NUEVO ESTADO PARA FILTRO ---
  const [filtroEstado, setFiltroEstado] = useState('all'); // 'all', 'Presente', 'Tardanza', etc.

  // --- EFECTOS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Si no hay usuario (ej. cierra sesión), no hacemos nada aquí
      // La redirección principal la maneja App.js
      if (currentUser) {
        requestPermission(); // Pide permiso de cámara si hay usuario
        cargarRegistrosHoy(); // Carga registros si hay usuario
      }
    });
    return () => unsubscribe(); // Limpia el listener al desmontar
  }, []); // Se ejecuta solo al montar

  useEffect(() => {
    const actualizarQR = () => setQrKioscoData(new Date().toISOString());
    actualizarQR();
    const intervalId = setInterval(actualizarQR, 60000); // Actualiza cada minuto
    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
  }, []);

  // --- MANEJADORES DE LÓGICA ---
  const cargarRegistrosHoy = async () => {
    setCargando(true);
    setFiltroEstado('all'); // Resetea el filtro al cargar/actualizar
    try {
      const registros = await obtenerRegistrosAsistencia(); // Llama al servicio
      setRegistrosAsistencia(registros); // Actualiza el estado con los datos
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "No se pudieron cargar los registros" });
    } finally {
      setCargando(false); // Quita el indicador de carga
    }
  };
  
  // Abre la cámara para escanear
  const iniciarEscaneo = (modo) => {
    setModoEscaneo(modo);
    setMostrarEscanner(true);
    setEscaneado(false); // Resetea el estado de escaneo
  };
  
  // Procesa el código QR escaneado
  const manejarEscaneoQR = async ({ data }) => {
    setEscaneado(true); // Evita escanear múltiples veces
    setMostrarEscanner(false); // Cierra la cámara
    const esEntrada = modoEscaneo === 'entrada';
    const accionTexto = esEntrada ? 'Entrada' : 'Salida';
    try {
        const resultado = await registrarEntradaSalida(data, esEntrada); // Llama al servicio
        if (resultado.success) {
            Toast.show({ type: "success", text1: "Éxito", text2: `${accionTexto} registrada` });
            await cargarRegistrosHoy(); // Recarga la lista
        } else {
            Toast.show({ type: "info", text1: "Información", text2: resultado.message });
        }
    } catch (error) {
        Toast.show({ type: "error", text1: "Error", text2: `No se pudo registrar la ${accionTexto.toLowerCase()}` });
    }
  };

  // Procesa el registro manual con UID
  const manejarRegistroManual = async (esEntrada) => {
    if (!codigoEmpleado) return Toast.show({ type: "error", text1: "Error", text2: "Por favor ingrese un código" });
    const accionTexto = esEntrada ? 'Entrada' : 'Salida';
    try {
      const resultado = await registrarEntradaSalida(codigoEmpleado, esEntrada); // Llama al servicio
      if (resultado.success) {
          Toast.show({ type: "success", text1: "Éxito", text2: `${accionTexto} registrada` });
          await cargarRegistrosHoy(); // Recarga la lista
      } else {
          Toast.show({ type: "info", text1: "Información", text2: resultado.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: `No se pudo registrar la ${accionTexto.toLowerCase()}` });
    }
    setCodigoEmpleado(""); // Limpia el campo de texto
  };

  // Devuelve el JSX para la insignia de estado (con colores)
  const obtenerInsigniaEstado = (estado) => {
    const estilosInsignia = {
      Presente: { backgroundColor: "#d1fae5", color: "#10b981" }, // Verde
      Completado: { backgroundColor: "#d1fae5", color: "#10b981" }, // Verde
      Tardanza: { backgroundColor: "#fefcbf", color: "#f59e0b" }, // Amarillo
      Ausente: { backgroundColor: "#fee2e2", color: "#ef4444" }, // Rojo
      Parcial: { backgroundColor: "#fed7aa", color: "#f97316" }, // Naranja
    };
    // Estilo por defecto si el estado no coincide
    const { backgroundColor, color } = estilosInsignia[estado] || { backgroundColor: "#e5e7eb", color: "#6b7280" };
    
    return (
      <View style={[styles.insignia, { backgroundColor, borderColor: color }]}>
        <Text style={{ color, fontSize: 12, paddingHorizontal: 8 }}>
          {/* Muestra N/A si no hay estado */}
          {estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : 'N/A'}
        </Text>
      </View>
    );
  };
  
  // Calcula las estadísticas para las tarjetas de resumen
  const estadisticas = {
    // Cuenta Presente Y Completado como presentes
    presentes: registrosAsistencia.filter(r => r.estado === 'Presente' || r.estado === 'Completado').length,
    tardanzas: registrosAsistencia.filter(r => r.estado === 'Tardanza').length,
    ausentes: registrosAsistencia.filter(r => r.estado === 'Ausente').length,
    parciales: registrosAsistencia.filter(r => r.estado === 'Parcial').length,
  };

  // --- LÓGICA DE FILTRADO ---
  // Memoiza la lista filtrada para evitar recálculos innecesarios
  const registrosFiltrados = useMemo(() => {
    // Si el filtro es 'all', devuelve la lista completa
    if (filtroEstado === 'all') {
      return registrosAsistencia;
    }
    // Caso especial para "Presentes" que incluye "Completado"
    if (filtroEstado === 'Presente') { 
      return registrosAsistencia.filter(r => r.estado === 'Presente' || r.estado === 'Completado');
    }
    // Filtro normal para los demás estados
    return registrosAsistencia.filter(r => r.estado === filtroEstado);
  }, [registrosAsistencia, filtroEstado]); // Se recalcula si cambia la lista o el filtro

  // --- RENDERIZADO CONDICIONAL ---
  // Muestra carga mientras se piden permisos o se cargan datos
  if (!permission || cargando) {
    return (
        <View style={[styles.contenedor, styles.center]}>
            <ActivityIndicator size="large" color="#047857" />
            <Text style={styles.cargandoText}>{!permission ? 'Verificando permisos...' : 'Cargando registros...'}</Text>
        </View>
    );
  }

  // Muestra si no se concedió permiso de cámara
  if (!permission.granted) {
    return (
      <View style={[styles.contenedor, styles.center, {padding: 20}]}>
        <Text style={styles.errorText}>Necesitamos tu permiso para usar la cámara.</Text>
        <TouchableOpacity style={styles.botonPrimario} onPress={requestPermission}>
            <Text style={styles.textoBoton}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Muestra la vista de cámara si está activada
  if (mostrarEscanner) {
    return (
      <View style={styles.scannerContainer}>
          <CameraView
            onBarcodeScanned={escaneado ? undefined : manejarEscaneoQR} // Llama a manejarEscaneoQR al escanear
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }} // Solo detecta QR
            style={StyleSheet.absoluteFillObject} // Ocupa toda la pantalla
          />
           {/* Overlay con texto y botón de cancelar */}
           <View style={styles.scannerOverlay}>
              <Text style={styles.scannerText}>Escaneando QR para {modoEscaneo === 'entrada' ? 'ENTRADA' : 'SALIDA'}...</Text>
              <TouchableOpacity style={styles.scannerButton} onPress={() => setMostrarEscanner(false)}>
                   <Text style={styles.scannerButtonText}>Cancelar</Text>
              </TouchableOpacity>
           </View>
      </View>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <View style={styles.contenedor}>
      {/* FlatList para mostrar la lista de registros */}
      <FlatList
        contentContainerStyle={styles.contentContainer} // Estilos del contenedor interno
        // Componentes que aparecen antes de la lista
        ListHeaderComponent={
          <>
            {/* Encabezado con título y fecha */}
            <View style={styles.encabezado}>
              <Text style={styles.titulo}>Panel de Asistencia</Text>
              <Text style={styles.fecha}>
                {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </Text>
            </View>

            {/* Tarjeta con el QR del Quiosco */}
            <View style={[styles.tarjeta, { alignItems: 'center', paddingVertical: 20 }]}>
              <Text style={styles.tituloTarjeta}>Quiosco: Escanear para Registrar</Text>
              <View style={{ marginTop: 15, padding: 10, backgroundColor: 'white', borderRadius: 8, elevation: 3 }}>
                {/* Muestra el QR o un indicador de carga */}
                {qrKioscoData ? <QRCode value={qrKioscoData} size={220}/> : <ActivityIndicator size="large" />}
              </View>
              <Text style={{ marginTop: 15, color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>
                Código para que el empleado escanee. Se actualiza cada minuto.
              </Text>
            </View>

            {/* Tarjeta con Herramientas de Administrador */}
            <View style={styles.tarjeta}>
              <Text style={styles.tituloTarjeta}>Herramientas de Administrador</Text>
              {/* Sección para escanear QR de empleado */}
              <View style={styles.seccion}>
                <Text style={styles.tituloSeccion}>Escanear QR de Empleado</Text>
                <View style={styles.filaBotones}>
                  <TouchableOpacity style={styles.botonPrimario} onPress={() => iniciarEscaneo('entrada')}>
                    <Text style={styles.textoBoton}>Escanear Entrada</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botonSecundario} onPress={() => iniciarEscaneo('salida')}>
                    <Text style={[styles.textoBoton, {color: '#1e293b'}]}>Escanear Salida</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Sección para registro manual */}
              <View style={styles.seccion}>
                <Text style={styles.tituloSeccion}>Registro Manual por Código</Text>
                <TextInput
                  style={styles.entrada}
                  placeholder="Ingrese código de empleado (UID)"
                  value={codigoEmpleado}
                  onChangeText={setCodigoEmpleado}
                />
                <View style={styles.filaBotones}>
                  <TouchableOpacity style={styles.botonPrimario} onPress={() => manejarRegistroManual(true)}>
                    <Text style={styles.textoBoton}>Registrar Entrada</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botonSecundario} onPress={() => manejarRegistroManual(false)}>
                    <Text style={[styles.textoBoton, {color: '#1e293b'}]}>Registrar Salida</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Tarjeta con Resumen del Día */}
            <View style={styles.tarjeta}>
                <Text style={styles.tituloTarjeta}>Resumen del Día</Text>
                {/* Grilla con las 4 tarjetas de estadísticas */}
                <View style={styles.grillaEstadisticas}>
                  {/* Tarjeta Presentes (Clickeable) */}
                  <TouchableOpacity 
                    // Aplica estilo activo si el filtro coincide
                    style={[styles.tarjetaEstadistica, filtroEstado === 'Presente' && styles.tarjetaEstadisticaActiva]} 
                    onPress={() => setFiltroEstado('Presente')} // Cambia el filtro al presionar
                  >
                    <MaterialIcons name="check-circle" size={28} color="#10b981" />
                    <Text style={styles.valorEstadistica}>{estadisticas.presentes}</Text>
                    <Text style={styles.etiquetaEstadistica}>Presentes</Text>
                  </TouchableOpacity>
                  {/* Tarjeta Tardanzas (Clickeable) */}
                  <TouchableOpacity 
                    style={[styles.tarjetaEstadistica, filtroEstado === 'Tardanza' && styles.tarjetaEstadisticaActiva]} 
                    onPress={() => setFiltroEstado('Tardanza')}
                  >
                    <MaterialIcons name="access-time" size={28} color="#f59e0b" />
                    <Text style={styles.valorEstadistica}>{estadisticas.tardanzas}</Text>
                    <Text style={styles.etiquetaEstadistica}>Tardanzas</Text>
                  </TouchableOpacity>
                  {/* Tarjeta Ausentes (Clickeable) */}
                  <TouchableOpacity 
                    style={[styles.tarjetaEstadistica, filtroEstado === 'Ausente' && styles.tarjetaEstadisticaActiva]} 
                    onPress={() => setFiltroEstado('Ausente')}
                  >
                    <MaterialIcons name="cancel" size={28} color="#ef4444" />
                    <Text style={styles.valorEstadistica}>{estadisticas.ausentes}</Text>
                    <Text style={styles.etiquetaEstadistica}>Ausentes</Text>
                  </TouchableOpacity>
                  {/* Tarjeta Parciales (Clickeable) */}
                  <TouchableOpacity 
                    style={[styles.tarjetaEstadistica, filtroEstado === 'Parcial' && styles.tarjetaEstadisticaActiva]} 
                    onPress={() => setFiltroEstado('Parcial')}
                  >
                    <MaterialIcons name="hourglass-bottom" size={28} color="#f97316" />
                    <Text style={styles.valorEstadistica}>{estadisticas.parciales}</Text>
                    <Text style={styles.etiquetaEstadistica}>Parciales</Text>
                  </TouchableOpacity>
                </View>
            </View>

            {/* Tarjeta para la cabecera de la lista */}
            <View style={styles.tarjeta}>
              {/* Cabecera de la tabla */}
              <View style={styles.headerTabla}>
                {/* Título dinámico que muestra el filtro y permite resetear */}
                <TouchableOpacity onPress={() => setFiltroEstado('all')} disabled={filtroEstado === 'all'}>
                  <Text style={styles.tituloTarjeta}>
                    {/* Muestra el estado filtrado o "Registros de Hoy" */}
                    {filtroEstado === 'all' ? 'Registros de Hoy' : `Registros: ${filtroEstado}`}
                    {/* Muestra "(Mostrar Todos)" si hay un filtro activo */}
                    {filtroEstado !== 'all' && <Text style={styles.resetFiltroTexto}> (Mostrar Todos)</Text>}
                  </Text>
                </TouchableOpacity>
                {/* Botón para actualizar la lista */}
                <TouchableOpacity style={styles.botonRefrescar} onPress={cargarRegistrosHoy}>
                  <MaterialIcons name="refresh" size={16} color="#047857" />
                  <Text style={styles.textoRefrescar}>Actualizar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        // Datos para la lista (usa la versión filtrada)
        data={registrosFiltrados} 
        keyExtractor={(item) => item.id.toString()} // Clave única para cada ítem
        style={styles.listaContenedor} // Estilos para la lista en sí
        // Función que renderiza cada fila de la lista
        renderItem={({ item }) => (
          <View style={styles.filaTabla}>
            {/* Celda para el nombre (más ancha) */}
            <Text style={[styles.celdaTabla, {flex: 2, textAlign: 'left'}]}>{item.nombreEmpleado || item.id_empleado}</Text> 
            {/* Celdas para entrada, salida y estado */}
            <Text style={styles.celdaTabla}>{item.entrada || "-"}</Text>
            <Text style={styles.celdaTabla}>{item.salida || "-"}</Text>
            <View style={styles.celdaEstado}>
              {obtenerInsigniaEstado(item.estado)}
            </View>
          </View>
        )}
        // Componente a mostrar si la lista está vacía
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="schedule" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {/* Mensaje dinámico si hay filtro */}
              {filtroEstado === 'all' ? 'No hay registros de asistencia para hoy' : `No hay registros con estado "${filtroEstado}"`}
            </Text>
          </View>
        }
      />
    </View>
  );
}