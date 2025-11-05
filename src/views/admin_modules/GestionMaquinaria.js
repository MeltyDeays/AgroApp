import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet as RNStyleSheet,
  LayoutAnimation, 
  UIManager,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { RadioButton } from 'react-native-paper';
import { Tractor, Plus, Edit, Trash2, ChevronLeft, MoreVertical, Wrench, ArrowDownAZ, ArrowUpZA } from 'lucide-react-native'; // <-- Iconos de Sort
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // <-- Importar Picker
// --- Estilos ---
import styles from '../../styles/maquinariaAdminStyles';
import formStyles from '../../styles/adminStyles';
// --- Servicios ---
import * as MaquinariaService from '../../services/maquinariaService';
// --- Constantes ---
import { 
  TIPOS_MAQUINARIA, 
  FILTRO_TIPOS_MAQUINARIA, 
  FILTRO_ESTADOS_MAQUINARIA 
} from '../../constants/maquinariaConstants'; // <-- Importar Constantes

// --- Formulario (Modificado para usar Picker) ---
const MachineForm = React.memo(({ onBackToList, initialData = null, onLocalUpdate }) => {
  const isEditing = useMemo(() => !!initialData, [initialData]);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'tractor', // Valor inicial
    imageUrl: initialData?.imageUrl || '',
  });
 
  const [loading, setLoading] = useState(false);
  const nameRef = useRef(null);
  const typeRef = useRef(null);
  const urlRef = useRef(null);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.type) {
      Alert.alert('Error', 'Nombre y Tipo son campos obligatorios.');
      return;
    }
    setLoading(true);
    let dataToSubmit = {
      name: formData.name,
      type: formData.type,
      imageUrl: formData.imageUrl || null, 
    };
    try {
      let newMachineId;
      if (isEditing) {
        await MaquinariaService.updateMachine(initialData.id, dataToSubmit);
        newMachineId = initialData.id;
        Alert.alert("Éxito", 'Máquina actualizada.');
      } else {
        const result = await MaquinariaService.createMachine(dataToSubmit);
        newMachineId = result?.id || `temp-${Date.now()}`;
        Alert.alert("Éxito", 'Máquina registrada.');
      }
      setLoading(false);
      if (onLocalUpdate) {
        onLocalUpdate(dataToSubmit, newMachineId, isEditing ? initialData.id : null);
      }
      onBackToList(true);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", `No se pudo guardar: ${error.message}`);
    }
  }, [formData, isEditing, initialData, onBackToList, handleChange, onLocalUpdate]);

  const imageSource = formData.imageUrl ? { uri: formData.imageUrl } : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <FlatList
        data={[{ key: 'form' }]}
        renderItem={() => (
          <View style={formStyles.formContainer}>
            <TouchableOpacity style={formStyles.backButton} onPress={() => onBackToList(false)}>
              <ChevronLeft size={20} color="#2563eb" />
              <Text style={formStyles.backButtonText}>Volver a la lista</Text>
            </TouchableOpacity>
            <View style={formStyles.formHeader}>
              <Tractor size={24} color="#1F2937" />
              <Text style={formStyles.formTitle}>{isEditing ? "Editar Máquina" : "Registrar Nueva Máquina"}</Text>
            </View>
            {imageSource ? (
              <Image source={imageSource} style={styles.imagePreview} resizeMode="cover" />
            ) : (
              <View style={styles.imagePreviewPlaceholder}>
                <Tractor size={32} color="#9CA3AF" />
              </View>
            )}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>URL de la Imagen (Opcional)</Text>
              <TextInput 
                ref={urlRef}
                style={formStyles.input} 
                placeholder="https://ejemplo.com/imagen.png"
                onChangeText={(v) => handleChange('imageUrl', v)} 
                value={formData.imageUrl}
                autoCapitalize="none"
                keyboardType="url"
                returnKeyType="next" 
                onSubmitEditing={() => nameRef.current?.focus()} 
                blurOnSubmit={false} 
              />
            </View>
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Nombre de la Máquina</Text>
              <TextInput 
                ref={nameRef}
                style={formStyles.input} 
                onChangeText={(v) => handleChange('name', v)} 
                value={formData.name}
                returnKeyType="next" 
                onSubmitEditing={() => typeRef.current?.focus()} 
                blurOnSubmit={false} 
              />
            </View>
            {/* --- REEMPLAZADO POR PICKER --- */}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Tipo de Máquina</Text>
              <View style={styles.pickerContainer}> 
                <Picker
                  ref={typeRef}
                  selectedValue={formData.type}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleChange('type', itemValue)}
                >
                  {TIPOS_MAQUINARIA.map((tipo) => (
                    <Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} />
                  ))}
                </Picker>
              </View>
            </View>
            <TouchableOpacity style={formStyles.registerButton} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : 
               <Text style={formStyles.registerButtonText}>
                 {isEditing ? "Guardar Cambios" : "Registrar Máquina"}
               </Text>}
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={() => 'form-key'}
        contentContainerStyle={{ paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
});

// --- Pestaña Maquinaria (MODIFICADA para recibir filtros) ---
const MachineryTab = React.memo(({ 
  machines, // Esta ahora es la lista YA FILTRADA
  onUpdatePress, 
  onGoToAddForm, 
  onEdit, 
  onDelete, 
  onMaintPress, 
  expandedId, 
  setExpandedId,
  // --- NUEVOS PROPS DE FILTROS ---
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  sortOrder,
  setSortOrder,
}) => {
  
  // --- Render Item (Sin cambios) ---
  const renderItem = useCallback(({ item: machine }) => {
    // ... (Tu código de renderItem no cambia)
    const isExpanded = expandedId === machine.id;
    const imageSource = machine.imageUrl ? { uri: machine.imageUrl } : null;
    return (
      <View key={machine.id} style={styles.card}>
        {imageSource ? (
          <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Tractor size={28} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{machine.name}</Text>
            <View style={[
              styles.badge,
              machine.status === 'available' ? styles.badgeAvailable :
              machine.status === 'in-use' ? styles.badgeInUse :
              machine.status === 'maintenance' ? styles.badgeMaintenance :
              styles.badgeBroken,
              { alignSelf: 'flex-start', marginTop: 8 } 
            ]}>
              <Text style={styles.badgeText}>
                {machine.status === 'available' ? 'Disponible' :
                 machine.status === 'in-use' ? 'En Uso' :
                 machine.status === 'maintenance' ? 'Mantenimiento' :
                 'Averiada'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.ellipsisButton}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setExpandedId(isExpanded ? null : machine.id);
            }}
          >
            <MoreVertical size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {isExpanded && (
          <View style={styles.expandedDetailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID:</Text>
              <Text style={styles.detailValue}>{machine.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo:</Text>
              <Text style={styles.detailValue}>{machine.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Últ. Mant.:</Text>
              <Text style={styles.detailValue}>{machine.lastMaintenance || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Próx. Mant.:</Text>
              <Text style={styles.detailValue}>{machine.nextMaintenance || 'N/A'}</Text>
            </View>
            <View style={[styles.cardActionRow, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#E5E7EB' }]}>
              <TouchableOpacity
                style={[styles.cardButton, styles.deleteButton]}
                onPress={() => onDelete(machine)}
              >
                <Trash2 size={16} color="#B91C1C" />
                <Text style={[styles.cardButtonText, styles.deleteButtonText]}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardButton, styles.editButton]}
                onPress={() => onEdit(machine)}
              >
                <Edit size={16} color="#1D4ED8" />
                <Text style={[styles.cardButtonText, styles.editButtonText]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardButton, styles.maintButton]}
                onPress={() => onMaintPress(machine)}
              >
                <Wrench size={16} color="#A16207" />
                <Text style={[styles.cardButtonText, styles.maintButtonText]}>Mantenim.</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonUpdate, { marginLeft: 8 }]}
                onPress={() => onUpdatePress(machine)}
              >
                <Text style={styles.buttonUpdateText}>Estado</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }, [expandedId, setExpandedId, onDelete, onEdit, onMaintPress, onUpdatePress]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  // --- NUEVO: Encabezado de lista con filtros ---
  const ListHeader = useCallback(() => (
    <View>
      {/* Título y Botón Agregar */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Flota de Máquinas</Text>
        <TouchableOpacity style={styles.addButton} onPress={onGoToAddForm}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenedor de Filtros */}
      <View style={styles.filterContainer}>
        {/* Barra de Búsqueda */}
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        {/* Picker de Tipo */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedType}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedType(itemValue)}
          >
            {FILTRO_TIPOS_MAQUINARIA.map(tipo => (
              <Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} />
            ))}
          </Picker>
        </View>

        {/* Picker de Estado */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedStatus}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedStatus(itemValue)}
          >
            {FILTRO_ESTADOS_MAQUINARIA.map(estado => (
              <Picker.Item key={estado.value} label={estado.label} value={estado.value} />
            ))}
          </Picker>
        </View>

        {/* Botones de Ordenar */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortButton, sortOrder === 'asc' && styles.sortButtonActive]}
            onPress={() => setSortOrder('asc')}
          >
            <ArrowDownAZ size={18} color={sortOrder === 'asc' ? '#2563EB' : '#6B7280'} />
            <Text style={styles.sortButtonText}>A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortOrder === 'desc' && styles.sortButtonActive]}
            onPress={() => setSortOrder('desc')}
          >
            <ArrowUpZA size={18} color={sortOrder === 'desc' ? '#2563EB' : '#6B7280'} />
            <Text style={styles.sortButtonText}>Z-A</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [
    onGoToAddForm,
    searchQuery, setSearchQuery,
    selectedType, setSelectedType,
    selectedStatus, setSelectedStatus,
    sortOrder, setSortOrder
  ]); // <-- Dependencias del header

  return (
    <FlatList
      data={machines}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader} // <-- Usar el nuevo header con filtros
      style={styles.scrollContainer}
      contentContainerStyle={{ paddingBottom: 60 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No se encontraron máquinas con esos filtros.</Text>
      }
    />
  );
});

// --- Pestaña Reservas (Sin cambios) ---
const ReservationsTab = React.memo(({ machines, requests, onApprove, onReject }) => {
  // ... (Tu código no cambia)
  const renderItem = useCallback(({ item: request }) => {
    const machine = machines.find(m => m.id === request.machineId);
    const imageSource = machine?.imageUrl ? { uri: machine.imageUrl } : null;
    return (
      <View key={request.id} style={styles.card}>
        {imageSource ? (
          <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Tractor size={28} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{request.machineName}</Text>
          <View style={[styles.badge, styles.badgePending]}><Text style={styles.badgeText}>Pendiente</Text></View>
        </View>
        <View style={{paddingHorizontal: 12}}>
          <Text style={styles.detailLabel}>Solicita: <Text style={styles.detailValue}>{request.requestedBy}</Text></Text>
          <Text style={styles.detailLabel}>Sector: <Text style={styles.detailValue}>{request.sector}</Text></Text>
          <Text style={styles.detailLabel}>Período: <Text style={styles.detailValue}>{request.startDate} al {request.endDate}</Text></Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonReject]}
            onPress={() => onReject(request.id)}
          >
            <Text style={styles.buttonRejectText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonApprove]}
            onPress={() => onApprove(request.id, request.machineId, request.requestedBy)}
          >
            <Text style={styles.buttonApproveText}>Aprobar</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }, [onApprove, onReject, machines]);
  const keyExtractor = useCallback((item) => item.id.toString(), []);
  if (requests.length === 0) {
    return (
      <View style={styles.scrollContainer}>
        <Text style={styles.emptyText}>No hay solicitudes de reserva pendientes.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={requests}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.scrollContainer}
      contentContainerStyle={{ paddingBottom: 60 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      showsVerticalScrollIndicator={false}
    />
  );
});

// --- Pestaña Mantenimiento (Sin cambios) ---
const MaintenanceTab = React.memo(({ machines, requests, onUpdate }) => {
  // ... (Tu código no cambia)
  const renderItem = useCallback(({ item: request }) => {
    const machine = machines.find(m => m.id === request.machineId);
    const imageSource = machine?.imageUrl ? { uri: machine.imageUrl } : null;
    return (
      <View key={request.id} style={styles.card}>
        {imageSource ? (
          <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Tractor size={28} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{request.machineName}</Text>
          <View style={[
            styles.badge,
            request.priority === 'high' ? styles.badgeHigh :
            request.priority === 'medium' ? styles.badgeMedium :
            styles.badgeLow
          ]}>
            <Text style={styles.badgeText}>Prioridad: {request.priority}</Text>
          </View>
        </View>
        <View style={{paddingHorizontal: 12}}>
          <Text style={styles.detailLabel}>Descripción: <Text style={styles.detailValue}>{request.description}</Text></Text>
          <Text style={styles.detailLabel}>Estado Actual: <Text style={styles.detailValue}>{request.status}</Text></Text>
        </View>
        <View style={styles.actionRow}>
          {request.status === 'pending' ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonStart]}
              onPress={() => onUpdate(request.id, 'in-progress', request.machineId)}
            >
              <Text style={styles.buttonStartText}>Iniciar Tarea</Text>
            </TouchableOpacity>
          ) : null}
          {request.status === 'in-progress' ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonApprove]}
              onPress={() => onUpdate(request.id, 'completed', request.machineId)}
            >
              <Text style={styles.buttonApproveText}>Marcar como Completado</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    )
  }, [onUpdate, machines]);
  const keyExtractor = useCallback((item) => item.id.toString(), []);
  if (requests.length === 0) {
    return (
      <View style={styles.scrollContainer}>
        <Text style={styles.emptyText}>No hay solicitudes de mantenimiento activas.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={requests}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.scrollContainer}
      contentContainerStyle={{ paddingBottom: 60 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      showsVerticalScrollIndicator={false}
    />
  );
});

// --- Componente Principal (MODIFICADO) ---
export default function GestionMaquinaria() {
  const [viewMode, setViewMode] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0); 
  const [editingMachine, setEditingMachine] = useState(null);
  const [expandedMachineId, setExpandedMachineId] = useState(null);
  const [index, setIndex] = useState(0);
  const routes = useMemo(() => [
    { key: 'machinery', title: 'Maquinaria' },
    { key: 'reservations', title: 'Reservas' },
    { key: 'maintenance', title: 'Mantenimiento' },
  ], []);
  const [loading, setLoading] = useState(true);
  
  // --- Estados de Datos Puros ---
  const [machines, setMachines] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  // --- NUEVOS ESTADOS DE FILTRO ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // --- Modales ---
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintFormData, setMaintFormData] = useState({ lastMaintenance: '', nextMaintenance: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());

  // --- useEffect para datos (Sin cambios) ---
  useEffect(() => {
    // ... (Tu código de useEffect no cambia)
    setLoading(true);
    let mounted = true;
    let tempMachines = [];
    let tempReservations = [];
    let tempMaintenance = [];
    let loadCount = 0;
    const checkAllDataLoaded = () => {
      loadCount++;
      if (mounted && loadCount === 3) {
        setMachines(tempMachines);
        setReservationRequests(tempReservations);
        setMaintenanceRequests(tempMaintenance);
        setLoading(false);
      }
    };
    const unsubMachines = MaquinariaService.streamMaquinas((data) => {
      tempMachines = data;
      checkAllDataLoaded();
    });
    const unsubReservas = MaquinariaService.streamReservasPendientes((data) => {
      tempReservations = data;
      checkAllDataLoaded();
    });
    const unsubManten = MaquinariaService.streamMantenimientosPendientes((data) => {
      tempMaintenance = data;
      checkAllDataLoaded();
    });
    const timer = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 3000);
    return () => {
      mounted = false;
      unsubMachines();
      unsubReservas();
      unsubManten();
      clearTimeout(timer);
    };
  }, [refreshKey]);

  // --- NUEVO: Lógica de Filtro y Ordenamiento ---
  const filteredMachines = useMemo(() => {
    let machinesToShow = [...machines];

    // 1. Filtrar por Búsqueda
    if (searchQuery) {
      machinesToShow = machinesToShow.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Filtrar por Tipo
    if (selectedType !== 'todos') {
      machinesToShow = machinesToShow.filter(m => m.type === selectedType);
    }

    // 3. Filtrar por Estado
    if (selectedStatus !== 'todos') {
      machinesToShow = machinesToShow.filter(m => m.status === selectedStatus);
    }

    // 4. Ordenar
    if (sortOrder === 'asc') {
      machinesToShow.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      machinesToShow.sort((a, b) => b.name.localeCompare(a.name));
    }

    return machinesToShow;
  }, [machines, searchQuery, selectedType, selectedStatus, sortOrder]);


  // --- Handlers (Sin cambios) ---
  const handleLocalUpdate = useCallback((dataToSubmit, newId, editId) => {
    // ... (Tu código no cambia)
    if (editId) {
      setMachines(prev => prev.map(m => m.id === editId ? { ...m, ...dataToSubmit } : m));
    } else {
      setMachines(prev => [...prev, { ...dataToSubmit, id: newId }]);
    }
  }, []);

  const handleUpdateMachineStatus = useCallback(async () => {
    // ... (Tu código no cambia)
    if (!selectedMachine || !newStatus) return;
    const oldStatus = selectedMachine.status;
    try {
      await MaquinariaService.actualizarEstadoMaquina(selectedMachine.id, newStatus);
      setMachines(currentMachines => 
        currentMachines.map(machine => 
          machine.id === selectedMachine.id
            ? { ...machine, status: newStatus } 
            : machine 
        )
      );
      if (newStatus === 'maintenance' && oldStatus !== 'maintenance') {
        const maintData = {
          machineId: selectedMachine.id,
          machineName: selectedMachine.name,
          requestedBy: 'Administrador',
          requestedById: 'admin_system',
          description: 'Establecido en mantenimiento por el administrador.',
          priority: 'medium',
        };
        const newMaintRequest = await MaquinariaService.crearSolicitudMantenimiento(maintData);
        await MaquinariaService.actualizarEstadoMantenimiento(newMaintRequest.id, 'in-progress', null);
        setMaintenanceRequests(currentRequests => [
          ...currentRequests,
          { ...maintData, id: newMaintRequest.id, status: 'in-progress', priority: 'medium' }
        ]);
      }
      Alert.alert('Éxito', 'Estado de la máquina actualizado.');
      closeUpdateDialog();
    } catch (e) { Alert.alert('Error', 'No se pudo actualizar el estado.'); }
  }, [selectedMachine, newStatus]); // <-- closeUpdateDialog eliminado, estaba duplicado

  const handleApproveReservation = useCallback(async (reservaId, machineId, employeeName) => {
    // ... (Tu código no cambia)
    try {
      await MaquinariaService.aprobarReserva(reservaId, machineId, employeeName);
      setReservationRequests(currentRequests => 
        currentRequests.filter(req => req.id !== reservaId)
      );
      setMachines(currentMachines => 
        currentMachines.map(m => 
          m.id === machineId 
            ? { ...m, status: 'in-use', assignedTo: employeeName }
            : m
        )
      );
      Alert.alert('Éxito', 'Reserva aprobada.');
    } catch (e) { Alert.alert('Error', 'No se pudo aprobar la reserva.'); }
  }, []);

  const handleRejectReservation = useCallback(async (reservaId) => {
    // ... (Tu código no cambia)
    try {
      await MaquinariaService.rechazarReserva(reservaId);
      setReservationRequests(currentRequests => 
        currentRequests.filter(req => req.id !== reservaId)
      );
      Alert.alert('Éxito', 'Reserva rechazada.');
    } catch (e) { Alert.alert('Error', 'No se pudo rechazar la reserva.'); }
  }, []);

  const handleUpdateMaintenance = useCallback(async (mantenimientoId, status, machineId) => {
    // ... (Tu código no cambia)
    try {
      await MaquinariaService.actualizarEstadoMantenimiento(mantenimientoId, status, machineId);
      if (status === 'completed') {
        setMaintenanceRequests(currentRequests => 
          currentRequests.filter(req => req.id !== mantenimientoId)
        );
        if (machineId) {
          setMachines(currentMachines => 
            currentMachines.map(m => 
              m.id === machineId ? { ...m, status: 'available' } : m
            )
          );
        }
      } else {
        setMaintenanceRequests(currentRequests =>
          currentRequests.map(req => 
            req.id === mantenimientoId ? { ...req, status: status } : req
          )
        );
      }
      Alert.alert('Éxito', 'Estado de mantenimiento actualizado.');
    } catch (e) { Alert.alert('Error', 'No se pudo actualizar el mantenimiento.'); }
  }, []);

  const handleEdit = useCallback((machine) => {
    setEditingMachine(machine);
    setViewMode('edit');
  }, []);

  const handleDelete = useCallback((machine) => {
    // ... (Tu código no cambia)
    Alert.alert(
      "Confirmar Eliminación",
      `¿Eliminar "${machine.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await MaquinariaService.deleteMachine(machine.id);
              setMachines(currentMachines => 
                currentMachines.filter(m => m.id !== machine.id)
              );
              Alert.alert("Éxito", "Máquina eliminada.");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la máquina.");
            }
          }
        }
      ]
    );
  }, []);

  const handleBackToList = useCallback((refresh) => {
    setViewMode('list');
    setEditingMachine(null);
    if (refresh) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  }, []);

  const openUpdateDialog = useCallback((machine) => {
    setSelectedMachine(machine);
    setNewStatus(machine.status);
    setIsUpdateDialogOpen(true);
  }, []);

  const closeUpdateDialog = useCallback(() => setIsUpdateDialogOpen(false), []);

  const openMaintModal = useCallback((machine) => {
    setSelectedMachine(machine);
    setMaintFormData({
      lastMaintenance: machine.lastMaintenance || '',
      nextMaintenance: machine.nextMaintenance || '',
    });
    setIsMaintModalOpen(true);
  }, []);

  const closeMaintModal = useCallback(() => {
    setIsMaintModalOpen(false);
    setSelectedMachine(null);
    setMaintFormData({ lastMaintenance: '', nextMaintenance: '' });
  }, []);

  const handleConfirmMaint = useCallback(async () => {
    // ... (Tu código no cambia)
    if (!selectedMachine) return;
    try {
      await MaquinariaService.registrarMantenimiento(selectedMachine.id, maintFormData);
      setMachines(currentMachines => 
        currentMachines.map(m => 
          m.id === selectedMachine.id 
            ? { ...m, ...maintFormData } 
            : m
        )
      );
      Alert.alert('Éxito', 'Mantenimiento registrado.');
      closeMaintModal();
    } catch (e) {
      Alert.alert('Error', 'No se pudo registrar el mantenimiento.');
    }
  }, [selectedMachine, maintFormData, closeMaintModal]);

  const onDateChange = useCallback((event, selectedDate) => {
    // ... (Tu código no cambia)
    setShowDatePicker(Platform.OS === 'ios');
    if (Platform.OS !== 'ios') {
       setShowDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setMaintFormData(s => ({ ...s, [datePickerField]: formattedDate }));
      setTempDate(selectedDate);
    }
  }, [datePickerField]);

  const openDatePicker = useCallback((field) => {
    // ... (Tu código no cambia)
    const currentDateString = maintFormData[field];
    const dateToShow = currentDateString ? new Date(`${currentDateString}T00:00:00`) : new Date();
    setTempDate(dateToShow);
    setDatePickerField(field);
    setShowDatePicker(true);
  }, [maintFormData]);

  // --- renderScene (MODIFICADO) ---
  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'machinery':
        return <MachineryTab
                  machines={filteredMachines} // <-- Usar lista FILTRADA
                  onUpdatePress={openUpdateDialog}
                  onGoToAddForm={() => setViewMode('add')}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMaintPress={openMaintModal}
                  expandedId={expandedMachineId}
                  setExpandedId={setExpandedMachineId}
                  // --- Pasar estados y setters de filtros ---
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                />;
      case 'reservations':
        return <ReservationsTab 
                  machines={machines} // Pasar lista original para buscar imágenes
                  requests={reservationRequests} 
                  onApprove={handleApproveReservation} 
                  onReject={handleRejectReservation} 
                />;
      case 'maintenance':
        return <MaintenanceTab 
                  machines={machines} // Pasar lista original para buscar imágenes
                  requests={maintenanceRequests} 
                  onUpdate={handleUpdateMaintenance} 
                />;
      default:
        return null;
    }
  }, [
    // Dependencias de los filtros
    filteredMachines,
    searchQuery, selectedType, selectedStatus, sortOrder,
    // Dependencias originales
    machines, reservationRequests, maintenanceRequests,
    openUpdateDialog, handleEdit, handleDelete, openMaintModal, expandedMachineId, setExpandedMachineId,
    handleApproveReservation, handleRejectReservation, handleUpdateMaintenance
  ]);

  // --- Renderizado principal (Sin cambios) ---
  if (loading) {
    // ... (Tu código no cambia)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Cargando datos de gestión...</Text>
      </View>
    );
  }
  if (viewMode === 'add') {
    return <MachineForm onBackToList={handleBackToList} onLocalUpdate={handleLocalUpdate} />;
  }
  if (viewMode === 'edit') {
    return <MachineForm onBackToList={handleBackToList} initialData={editingMachine} onLocalUpdate={handleLocalUpdate} />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props =>
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={styles.tabIndicator}
            labelStyle={styles.tabLabel}
            activeColor="#2563EB" 
            inactiveColor="#6B7280" 
          />
        }
      />
      {/* Modales (Sin cambios) */}
      <Modal
        visible={isUpdateDialogOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeUpdateDialog}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Actualizar Estado: {selectedMachine?.name}</Text>
            <RadioButton.Group onValueChange={setNewStatus} value={newStatus}>
              <View style={styles.radioItem}><RadioButton value="available" color="#10B981" /><Text style={styles.radioLabel}>Disponible</Text></View>
              <View style={styles.radioItem}><RadioButton value="in-use" color="#2563EB" /><Text style={styles.radioLabel}>En Uso</Text></View>
              <View style={styles.radioItem}><RadioButton value="maintenance" color="#F59E0B" /><Text style={styles.radioLabel}>Mantenimiento</Text></View>
              <View style={styles.radioItem}><RadioButton value="broken" color="#EF4444" /><Text style={styles.radioLabel}>Averiada</Text></View>
            </RadioButton.Group>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeUpdateDialog}><Text style={styles.modalButtonTextCancel}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleUpdateMachineStatus}><Text style={styles.modalButtonTextConfirm}>Actualizar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isMaintModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMaintModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar Mantenimiento: {selectedMachine?.name}</Text>
            <Text style={formStyles.label}>Último Mantenimiento</Text>
            <TouchableOpacity style={formStyles.input} onPress={() => openDatePicker('lastMaintenance')}>
              <Text style={maintFormData.lastMaintenance ? localStyles.dateText : localStyles.placeholderText}>
                {maintFormData.lastMaintenance || 'Seleccionar fecha...'}
              </Text>
            </TouchableOpacity>
            <Text style={[formStyles.label, {marginTop: 10}]}>Próximo Mantenimiento</Text>
            <TouchableOpacity style={formStyles.input} onPress={() => openDatePicker('nextMaintenance')}>
              <Text style={maintFormData.nextMaintenance ? localStyles.dateText : localStyles.placeholderText}>
                {maintFormData.nextMaintenance || 'Seleccionar fecha...'}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeMaintModal}><Text style={styles.modalButtonTextCancel}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleConfirmMaint}><Text style={styles.modalButtonTextConfirm}>Confirmar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {showDatePicker ? (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      ) : null}
    </SafeAreaView>
  );
}

const localStyles = RNStyleSheet.create({
  dateText: {
    color: '#1F2937',
    fontSize: 16,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  }
});