// src/views/admin_modules/GestionSectores.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; 
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView
} from 'react-native'; 
import { MapPin, ChevronLeft, Plus, Edit, Trash2, Search, Users, ClipboardList, ChevronDown, Check } from 'lucide-react-native';
import { TabView, TabBar } from "react-native-tab-view"; // <-- AÑADIDO
import { crearSector, fetchSectores, updateSectorDetails, deleteSector, fetchTareas, marcarTareaCompletada } from '../../services/mapaService'; // <-- MODIFICADO
import { getAllUsers } from '../../services/usuarioService'; // <-- AÑADIDO
import { useUsers } from "../../context/UserContext";
import { Picker } from '@react-native-picker/picker'; // <-- AÑADIDO
import styles from '../../styles/adminStyles'; 

// --- Formulario para crear/editar Sector ---
const SectorForm = ({ onBackToList, initialData = null }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    nombre: initialData?.nombre || '',
    color: initialData?.color || '#FF0000',
    coordenadas: '', 
  });
  const [loading, setLoading] = useState(false);

  const nombreRef = useRef(null);
  const colorRef = useRef(null);
  const coordsRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { id, nombre, color, coordenadas } = formData;
    
    if (!nombre || !color) {
        Alert.alert("Error", "Nombre y Color son obligatorios.");
        setLoading(false);
        return;
    }
    
    let result;
    try {
        if (isEditing) {
            result = await updateSectorDetails(id, nombre, color); 
        } else {
            if (!id || !coordenadas) {
              Alert.alert("Error", "ID y Coordenadas son obligatorios para crear.");
              setLoading(false);
              return;
            }
            result = await crearSector(id, nombre, color, coordenadas);
        }

        if (result.success) {
            Alert.alert("Éxito", isEditing ? "Sector actualizado." : "Sector registrado.");
            onBackToList(true); 
        }
    } catch (error) {
        Alert.alert("Error", error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => onBackToList(false)}>
        <ChevronLeft size={20} color="#2563eb" />
        <Text style={styles.backButtonText}>Volver a la lista</Text>
      </TouchableOpacity>
      <View style={styles.formHeader}>
        <MapPin size={24} color="#1F2937" />
        <Text style={styles.formTitle}>{isEditing ? "Editar Sector" : "Registrar Nuevo Sector"}</Text>
      </View>
      <Text style={styles.formSubtitle}>{isEditing ? "Modifica nombre y color." : "Define un nuevo polígono para el mapa."}</Text>
      
      {/* ID (Solo editable en creación) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID del Sector (Único)</Text>
        <TextInput 
          style={[styles.input, isEditing && { backgroundColor: '#E5E7EB', color: '#6B7280' }]} 
          value={formData.id} 
          editable={!isEditing} 
          placeholder="Ej: sector_a, lote_5"
          autoCapitalize="none"
          returnKeyType="next" 
          onChangeText={(v) => handleChange('id', v.toLowerCase().replace(/ /g, '_'))} 
          onSubmitEditing={() => nombreRef.current?.focus()} 
          blurOnSubmit={false} 
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre (Visible en el mapa)</Text>
        <TextInput 
          ref={nombreRef}
          style={styles.input} 
          onChangeText={(v) => handleChange('nombre', v)} 
          value={formData.nombre} 
          placeholder="Ej: Sector A - Lote Norte"
          returnKeyType="next" 
          onSubmitEditing={() => colorRef.current?.focus()} 
          blurOnSubmit={false} 
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Color (Hexadecimal)</Text>
        <TextInput 
          ref={colorRef}
          style={styles.input} 
          onChangeText={(v) => handleChange('color', v)} 
          value={formData.color} 
          placeholder="#FF0000"
          autoCapitalize="none"
          returnKeyType="next" 
          onSubmitEditing={() => coordsRef.current?.focus()} 
          blurOnSubmit={false} 
        />
      </View>

      {/* Coordenadas (Solo en creación) */}
      {!isEditing && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Coordenadas (Longitud, Latitud)</Text>
          <Text style={[styles.userEmail, {marginBottom: 8}]}>
            Pega los pares de coordenadas, uno por línea.
            Formato: <Text style={{fontWeight: 'bold'}}>LONGITUD, LATITUD</Text>
          </Text>
          <TextInput 
            ref={coordsRef}
            style={[styles.input, {height: 150, textAlignVertical: 'top'}]} 
            multiline
            numberOfLines={6}
            onChangeText={(v) => handleChange('coordenadas', v)} 
            value={formData.coordenadas} 
            placeholder="-85.370, 12.170&#x0a;-85.365, 12.170&#x0a;-85.365, 12.165&#x0a;-85.370, 12.165"
            autoCapitalize="none"
          />
        </View>
      )}
      
      <TouchableOpacity style={styles.registerButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>{isEditing ? "Guardar Cambios" : "Registrar Sector"}</Text>}
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};


// --- Tab 1: Listado y CRUD de Sectores ---
const SectoresTab = ({ onGoToAddForm, onEditSector, refreshKey }) => {
  const [sectorList, setSectorList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSectors = async () => {
    setLoading(true);
    try { 
      const sectores = await fetchSectores(); 
      setSectorList(sectores); 
    }
    catch (error) { Alert.alert("Error", "No se pudo cargar la lista."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchSectors(); }, [refreshKey]);

  const handleDeleteSector = (item) => {
    Alert.alert( "Confirmar Eliminación", `¿Eliminar el sector "${item.nombre}"? Esto no se puede deshacer.`, 
      [ { text: "Cancelar" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              const result = await deleteSector(item.id); 
              if (result.success) { 
                Alert.alert("Éxito", "Sector eliminado."); 
                fetchSectors(); 
              } else { 
                Alert.alert("Error", result.error); 
              }
            } catch (error) {
              console.error("Error al eliminar sector:", error);
              Alert.alert("Error Inesperado", error.message);
            }
          }
        }
      ]
    );
  };

  const renderSectorItem = ({ item }) => {
    return (
        <View style={styles.userItem}>
            <View style={styles.userItemHeader}>
                <View style={styles.userItemText}>
                    <Text style={styles.userName}>{item.nombre}</Text>
                    <Text style={styles.userEmail}>ID: {item.id}</Text>
                </View>
                <View style={[styles.userItemRole, {backgroundColor: item.color || '#CCC', width: 40, height: 20, marginBottom: 0}]} />
            </View>
            
            <View style={[styles.expandedDetailsContainer, { borderTopWidth: 0, paddingVertical: 10 }]}>
                <View style={styles.expandedActionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteSector(item)}>
                        <Trash2 size={16} color="#B91C1C" />
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEditSector(item)}>
                        <Edit size={16} color="#1D4ED8" />
                        <Text style={[styles.actionButtonText, styles.editButtonText]}>Editar Detalles</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Gestión de Sectores</Text>
        <TouchableOpacity style={styles.addUserButton} onPress={onGoToAddForm}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addUserButtonText}>Agregar Sector</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? ( <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/> )
       : ( <FlatList data={sectorList} renderItem={renderSectorItem} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron sectores.</Text>} removeClippedSubviews={false} /> )
      }
    </View>
  );
};


// --- Tab 2: Empleados por Sector ---
const EmpleadosTab = ({ sectores }) => {
  const [userList, setUserList] = useState([]); // Usamos una lista local
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState('all');
  
  // Cargamos todos los usuarios y los almacenamos.
  const fetchUsers = async () => {
    setLoading(true);
    try { 
      const users = await getAllUsers(); 
      setUserList(users); 
    }
    catch (error) { Alert.alert("Error", "No se pudo cargar la lista de usuarios."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, []); 
  
  // Filtramos por rol y sector
  const filteredEmployees = useMemo(() => {
    let employees = userList.filter(user => (user.rol === 'empleado' || user.role === 'empleado') && user.sectorId);
    
    if (filterSector !== 'all') {
      employees = employees.filter(user => user.sectorId === filterSector);
    }
    return employees;
  }, [userList, filterSector]);

  const renderEmployeeItem = ({ item }) => {
    const sectorName = sectores.find(s => s.id === item.sectorId)?.nombre || `ID: ${item.sectorId}`;
    return (
      <View style={styles.userItem}>
        <View style={styles.userItemHeader}>
          <View style={styles.userItemText}>
            <Text style={styles.userName}>{item.nombres} {item.apellidos}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={[styles.userEmail, {fontWeight: 'bold', marginTop: 4}]}>Sector: {sectorName}</Text>
          </View>
          <View style={styles.userItemRoleContainer}>
            <Text style={[styles.userItemRole, styles.roleEmpleado]}>Empleado</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Opción "Todos" + Lista de sectores
  const pickerItems = useMemo(() => [
    { id: 'all', nombre: 'Todos los Sectores' },
    ...sectores
  ], [sectores]);

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Empleados por Sector</Text>
      </View>
      <Text style={{...styles.userEmail, paddingHorizontal: 0, marginBottom: 20, fontSize: 13}}>
        Muestra empleados con un campo "sectorId" definido. Asegúrese de asignar sectores en la gestión de usuarios.
      </Text>
      
      {/* Filtro por Sector */}
      <View style={styles.filterBar}>
        <View style={[styles.filterGroup, {flex: 2}]}>
          <Text style={styles.label}>Filtrar por Sector:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={filterSector} onValueChange={(v) => setFilterSector(v)} style={styles.picker}>
              {pickerItems.map(p => (<Picker.Item key={p.id} label={p.nombre} value={p.id} />))}
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
        <View style={{flex: 1}}/>
      </View>

      {loading ? ( 
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/> 
      ) : ( 
        <FlatList data={filteredEmployees} renderItem={renderEmployeeItem} keyExtractor={(item) => item.uid} ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron empleados en este sector.</Text>} removeClippedSubviews={false} /> 
      )}
    </View>
  );
};


// --- Tab 3: Gestión de Tareas ---
const TareasTab = ({ sectores }) => {
  const [loading, setLoading] = useState(true);
  const [tareasList, setTareasList] = useState([]);
  const [filterEstado, setFilterEstado] = useState('pendiente');
  const [expandedTareaId, setExpandedTareaId] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const tareas = await fetchTareas();
      setTareasList(tareas);
    } catch (error) {
      // Dejamos el alert para informar sobre el error de permisos de Firestore.
      Alert.alert("Error", error.message); 
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchTasks(); }, []);

  const filteredTasks = useMemo(() => {
    return tareasList.filter(t => filterEstado === 'all' || t.estado === filterEstado).sort((a, b) => {
        const dateA = a.fechaInicio?.toDate() || 0;
        const dateB = b.fechaInicio?.toDate() || 0;
        return dateB - dateA; // Más recientes primero
    });
  }, [tareasList, filterEstado]);
  
  const getStatusStyle = (estado) => {
     switch (estado) {
      case 'pendiente': return styles.statusEnEspera; // Amarillo
      case 'completada': return styles.statusRecibido; // Verde
      default: return styles.roleMaquinaria;
    }
  };
  
  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const handleMarcarCompletada = useCallback(async (tareaId) => {
    Alert.alert(
      "Confirmar Tarea",
      "¿Marcar esta tarea como completada?",
      [
        { text: "Cancelar" },
        {
          text: "Completar",
          onPress: async () => {
            try {
              await marcarTareaCompletada(tareaId);
              fetchTasks(); // Recarga la lista
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  }, []);

  const renderTareaItem = ({ item }) => {
    const isExpanded = expandedTareaId === item.id;
    const toggleExpansion = () => setExpandedTareaId(isExpanded ? null : item.id);
    const sector = sectores.find(s => s.id === item.sectorId);
    
    return (
      <View style={styles.userItem}>
        <View style={styles.userItemHeader}>
          <View style={styles.userItemText}>
            <Text style={styles.userName}>{item.titulo}</Text>
            <Text style={styles.userEmail}>Sector: {sector?.nombre || item.sectorId}</Text>
            <Text style={[styles.userEmail, { fontWeight: 'bold', marginTop: 4}]}>
              Período: {formatFecha(item.fechaInicio)} al {formatFecha(item.fechaFin)}
            </Text>
          </View>
          <View style={styles.userItemRoleContainer}>
            <Text style={[styles.userItemRole, getStatusStyle(item.estado)]}>{item.estado || 'N/A'}</Text>
            <TouchableOpacity style={styles.ellipsisButton} onPress={toggleExpansion}>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        {isExpanded && (
          <View style={styles.expandedDetailsContainer}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Detalles:</Text><Text style={styles.detailValue}>{item.detalles}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Creada:</Text><Text style={styles.detailValue}>{formatFecha(item.fechaCreacion)}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Completada:</Text><Text style={styles.detailValue}>{item.fechaCompletada ? formatFecha(item.fechaCompletada) : 'N/A'}</Text></View>
            <View style={styles.expandedActionsContainer}>
              {item.estado === 'pendiente' && (
                  <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={() => handleMarcarCompletada(item.id)}>
                    <Check size={16} color="#047857" />
                    <Text style={[styles.actionButtonText, styles.statusButtonText]}>Marcar Completada</Text>
                  </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Tareas de Sector</Text>
      </View>
      <View style={styles.filterBar}>
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Filtrar por Estado:</Text>
          <View style={[styles.pickerContainer, styles.filterPicker]}>
            <Picker selectedValue={filterEstado} onValueChange={(v) => setFilterEstado(v)} style={styles.picker}>
              <Picker.Item label="Pendiente" value="pendiente" />
              <Picker.Item label="Completada" value="completada" />
              <Picker.Item label="Todas" value="all" />
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
      </View>
      {loading ? ( <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/> )
       : ( <FlatList data={filteredTasks} renderItem={renderTareaItem} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron tareas.</Text>} removeClippedSubviews={false} /> )
      }
    </View>
  );
};


// --- Componente Principal del Módulo de Sectores (TabView Wrapper) ---
export default function GestionSectores() {
  const [viewMode, setViewMode] = useState('list'); 
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingSector, setEditingSector] = useState(null); 
  const [index, setIndex] = useState(0);
  const [sectores, setSectores] = useState([]); 

  // Cargamos los sectores una sola vez para pasarlos a los tabs
  const loadSectores = async () => {
    try {
      const data = await fetchSectores();
      setSectores(data);
    } catch (e) {
      console.error("Error loading sectors for tab view:", e);
    }
  };
  useEffect(() => { loadSectores(); }, [refreshKey]);


  const handleEditSector = (sector) => {
    setEditingSector(sector);
    setViewMode('edit');
  };

  const handleBackToList = (refresh) => {
    setViewMode('list');
    setEditingSector(null);
    if (refresh) {
      // Recarga la lista de sectores para la vista principal y los tabs
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  const routes = useMemo(
    () => [
      { key: "sectores", title: "Sectores" }, 
      { key: "empleados", title: "Empleados por Sector" }, 
      { key: "tareas", title: "Tareas" }, 
    ],
    []
  );

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case "sectores":
          return (
            <SectoresTab
              onGoToAddForm={() => setViewMode('add')} 
              onEditSector={handleEditSector} 
              refreshKey={refreshKey}
            />
          );
        case "empleados":
          return <EmpleadosTab sectores={sectores} />;
        case "tareas":
          return <TareasTab sectores={sectores} />;
        default:
          return null;
      }
    },
    [handleEditSector, refreshKey, sectores]
  );

  if (viewMode === 'add') {
    return <SectorForm onBackToList={handleBackToList} />;
  }
  
  if (viewMode === 'edit') {
     return <SectorForm onBackToList={handleBackToList} initialData={editingSector} />;
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={styles.tabBar}
          indicatorStyle={styles.tabIndicator}
          labelStyle={styles.tabLabel}
          activeColor="#2563EB"
          inactiveColor="#6B7280"
        />
      )}
    />
  );
}