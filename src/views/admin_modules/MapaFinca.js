import React, { 
  useState, 
  useEffect, 
  useRef, 
  useReducer, 
  useCallback 
} from 'react';
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
  Platform,
  ScrollView 
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker, Callout } from 'react-native-maps'; 
import { ArrowLeft, Edit, Check, X, Users, ClipboardList, Calendar, ChevronDown } from 'lucide-react-native'; 
import styles from '../../styles/mapaStyles'; 
import { useUsers } from '../../context/UserContext';
import * as mapaService from '../../services/mapaService'; 
import * as almacenService from '../../services/almacenService';
import { Picker } from '@react-native-picker/picker'; 
import almacenStyles from '../../styles/almacenStyles'; 
import DateTimePicker from "@react-native-community/datetimepicker";

import { CompletarTareaModal } from './GestionSectores';


const regionInicialFinca = {
  latitude: 12.1675,
  longitude: -85.3688,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};


const SectorActionModal = ({ 
  visible, 
  sector, 
  onClose, 
  onVerEmpleados, 
  onDesignarTarea, 
  onModificarSector 
}) => {
  if (!sector) return null;
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sector: {sector.nombre}</Text>
          <Text style={styles.modalSubtitle}>¿Qué deseas hacer?</Text>
          <TouchableOpacity style={styles.modalActionButton} onPress={onVerEmpleados}>
            <Users size={20} color="#1D4ED8" />
            <Text style={styles.modalActionButtonText}>Ver Empleados Asignados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalActionButton} onPress={onDesignarTarea}>
            <ClipboardList size={20} color="#059669" />
            <Text style={styles.modalActionButtonText}>Designar Nueva Tarea</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalActionButton} onPress={onModificarSector}>
            <Edit size={20} color="#D97706" />
            <Text style={styles.modalActionButtonText}>Modificar Forma</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalButtonClose, {marginTop: 24}]} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


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


const TareaModal = ({ visible, sector, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [detalles, setDetalles] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('inicio');
  
  const handleConfirmDate = (date) => {
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

  const initialDate = datePickerMode === 'inicio' && fechaInicio ? new Date(fechaInicio) : 
                      datePickerMode === 'fin' && fechaFin ? new Date(fechaFin) : 
                      new Date();


  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ClipboardList size={24} color="#1F2937" style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.modalTitle}>Nueva Tarea en {sector?.nombre || 'Sector'}</Text>
          
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Título de la Tarea</Text>
            <TextInput style={styles.input} placeholder="Ej: Plantación de trigo" value={titulo} onChangeText={setTitulo} />
            
            <Text style={styles.label}>Detalles</Text>
            <TextInput style={[styles.input, { height: 100 }]} placeholder="Ej: Plantar 50 hectáreas en la zona norte..." value={detalles} onChangeText={setDetalles} multiline />
            
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
          </ScrollView>
          
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
              setDatePickerVisible(false); 
            }
          }}
        />
      )}
    </Modal>
  );
};


const TareasActualesModal = ({ visible, onClose, sectores }) => {
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState([]);
  
  
  const [almacenes, setAlmacenes] = useState([]);
  const [completarModalVisible, setCompletarModalVisible] = useState(false);
  const [tareaParaCompletar, setTareaParaCompletar] = useState(null);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const tareasData = await mapaService.fetchTareas();
      setTareas(tareasData);
    } catch (err) {
      Alert.alert("Error de Acceso", "No se pudieron cargar las tareas.");
      setTareas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      cargarTareas();
      
      const unsubAlmacenes = almacenService.streamAlmacenes((data) => {
        setAlmacenes(data);
      });
      return () => unsubAlmacenes(); 
    }
  }, [visible]);

  
  const handleMarcarCompletada = (tarea) => {
    if (almacenes.length === 0) {
        Alert.alert("Error", "No se han cargado almacenes. No se puede registrar la cosecha.");
        return;
    }
    setTareaParaCompletar(tarea);
    setCompletarModalVisible(true);
  };

  
  const handleSaveCosecha = async (tarea, cantidad, unidad, almacenId) => {
      try {
        await mapaService.marcarTareaCompletada(tarea, cantidad, unidad, almacenId);
        Alert.alert("Éxito", "Tarea completada y cosecha registrada en el almacén.");
        cargarTareas(); 
      } catch (error) {
        throw error; 
      }
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
        {/* Mostrar cosecha si está completada */}
        {isCompleted && (
          <Text style={[styles.taskDetail, {color: '#059669', fontWeight: 'bold'}]}>
            Cosecha: {item.cantidadCultivadaKg ? `${item.cantidadCultivadaKg.toFixed(0)} kg` : 'N/A'}
          </Text>
        )}
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
    <>
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

      {/* Renderizar el modal importado */}
      <CompletarTareaModal
        visible={completarModalVisible}
        onClose={() => setCompletarModalVisible(false)}
        tarea={tareaParaCompletar}
        almacenes={almacenes}
        onSave={handleSaveCosecha}
      />
    </>
  );
};


const editorInitialState = {
  status: 'idle', 
  editingSectorId: null, 
  draftCoordinates: [], 
};

function mapEditorReducer(state, action) {
  switch (action.type) {
    case 'START_EDITING':
      return {
        status: 'editing_vertices',
        editingSectorId: action.payload.sectorId,
        draftCoordinates: action.payload.initialCoordinates,
      };
      
    case 'UPDATE_VERTEX':
      const { index, coordinate } = action.payload;
      const newDraftCoords = state.draftCoordinates.map((coord, i) =>
        i === index ? coordinate : coord
      );
      return { ...state, draftCoordinates: newDraftCoords };
      
    case 'CANCEL_EDITING':
    case 'FINISH_EDITING':
      return { ...editorInitialState };
      
    default:
      return state;
  }
}


export default function MapaFinca({ navigation }) {
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorState, dispatch] = useReducer(mapEditorReducer, editorInitialState);
  const [isGestureLocked, setIsGestureLocked] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
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

  useEffect(() => {
    cargarSectores();
  }, []);

  const onSectorPress = (sector) => {
    if (editorState.status !== 'idle') return;
    setSectorSeleccionado(sector); 
    setActionModalVisible(true); 
  };

  const handleSave = () => {
    if (editorState.status !== 'editing_vertices' || !editorState.editingSectorId) return;

    Alert.alert(
      "Guardar Cambios",
      "¿Deseas guardar la nueva forma para este sector?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Guardar", onPress: async () => {
          try {
            await mapaService.updateSectorCoordenadas(
              editorState.editingSectorId, 
              editorState.draftCoordinates
            );
            
            setSectores(prevSectores => prevSectores.map(s => 
              s.id === editorState.editingSectorId 
                ? { ...s, coordsMapa: editorState.draftCoordinates } 
                : s
            ));
            
            Alert.alert("Éxito", "Sector actualizado.");
          } catch (error) {
            Alert.alert("Error", error.message);
          } finally {
            dispatch({ type: 'FINISH_EDITING' });
            setSectorSeleccionado(null); 
          }
        }}
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancelar Edición",
      "¿Está seguro de que desea descartar los cambios?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí, descartar", 
          style: "destructive",
          onPress: () => {
            dispatch({ type: 'CANCEL_EDITING' });
            setSectorSeleccionado(null); 
          }
        }
      ]
    );
  };

  const handleVertexDragEnd = useCallback((e, index) => {
    const newCoordinate = e.nativeEvent.coordinate;
    dispatch({ type: 'UPDATE_VERTEX', payload: { index, coordinate: newCoordinate } });
    setIsGestureLocked(false); 
  }, []); 

  const handleDragStart = useCallback(() => {
    setIsGestureLocked(true); 
  }, []);

  
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={20} color="#1F2937" />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.backButton, {top: 110, left: 16, backgroundColor: '#2563EB'}]} 
        onPress={() => setModalTareasActualesVisible(true)}
      >
        <ClipboardList size={20} color="#FFFFFF" />
        <Text style={[styles.backButtonText, {color: '#FFFFFF'}]}>Tareas Actuales</Text>
      </TouchableOpacity>
      
      {editorState.status === 'editing_vertices' && (
        <>
          <TouchableOpacity 
            style={[styles.backButton, {top: 170, left: 16, backgroundColor: '#EF4444'}]} 
            onPress={handleCancel} 
          >
            <X size={20} color="#FFFFFF" />
            <Text style={[styles.backButtonText, {color: '#FFFFFF'}]}>Cancelar Edición</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.backButton, {top: 230, left: 16, backgroundColor: '#4CAF50'}]} 
            onPress={handleSave} 
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={[styles.backButtonText, {color: '#FFFFFF'}]}>Guardar Cambios</Text>
          </TouchableOpacity>
        </>
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
          scrollEnabled={!isGestureLocked}
          zoomEnabled={!isGestureLocked}
          rotateEnabled={!isGestureLocked}
          pitchEnabled={!isGestureLocked}
        >
          {sectores.map((sector) => {
            const isBeingEdited = editorState.status === 'editing_vertices' && 
                                  editorState.editingSectorId === sector.id;
            
            const displayCoordinates = isBeingEdited 
              ? editorState.draftCoordinates 
              : sector.coordsMapa;

            return (
              <Polygon
                key={sector.id}
                coordinates={displayCoordinates}
                fillColor={isBeingEdited 
                  ? "rgba(255, 200, 0, 0.5)" 
                  : (sector.color || "#FF0000") + "80"
                }
                strokeColor={isBeingEdited ? "#FFA500" : "#FFFFFF"}
                strokeWidth={2}
                tappable={editorState.status === 'idle'}
                onPress={editorState.status === 'idle' 
                  ? () => onSectorPress(sector) 
                  : undefined
                }
              />
            );
          })}

          {editorState.status === 'editing_vertices' && 
            editorState.draftCoordinates.map((coord, index) => (
              <Marker
                key={`vertex-${index}`}
                coordinate={coord}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={(e) => handleVertexDragEnd(e, index)}
                pinColor="#FFA500" 
              />
            ))}
            
        </MapView>
      )}

      <SectorActionModal
        visible={actionModalVisible}
        sector={sectorSeleccionado}
        onClose={() => {
          setActionModalVisible(false);
          setSectorSeleccionado(null);
        }}
        onVerEmpleados={() => {
          setActionModalVisible(false);
          setModalEmpleadosVisible(true); 
        }}
        onDesignarTarea={() => {
          setActionModalVisible(false);
          setModalTareaVisible(true);
        }}
        onModificarSector={() => {
          setActionModalVisible(false);
          dispatch({ 
            type: 'START_EDITING', 
            payload: { 
              sectorId: sectorSeleccionado.id,
              initialCoordinates: sectorSeleccionado.coordsMapa 
            } 
          });
        }}
      />
      
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