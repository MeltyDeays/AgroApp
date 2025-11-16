import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView, StyleSheet as RNStyleSheet
} from 'react-native';
import { Archive, ChevronLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/adminStyles'; 
import almacenStyles from '../../styles/almacenStyles'; 
import * as almacenService from '../../services/almacenService';
import { Modal } from 'react-native'; 


const AlmacenForm = ({ onBackToList, initialData = null }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    materiaPrima: initialData?.materiaPrima || '',
    capacidadMaxima: initialData?.capacidadMaxima?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  const materiaRef = useRef(null);
  const capacidadRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { nombre, materiaPrima, capacidadMaxima } = formData;
    const capacidadNum = parseFloat(capacidadMaxima) || 0;

    if (!nombre || !materiaPrima || !capacidadMaxima) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    if (capacidadNum <= 0) {
        Alert.alert("Error", "La capacidad máxima debe ser un número positivo.");
        setLoading(false);
        return;
    }

    try {
      if (isEditing) {
        if (capacidadNum < initialData.cantidadActual) {
          Alert.alert("Error de validación", `La nueva capacidad (${capacidadNum} kg) no puede ser menor que la cantidad actual (${initialData.cantidadActual} kg).`);
          setLoading(false);
          return;
        }
        
        const dataToUpdate = {
            nombre: nombre,
            materiaPrima: materiaPrima,
            capacidadMaxima: capacidadNum
        };
        
        await almacenService.updateAlmacen(initialData.id, dataToUpdate);
        Alert.alert("Éxito", "Almacén actualizado.");

      } else {
        const dataToCreate = {
            nombre,
            materiaPrima,
            capacidadMaxima: capacidadNum
        };
        await almacenService.createAlmacen(dataToCreate);
        Alert.alert("Éxito", "Almacén registrado.");
      }
      onBackToList(true);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBackToList(false)}>
          <ChevronLeft size={20} color="#2563eb" />
          <Text style={styles.backButtonText}>Volver a la lista</Text>
        </TouchableOpacity>
        <View style={styles.formHeader}>
          <Archive size={24} color="#1F2937" />
          <Text style={styles.formTitle}>{isEditing ? "Editar Almacén" : "Registrar Nuevo Almacén"}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Almacén</Text>
          <TextInput style={styles.input} onChangeText={(v) => handleChange('nombre', v)} value={formData.nombre}
            placeholder="Ej: Silo Principal 1"
            returnKeyType="next" onSubmitEditing={() => materiaRef.current?.focus()} blurOnSubmit={false} />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Materia Prima Almacenada</Text>
          <TextInput ref={materiaRef} style={styles.input} onChangeText={(v) => handleChange('materiaPrima', v)} value={formData.materiaPrima}
            placeholder="Ej: Maíz, Trigo, Fertilizante"
            returnKeyType="next" onSubmitEditing={() => capacidadRef.current?.focus()} blurOnSubmit={false} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Capacidad Máxima (en Kilos)</Text>
          <TextInput ref={capacidadRef} style={styles.input} onChangeText={(v) => handleChange('capacidadMaxima', v)} value={formData.capacidadMaxima}
            placeholder="Ej: 100000"
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={true}
          />
        </View>
        
        <TouchableOpacity style={styles.registerButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>{isEditing ? "Guardar Cambios" : "Registrar Almacén"}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const MateriaModal = ({ visible, onClose, almacen, mode, onSave }) => {
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('kilos');
  const [loading, setLoading] = useState(false);

  if (!almacen) return null;

  const title = mode === 'add' ? "Agregar Materia Prima" : "Retirar Materia Prima";
  const Icon = mode === 'add' ? ArrowUp : ArrowDown;
  const buttonColor = mode === 'add' ? '#10B981' : '#EF4444';

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(cantidad, unidad);
      setCantidad('');
      setUnidad('kilos');
      onClose();
    } catch (error) {
      Alert.alert("Error de validación", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={almacenStyles.modalContent}>
          <View style={almacenStyles.modalHeader}>
            <Icon size={28} color={buttonColor} />
            <Text style={almacenStyles.modalTitle}>{title}</Text>
          </View>
          <Text style={almacenStyles.modalSubtitle}>Almacén: {almacen.nombre} ({almacen.materiaPrima})</Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Cantidad</Text>
            <TextInput 
              style={almacenStyles.quantityInput} 
              placeholder="0" 
              value={cantidad} 
              onChangeText={setCantidad} 
              keyboardType="numeric" 
            />
            
            <Text style={[styles.label, {marginTop: 16}]}>Unidad</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={unidad} onValueChange={setUnidad} style={styles.picker}>
                <Picker.Item label="Kilos (kg)" value="kilos" />
                <Picker.Item label="Libras (lb)" value="libras" />
                <Picker.Item label="Toneladas (t)" value="toneladas" />
              </Picker>
              <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
            </View>
          </ScrollView>

          <View style={almacenStyles.modalButtonRow}>
            <TouchableOpacity 
              style={[almacenStyles.modalButtonAction, mode === 'add' ? almacenStyles.modalButtonAdd : almacenStyles.modalButtonRemove]} 
              onPress={handleSave} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={almacenStyles.modalButtonConfirmText}>{mode === 'add' ? 'Confirmar Ingreso' : 'Confirmar Retiro'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={almacenStyles.modalButtonClose} onPress={onClose} disabled={loading}>
              <Text style={almacenStyles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};



const AlmacenCard = ({ item, onEdit, onDelete, onAdd, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    capacidadMaxima,
    cantidadActual,
    materiaPrima,
    nombre
  } = item;

  
  const { percentage, color } = useMemo(() => {
    if (!capacidadMaxima || capacidadMaxima === 0) {
      return { percentage: 0, color: '#6B7280' }; 
    }
    const pct = (cantidadActual / capacidadMaxima) * 100;
    
    let col = '#F59E0B'; 
    
    if (pct < 15) { 
      col = '#000000ff'; 
    } else if (pct > 50) {
      col = '#10B981'; 
    }
    else { if (pct >= 60 && pct <= 100) {
      col = '#2fbd08ff'; 
    }
}
    
    return { percentage: Math.min(Math.max(pct, 0), 100), color: col };
  }, [cantidadActual, capacidadMaxima]);
  

  return (
    <View style={styles.userItem}>
      {/* Cabecera */}
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
        <View style={styles.userItemHeader}>
          <View style={styles.userItemText}>
            <Text style={styles.userName}>{nombre}</Text>
            <Text style={styles.userEmail}>{materiaPrima}</Text>
          </View>
          <TouchableOpacity style={styles.ellipsisButton} onPress={() => setIsExpanded(!isExpanded)}>
            <ChevronDown size={20} color="#6B7280" style={{ transform: [{ rotate: isExpanded ? '-90deg' : '0deg' }] }} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Cuerpo (Barra de progreso) */}
      <View style={{ paddingHorizontal: 16, paddingBottom: isExpanded ? 0 : 16 }}>
        <View style={almacenStyles.progressLabels}>
          <Text style={almacenStyles.progressText}>{cantidadActual.toFixed(0)} kg</Text>
          <Text style={almacenStyles.progressText}>{capacidadMaxima.toFixed(0)} kg</Text>
        </View>
        <View style={almacenStyles.progressBarBackground}>
          <View style={[almacenStyles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Text style={[almacenStyles.progressPercent, { color: color }]}>{percentage.toFixed(1)}% Lleno</Text>
      </View>

      {/* Acciones expandidas */}
      {isExpanded && (
        <View style={styles.expandedDetailsContainer}>
          <View style={styles.expandedActionsContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(item)}>
              <Trash2 size={16} color="#B91C1C" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEdit(item)}>
              <Edit size={16} color="#1D4ED8" />
              <Text style={[styles.actionButtonText, styles.editButtonText]}>Editar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.expandedActionsContainer}>
            <TouchableOpacity style={[styles.actionButton, almacenStyles.actionButtonRemove]} onPress={() => onRemove(item)}>
              <ArrowDown size={16} color="#B91C1C" />
              <Text style={[styles.actionButtonText, almacenStyles.actionButtonRemoveText]}>Retirar Materia</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, almacenStyles.actionButtonAdd]} onPress={() => onAdd(item)}>
              <ArrowUp size={16} color="#047857" />
              <Text style={[styles.actionButtonText, almacenStyles.actionButtonAddText]}>Agregar Materia</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};


const AlmacenList = ({ onGoToAddForm, onEdit }) => {
  const [almacenesList, setAlmacenesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);
  const [modalMode, setModalMode] = useState('add'); 

  useEffect(() => {
    setLoading(true);
    const unsubscribe = almacenService.streamAlmacenes((almacenes) => {
      setAlmacenesList(almacenes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [refreshKey]);

  const handleDelete = (item) => {
    Alert.alert("Confirmar Eliminación", `¿Eliminar almacén "${item.nombre}"?`,
      [{ text: "Cancelar" },
       { text: "Eliminar", style: "destructive", onPress: async () => {
          try {
            await almacenService.deleteAlmacen(item.id);
            Alert.alert("Éxito", "Almacén eliminado.");
            setRefreshKey(k => k + 1);
          } catch (error) {
            Alert.alert("Error", error.message);
          }
       }}
      ]
    );
  };

  const openModal = (almacen, mode) => {
    setSelectedAlmacen(almacen);
    setModalMode(mode);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAlmacen(null);
  };

  const handleSaveMateria = async (cantidadStr, unidad) => {
    const cantidadNum = parseFloat(cantidadStr);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      throw new Error("La cantidad debe ser un número positivo.");
    }
    
    const cantidadEnKilos = almacenService.convertirAKilos(cantidadNum, unidad);
    const { cantidadActual, capacidadMaxima, id } = selectedAlmacen;
    let newTotal;

    if (modalMode === 'add') {
      newTotal = cantidadActual + cantidadEnKilos;
      if (newTotal > capacidadMaxima) {
        throw new Error(`No se puede agregar. La capacidad máxima (${capacidadMaxima} kg) se superaría., (Total: ${newTotal.toFixed(0)} kg)`);
      }
    } else { 
      newTotal = cantidadActual - cantidadEnKilos;
      if (newTotal < 0) {
        throw new Error(`No se puede retirar. Solo hay ${cantidadActual.toFixed(0)} kg disponibles.`);
      }
    }

    await almacenService.updateAlmacen(id, { cantidadActual: newTotal });
    Alert.alert("Éxito", "Inventario actualizado.");
    setRefreshKey(k => k + 1);
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Gestión de Almacenes</Text>
        <TouchableOpacity style={styles.addUserButton} onPress={onGoToAddForm}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addUserButtonText}>Nuevo Almacén</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/>
      ) : (
        <FlatList
          data={almacenesList}
          renderItem={({ item }) => (
            <AlmacenCard
              item={item}
              onEdit={onEdit}
              onDelete={handleDelete}
              onAdd={() => openModal(item, 'add')}
              onRemove={() => openModal(item, 'remove')}
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyListText}>No hay almacenes registrados.</Text>}
        />
      )}

      {modalVisible && (
        <MateriaModal
          visible={modalVisible}
          onClose={closeModal}
          almacen={selectedAlmacen}
          mode={modalMode}
          onSave={handleSaveMateria}
        />
      )}
    </View>
  );
};


export default function GestionAlmacenes() {
  const [viewMode, setViewMode] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingAlmacen, setEditingAlmacen] = useState(null);

  const handleEdit = (almacen) => {
    setEditingAlmacen(almacen);
    setViewMode('edit');
  };

  const handleBackToList = (refresh) => {
    setViewMode('list');
    setEditingAlmacen(null);
    if (refresh) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  if (viewMode === 'add') {
    return <AlmacenForm onBackToList={handleBackToList} />;
  }
  if (viewMode === 'edit') {
    return <AlmacenForm onBackToList={handleBackToList} initialData={editingAlmacen} />;
  }
  return <AlmacenList onGoToAddForm={() => setViewMode('add')} onEdit={handleEdit} refreshKey={refreshKey} />;
}