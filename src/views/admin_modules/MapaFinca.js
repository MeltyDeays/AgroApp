// src/views/admin_modules/MapaFinca.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  SafeAreaView, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Platform
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker, Callout } from 'react-native-maps';
import { ArrowLeft, Edit2, Check, X, Users, ClipboardList, Calendar } from 'lucide-react-native'; 
import styles from '../../styles/mapaStyles'; 
import { useUsers } from '../../context/UserContext';
import * as mapaService from '../../services/mapaService'; 
// --- AÑADIDO ---
import DateTimePicker from "@react-native-community/datetimepicker";


// Coordenadas iniciales de la finca
const regionInicialFinca = {
  latitude: 12.1675,
  longitude: -85.3688,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};


// --- Modal para ver Empleados (Diseño mejorado por estilos) ---
const EmpleadosModal = ({ visible, sector, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [empleados, setEmpleados] = useState([]);
  const { getUserFullName } = useUsers();

  useEffect(() => {
    if (visible && sector) { 
      setLoading(true);
      mapaService.getEmpleadosPorSector(sector.id)
        .then(setEmpleados)
        .catch(err => Alert.alert("Error", err.message))
        .finally(() => setLoading(false));
    }
  }, [visible, sector]);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Users size={24} color="#1F2937" style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.modalTitle}>Empleados en {sector?.nombre || 'Sector'}</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#10B981" />
          ) : (
            <FlatList
              data={empleados}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listText}>{getUserFullName(item.uid)}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyListText}>No hay empleados asignados.</Text>}
            />
          )}
          <TouchableOpacity style={[styles.modalButtonClose, {marginTop: 16}]} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Modal para crear Tareas (MODIFICADO con fechas) ---
const TareaModal = ({ visible, sector, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [detalles, setDetalles] = useState('');
  // --- AÑADIDO ESTADOS DE FECHA ---
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('inicio');
  // ---------------------------------
  
  const handleConfirmDate = (date) => {
    // Asegura formato YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]; 
    if (datePickerMode === 'inicio') {
      setFechaInicio(formattedDate);
    } else {
      setFechaFin(formattedDate);
    }
    setDatePickerVisible(false);
  };
  
  const handleShowDatePicker = (mode) => {
    setDatePickerMode(mode);
    setDatePickerVisible(true);
  };

  const handleCrearTarea = async () => {
    if (!titulo || !detalles || !fechaInicio || !fechaFin) { 
      Alert.alert("Error", "Debe ingresar título, detalles, fecha de inicio y fecha de fin.");
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Alert.alert("Error", "La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }
    if (!sector || !sector.id) {
        Alert.alert("Error", "No se ha seleccionado un sector válido.");
        return;
    }
    setLoading(true);
    try {
      await mapaService.crearTarea(titulo, detalles, sector.id, fechaInicio, fechaFin);
      Alert.alert("Éxito", "Tarea creada. Se notificará a los empleados.");
      setTitulo('');
      setDetalles('');
      setFechaInicio('');
      setFechaFin('');
      onClose();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Valor inicial para el datepicker
  const initialDate = datePickerMode === 'inicio' && fechaInicio ? new Date(fechaInicio) : 
                      datePickerMode === 'fin' && fechaFin ? new Date(fechaFin) : 
                      new Date();


  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ClipboardList size={24} color="#1F2937" style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.modalTitle}>Nueva Tarea en {sector?.nombre || 'Sector'}</Text>
          
          <Text style={styles.label}>Título de la Tarea</Text>
          <TextInput style={styles.input} placeholder="Ej: Plantación de trigo" value={titulo} onChangeText={setTitulo} />
          
          <Text style={styles.label}>Detalles</Text>
          <TextInput style={[styles.input, { height: 100 }]} placeholder="Ej: Plantar 50 hectáreas en la zona norte..." value={detalles} onChangeText={setDetalles} multiline />
          
          {/* --- INPUTS DE FECHA --- */}
          <Text style={styles.label}>Fecha de Inicio</Text>
          <TouchableOpacity 
            style={[styles.input, {marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]} 
            onPress={() => handleShowDatePicker('inicio')}
          >
            <Text style={{color: fechaInicio ? styles.listText.color : '#9CA3AF'}}>
              {fechaInicio || "Seleccionar fecha de inicio (YYYY-MM-DD)"}
            </Text>
            <Calendar size={20} color="#6B7280" />
          </TouchableOpacity>

          <Text style={styles.label}>Fecha de Fin Aproximada</Text>
          <TouchableOpacity 
            style={[styles.input, {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]} 
            onPress={() => handleShowDatePicker('fin')}
          >
            <Text style={{color: fechaFin ? styles.listText.color : '#9CA3AF'}}>
              {fechaFin || "Seleccionar fecha de fin (YYYY-MM-DD)"}
            </Text>
            <Calendar size={20} color="#6B7280" />
          </TouchableOpacity>
          {/* -------------------------- */}
          
          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.modalButtonClose} onPress={onClose} disabled={loading}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleCrearTarea} disabled={loading}>
              {loading ? ( <ActivityIndicator color="#FFFFFF" /> ) : ( <Text style={styles.modalButtonConfirmText}>Crear Tarea</Text> )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* DatePicker */}
      {isDatePickerVisible && (
        <DateTimePicker
          value={initialDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              handleConfirmDate(selectedDate);
            } else if (Platform.OS === 'android') {
              setDatePickerVisible(false); // Cierra en Android si se cancela
            }
          }}
        />
      )}
    </Modal>
  );
};


// --- Modal para Tareas Actuales ---
const TareasActualesModal = ({ visible, onClose, sectores }) => {
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState([]);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const tareasData = await mapaService.fetchTareas();
      setTareas(tareasData);
    } catch (err) {
      // Manejar el error de permisos aquí
      Alert.alert("Error de Acceso", "No se pudieron cargar las tareas. Asegúrese de que el Administrador tenga permisos de 'lectura' en la colección 'tareas' de Firestore.");
      setTareas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      cargarTareas();
    }
  }, [visible]);

  const handleMarcarCompletada = (tarea) => {
    Alert.alert(
      "Confirmar Tarea",
      `¿Marcar la tarea "${tarea.titulo}" como completada?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Completar",
          onPress: async () => {
            try {
              await mapaService.marcarTareaCompletada(tarea.id);
              Alert.alert("Éxito", "Tarea marcada como completada.");
              cargarTareas(); 
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderItem = ({ item }) => {
    const sector = sectores.find(s => s.id === item.sectorId);
    const fechaInicio = formatFecha(item.fechaInicio);
    const fechaFin = formatFecha(item.fechaFin);
    const isCompleted = item.estado === 'completada';

    return (
      <View style={[styles.taskCard, isCompleted && { opacity: 0.6, borderLeftColor: '#E5E7EB', backgroundColor: '#F9FAFB' }]}>
        <Text style={[styles.taskTitle, isCompleted && {textDecorationLine: 'line-through'}]}>{item.titulo}</Text>
        <Text style={styles.taskDetail}>Sector: {sector?.nombre || item.sectorId}</Text>
        <Text style={styles.taskDetail}>Detalles: {item.detalles}</Text>
        <Text style={styles.taskDetail}>Período: {fechaInicio} al {fechaFin}</Text>
        <Text style={[styles.taskStatus, isCompleted && {color: '#6B7280'}]}>
          Estado: {isCompleted ? 'Completada' : 'Pendiente'}
        </Text>
        {!isCompleted && (
          <View style={styles.taskActionRow}>
            <TouchableOpacity 
              style={styles.buttonCompleteTask} 
              onPress={() => handleMarcarCompletada(item)}
            >
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.buttonCompleteText}>Marcar Completado</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ClipboardList size={24} color="#1F2937" style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.modalTitle}>Tareas ({tareas.filter(t => t.estado === 'pendiente').length} Pendientes)</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#10B981" />
          ) : (
            <FlatList
              data={tareas}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{paddingVertical: 10}}
              ListEmptyComponent={<Text style={styles.emptyListText}>No hay tareas registradas.</Text>}
            />
          )}
          <TouchableOpacity style={[styles.modalButtonClose, {marginTop: 16}]} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


export default function MapaFinca({ navigation }) {
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); 
  
  const [modalEmpleadosVisible, setModalEmpleadosVisible] = useState(false);
  const [modalTareaVisible, setModalTareaVisible] = useState(false);
  const [modalTareasActualesVisible, setModalTareasActualesVisible] = useState(false);
  const [sectorSeleccionado, setSectorSeleccionado] = useState(null);
  
  const mapRef = useRef(null); 

  const cargarSectores = async () => {
    setLoading(true);
    try {
      const sectoresData = await mapaService.fetchSectores();
      setSectores(sectoresData);
      if (sectoresData.length === 0) {
        Alert.alert("Mapa Vacío", "No se encontraron sectores. Ve a 'Gestionar Sectores' en el menú para añadirlos.");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar los sectores desde Firestore al iniciar
  useEffect(() => {
    cargarSectores();
  }, []);

  // Función que se dispara al tocar un sector
  const onSectorPress = (sector) => {
    if (isEditing) return; 
    
    setSectorSeleccionado(sector); 
    
    Alert.alert(
      `Sector: ${sector.nombre}`,
      "¿Qué deseas hacer?",
      [
        { text: "Ver Empleados", onPress: () => setModalEmpleadosVisible(true) },
        { text: "Designar Tarea", onPress: () => setModalTareaVisible(true) },
        { text: "Modificar Sector", onPress: () => setIsEditing(sector.id) }, 
        { text: "Cancelar", style: "cancel", onPress: () => setSectorSeleccionado(null) }
      ]
    );
  };

  // Función para guardar el polígono editado
  const onEditEnd = async (e, sector) => {
    Alert.alert(
      "Guardar Cambios",
      "¿Deseas guardar la nueva forma para este sector?",
      [
        { text: "Cancelar", style: "cancel", onPress: () => setIsEditing(null) },
        { text: "Guardar", onPress: async () => {
          try {
            // Llama al servicio para actualizar
            await mapaService.updateSectorCoordenadas(sector.id, e.nativeEvent.coordinates);
            
            // Actualizar estado local
            setSectores(prevSectores => prevSectores.map(s => 
              s.id === sector.id ? { ...s, coordsMapa: e.nativeEvent.coordinates } : s
            ));
            Alert.alert("Éxito", "Sector actualizado.");
          } catch (error) {
            Alert.alert("Error", error.message);
          } finally {
            setIsEditing(null); 
          }
        }}
      ]
    );
  };

  // Dibuja los polígonos
  const renderSectores = () => {
    return sectores.map((sector) => (
      <Polygon
        key={sector.id}
        coordinates={sector.coordsMapa} 
        fillColor={isEditing === sector.id ? "rgba(255, 255, 0, 0.5)" : (sector.color || "#FF0000") + "80"}
        strokeColor="#FFFFFF"
        strokeWidth={2}
        tappable={true}
        onPress={() => onSectorPress(sector)}
        editable={isEditing === sector.id}
        onDragEnd={(e) => onEditEnd(e, sector)} 
      />
    ));
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Botón para volver */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={20} color="#1F2937" />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      
      {/* Botón para Tareas Actuales */}
      <TouchableOpacity 
          style={[styles.backButton, {top: 110, left: 16, backgroundColor: '#2563EB'}]} 
          onPress={() => setModalTareasActualesVisible(true)}
        >
          <ClipboardList size={20} color="#FFFFFF" />
          <Text style={[styles.backButtonText, {color: '#FFFFFF'}]}>Tareas Actuales</Text>
      </TouchableOpacity>
      
      {/* Botón para salir del modo Edición */}
      {isEditing && (
        <TouchableOpacity 
          style={[styles.backButton, {top: 170, left: 16, backgroundColor: '#EF4444'}]} 
          onPress={() => setIsEditing(null)}
        >
          <X size={20} color="#FFFFFF" />
          <Text style={[styles.backButtonText, {color: '#FFFFFF'}]}>Cancelar Edición</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#10B981" />
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType="satellite"
          initialRegion={regionInicialFinca}
        >
          {renderSectores()}
        </MapView>
      )}

      {/* Renderizar los Modales */}
      {sectorSeleccionado && (
        <>
          <EmpleadosModal
            visible={modalEmpleadosVisible}
            sector={sectorSeleccionado}
            onClose={() => {
              setModalEmpleadosVisible(false);
              setSectorSeleccionado(null); 
            }}
          />
          <TareaModal
            visible={modalTareaVisible}
            sector={sectorSeleccionado}
            onClose={() => {
              setModalTareaVisible(false);
              setSectorSeleccionado(null); 
            }}
          />
        </>
      )}
      
      <TareasActualesModal
        visible={modalTareasActualesVisible}
        onClose={() => setModalTareasActualesVisible(false)}
        sectores={sectores}
      />

    </SafeAreaView>
  );
}