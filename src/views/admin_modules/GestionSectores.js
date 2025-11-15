// src/views/admin_modules/GestionSectores.js
import React, { useState, useEffect, useMemo, useRef } from 'react'; 
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView
} from 'react-native'; 
import { MapPin, ChevronLeft, Plus, Edit, Trash2, Search } from 'lucide-react-native';
import { crearSector, fetchSectores } from '../../services/mapaService';
import styles from '../../styles/adminStyles'; // Reusamos los estilos de admin

// --- Formulario para crear/editar Sector ---
const SectorForm = ({ onBackToList }) => {
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    color: '#FF0000',
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
    
    if (!id || !nombre || !color || !coordenadas) {
        Alert.alert("Error", "Todos los campos son obligatorios.");
        setLoading(false);
        return;
    }

    try {
      const result = await crearSector(id, nombre, color, coordenadas);
      if (result.success) {
        Alert.alert("Éxito", "Sector registrado.");
        onBackToList(true); // Regresa a la lista y recarga
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
        <Text style={styles.formTitle}>Registrar Nuevo Sector</Text>
      </View>
      <Text style={styles.formSubtitle}>Define un nuevo polígono para el mapa.</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID del Sector (Único)</Text>
        <TextInput 
          style={styles.input} 
          onChangeText={(v) => handleChange('id', v.toLowerCase().replace(/ /g, '_'))} 
          value={formData.id} 
          placeholder="Ej: sector_a, lote_5"
          autoCapitalize="none"
          returnKeyType="next" 
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
      
      <TouchableOpacity style={styles.registerButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>Registrar Sector</Text>}
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Lista de Sectores ---
const SectorList = ({ onGoToAddForm, onEditSector, refreshKey }) => {
  const [sectorList, setSectorList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try { 
      const sectores = await fetchSectores(); 
      setSectorList(sectores); 
    }
    catch (error) { Alert.alert("Error", "No se pudo cargar la lista."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, [refreshKey]);

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
            {/* Aquí puedes añadir botones de Editar/Eliminar si lo deseas */}
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

// --- Componente Principal del Módulo ---
export default function GestionSectores() {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBackToList = (refresh) => {
    setViewMode('list');
    if (refresh) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  if (viewMode === 'add') {
    return <SectorForm onBackToList={handleBackToList} />;
  }
  
  // Por ahora no hay modo 'edit', se hace en el mapa
  // if (viewMode === 'edit') {
  //   ...
  // }

  return <SectorList onGoToAddForm={() => setViewMode('add')} refreshKey={refreshKey} />;
}