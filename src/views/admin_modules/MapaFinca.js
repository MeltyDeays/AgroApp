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
  FlatList 
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker, Callout } from 'react-native-maps';
import { ArrowLeft, User, Edit2, Check, X, Users, ClipboardList } from 'lucide-react-native'; // <-- Eliminado RefreshCw
import styles from '../../styles/mapaStyles'; 
import { useUsers } from '../../context/UserContext';
import * as mapaService from '../../services/mapaService'; 


// Coordenadas iniciales de la finca
const regionInicialFinca = {
  latitude: 12.1675,
  longitude: -85.3688,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};


// --- Modal para ver Empleados ---
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
          <TouchableOpacity style={styles.modalButtonClose} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Modal para crear Tareas ---
const TareaModal = ({ visible, sector, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [detalles, setDetalles] = useState('');

  const handleCrearTarea = async () => {
    if (!titulo || !detalles) {
      Alert.alert("Error", "Debe ingresar un título y los detalles de la tarea.");
      return;
    }
    if (!sector || !sector.id) {
        Alert.alert("Error", "No se ha seleccionado un sector válido.");
        return;
    }
    setLoading(true);
    try {
      await mapaService.crearTarea(titulo, detalles, sector.id);
      Alert.alert("Éxito", "Tarea creada. Se notificará a los empleados.");
      setTitulo('');
      setDetalles('');
      onClose();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

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
    </Modal>
  );
};


export default function MapaFinca({ navigation }) {
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); 
  
  const [modalEmpleadosVisible, setModalEmpleadosVisible] = useState(false);
  const [modalTareaVisible, setModalTareaVisible] = useState(false);
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
        coordinates={sector.coordsMapa} // <-- AHORA LEE LA ESTRUCTURA SIMPLE
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
      
      {/* Botón para salir del modo Edición */}
      {isEditing && (
        <TouchableOpacity 
          style={[styles.backButton, {top: 110, left: 16, backgroundColor: '#EF4444'}]} 
          onPress={() => setIsEditing(null)}
        >
          <X size={20} color="#FFFFFF" />
          <Text style={[styles.backButtonText, {color: '#FFFFFF'}]}>Cancelar Edición</Text>
        </TouchableOpacity>
      )}

      {/* --- (BOTÓN DE SEED ELIMINADO) --- */}

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
              setSectorSeleccionado(null); // Limpia el sector al cerrar
            }}
          />
          <TareaModal
            visible={modalTareaVisible}
            sector={sectorSeleccionado}
            onClose={() => {
              setModalTareaVisible(false);
              setSectorSeleccionado(null); // Limpia el sector al cerrar
            }}
          />
        </>
      )}

    </SafeAreaView>
  );
}