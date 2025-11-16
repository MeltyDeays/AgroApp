import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList
} from 'react-native'; 
import { Users, ChevronDown, MoreVertical, Edit, Search, Trash2, Check } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/adminStyles'; 


import { fetchEmpleados, updateEmpleado, deleteEmpleado } from '../../services/empleadoService'; 
import { fetchSectores } from '../../services/mapaService'; 


const EmpleadoList = () => {
  const [empleadosList, setEmpleadosList] = useState([]);
  const [sectoresList, setSectoresList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSectorId, setEditingSectorId] = useState(null); 
  const [selectedSector, setSelectedSector] = useState(null); 

  
  const fetchData = async () => {
    setLoading(true);
    try { 
      const empleados = await fetchEmpleados(); 
      setEmpleadosList(empleados); 
      const sectores = await fetchSectores();
      setSectoresList(sectores);
    }
    catch (error) { Alert.alert("Error", "No se pudo cargar la lista de empleados o sectores."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [refreshKey]);


  const filteredAndSortedEmployees = useMemo(() => {
    let tempEmployees = empleadosList.filter(e => {
      if (!searchTerm) return true;
      const fullName = `${e.nombres || ''} ${e.apellidos || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return tempEmployees;
  }, [empleadosList, searchTerm]);
  
  
  const sectorPickerOptions = useMemo(() => [
    { id: '', nombre: 'Sin Asignar' },
    ...sectoresList
  ], [sectoresList]);

  
  const handleAssignSector = (empleado) => {
      setEditingSectorId(empleado.uid);
      setSelectedSector(empleado.sectorId || '');
      setExpandedId(empleado.uid); 
  };

  
  const handleSaveSector = async (empleado) => {
      if(selectedSector === empleado.sectorId) {
          Alert.alert("Info", "El sector no ha cambiado.");
          setEditingSectorId(null);
          return;
      }
      try {
          const updateData = { sectorId: selectedSector || null }; 
          await updateEmpleado(empleado.uid, updateData);
          Alert.alert("Éxito", "Sector asignado correctamente.");
          setEditingSectorId(null);
          setRefreshKey(prev => prev + 1); 
      } catch (error) {
          Alert.alert("Error", error.message);
      }
  };

  
  const handleDelete = (item) => {
      Alert.alert( "Confirmar Eliminación", `¿Eliminar a ${item.nombres} de la gestión de empleados? La cuenta de usuario principal debe ser eliminada desde Gestión de Usuarios.`, 
        [ { text: "Cancelar" },
          { 
            text: "Eliminar", 
            style: "destructive", 
            onPress: async () => {
              try {
                
                const result = await deleteEmpleado(item.uid);
                
                if (result.success) {
                  Alert.alert("Éxito", "Empleado eliminado de la colección.");
                  setRefreshKey(prev => prev + 1); 
                } else {
                  Alert.alert("Error", result.error); 
                }
              } catch (error) {
                console.error("Error al eliminar empleado:", error);
                Alert.alert("Error Inesperado", "No se pudo ejecutar la acción.");
              }
            }
          }
        ]
      );
  };


  const renderEmployeeItem = ({ item }) => {
    const isExpanded = expandedId === item.uid;
    const isEditingCurrentSector = editingSectorId === item.uid;
    const sectorActual = sectoresList.find(s => s.id === item.sectorId)?.nombre || 'Sin Asignar';

    const toggleExpansion = () => {
      if (isEditingCurrentSector) {
        setEditingSectorId(null); 
      }
      setExpandedId(isExpanded ? null : item.uid);
    };
    
    return (
      <View style={styles.userItem}>
        <View style={styles.userItemHeader}>
          <View style={styles.userItemText}>
            <Text style={styles.userName}>{item.nombres} {item.apellidos}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={[styles.userEmail, {fontWeight: 'bold', marginTop: 4}]}>Sector: {sectorActual}</Text>
          </View>
          <View style={styles.userItemRoleContainer}>
            <Text style={[styles.userItemRole, styles.roleEmpleado]}>Empleado</Text>
            <TouchableOpacity style={styles.ellipsisButton} onPress={toggleExpansion}>
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        
        {isExpanded && (
          <View style={styles.expandedDetailsContainer}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Cédula:</Text><Text style={styles.detailValue}>{item.cedula}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>UID:</Text><Text style={styles.detailValue}>{item.uid}</Text></View>
            
            {/* Controles de edición de Sector */}
            <View style={[styles.expandedActionsContainer, { flexDirection: 'column'}]}>
                <Text style={[styles.label, {marginTop: 10}]}>Asignar o Modificar Sector</Text>
                
                {/* Selector */}
                <View style={styles.pickerContainer}>
                    <Picker 
                        selectedValue={isEditingCurrentSector ? selectedSector : item.sectorId || ''} 
                        onValueChange={(v) => setSelectedSector(v)} 
                        style={styles.picker}
                        enabled={isEditingCurrentSector}
                    >
                        {sectorPickerOptions.map(s => (
                            <Picker.Item key={s.id} label={s.nombre || 'Sin Asignar'} value={s.id} />
                        ))}
                    </Picker>
                    <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
                </View>
                
                {/* Botones de acción */}
                <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10}}>
                    {isEditingCurrentSector ? (
                        <>
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton, {marginLeft: 0}]} onPress={() => setEditingSectorId(null)}>
                                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.statusRecibido]} onPress={() => handleSaveSector(item)}>
                                <Check size={16} color="#FFFFFF" />
                                <Text style={[styles.actionButtonText, {color: '#FFFFFF'}]}>Guardar Sector</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                                <Trash2 size={16} color="#B91C1C" />
                                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar Espejo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleAssignSector(item)}>
                                <Edit size={16} color="#1D4ED8" />
                                <Text style={[styles.actionButtonText, styles.editButtonText]}>Asignar Sector</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
            {/* Fin Controles de edición de Sector */}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Gestión de Empleados</Text>
      </View>
      <Text style={{...styles.userEmail, paddingHorizontal: 0, marginBottom: 20, fontSize: 13}}>
        Gestione los empleados registrados y asigne el sector de trabajo primario.
      </Text>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchInputIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#6B7280"
        />
      </View>

      {loading ? ( <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/> )
       : ( <FlatList 
                data={filteredAndSortedEmployees} 
                renderItem={renderEmployeeItem} 
                keyExtractor={(item) => item.uid} 
                ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron empleados.</Text>} 
                removeClippedSubviews={false} 
            /> 
        )
      }
    </View>
  );
};

export default function GestionEmpleados() {
    return <EmpleadoList />;
}