// src/views/admin_modules/GestionCompras.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView
} from 'react-native'; 
import { ShoppingCart, ChevronLeft, ChevronDown, MoreVertical, Check, XCircle, Trash2, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createCompra, getAllCompras, updateCompraStatus, deleteCompra } from '../../services/compraService'; //
import { getAllProveedores } from '../../services/proveedorService'; 
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/adminStyles'; 

// --- Formulario de Compras ---
// (Esta parte no tiene cambios, se incluye para que copies el archivo completo)
const CompraForm = ({ onBackToList, initialData = null, user = null, initialProveedor = null }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    proveedorId: initialData?.proveedorId || initialProveedor?.id || '',
    proveedorNombre: initialData?.proveedorNombre || initialProveedor?.nombreEmpresa || '',
    items: initialData?.items || '',
    fecha_entrega_deseada: initialData?.fecha_entrega_deseada || '',
    deposito_area: initialData?.deposito_area || '',
    solicitanteEmail: initialData?.solicitanteEmail || user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (initialProveedor) {
      if (initialData?.fecha_entrega_deseada) {
         const parts = initialData.fecha_entrega_deseada.split('/');
         if (parts.length === 3) {
           const initialDate = new Date(parts[2], parts[1] - 1, parts[0]);
           if (!isNaN(initialDate)) { setDate(initialDate); }
         }
      }
      return;
    }
    const fetchProviders = async () => {
      try {
        const providerList = await getAllProveedores(); //
        setProviders(providerList);
        if (!isEditing && providerList.length > 0) {
          setFormData(prev => ({
            ...prev,
            proveedorId: providerList[0].id,
            proveedorNombre: providerList[0].nombreEmpresa,
          }));
        }
      } catch (error) { Alert.alert("Error", "No se pudieron cargar los proveedores."); }
    };
    fetchProviders();
  }, [isEditing, initialProveedor, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProviderChange = (proveedorId) => {
    const selectedProvider = providers.find(p => p.id === proveedorId);
    if (selectedProvider) {
      setFormData(prev => ({
        ...prev,
        proveedorId: selectedProvider.id,
        proveedorNombre: selectedProvider.nombreEmpresa,
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    let result;
    if (isEditing) {
      Alert.alert("Info", "La actualización de compras aún no está implementada.");
      result = { success: false, error: "Función no disponible."};
    } else {
      result = await createCompra(formData); //
    }
    setLoading(false);
    if (result.success) {
      Alert.alert("Éxito", "Solicitud de compra registrada.");
      onBackToList(true);
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    if (event.type !== 'dismissed' && selectedDate) {
        let tempDate = new Date(currentDate);
        let day = tempDate.getDate().toString().padStart(2, '0');
        let month = (tempDate.getMonth() + 1).toString().padStart(2, '0');
        let year = tempDate.getFullYear();
        let fDate = `${day}/${month}/${year}`;
        handleChange('fecha_entrega_deseada', fDate);
    } else if (Platform.OS === 'android') {
        setShowDatePicker(false);
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
        <ShoppingCart size={24} color="#1F2937" />
        <Text style={styles.formTitle}>{isEditing ? "Editar Compra" : "Nueva Solicitud de Compra"}</Text>
      </View>
      <Text style={styles.formSubtitle}>Llene los detalles de la solicitud.</Text>
      {initialProveedor ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Proveedor</Text>
          <TextInput style={[styles.input, { backgroundColor: '#E5E7EB', color: '#6B7280' }]} value={formData.proveedorNombre} editable={false}/>
        </View>
      ) : (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Proveedor</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={formData.proveedorId} onValueChange={handleProviderChange} style={styles.picker}>
              {providers.map(p => (<Picker.Item key={p.id} label={p.nombreEmpresa} value={p.id} />))}
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
      )}
      <View style={styles.inputGroup}><Text style={styles.label}>Items (Descripción)</Text><TextInput style={[styles.input, {height: 80}]} multiline onChangeText={(v) => handleChange('items', v)} value={formData.items} placeholder="Ej: 10 sacos de abono..."/></View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fecha Entrega Deseada (Opcional)</Text>
        <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowDatePicker(true)}>
          <Text style={formData.fecha_entrega_deseada ? styles.dateInputText : styles.dateInputTextPlaceholder}>
            {formData.fecha_entrega_deseada || 'Seleccionar fecha...'}
          </Text>
          <Calendar size={20} color="#6B7280" style={styles.dateInputIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Área de Depósito (Opcional)</Text><TextInput style={styles.input} onChangeText={(v) => handleChange('deposito_area', v)} value={formData.deposito_area} placeholder="Ej: Bodega Principal"/></View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Solicitante (Admin)</Text>
        <TextInput style={[styles.input, { backgroundColor: '#E5E7EB', color: '#6B7280' }]} value={formData.solicitanteEmail} editable={false}/>
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>{isEditing ? "Guardar Cambios" : "Registrar Compra"}</Text>}
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} minimumDate={new Date()}/>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Lista de Compras ---
const CompraList = ({ onGoToAddForm, onEditCompra, refreshKey }) => {
  const [compraList, setCompraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedCompraId, setExpandedCompraId] = useState(null);

  const fetchCompras = async () => {
    setLoading(true);
    try { const compras = await getAllCompras(); setCompraList(compras); } //
    catch (error) { Alert.alert("Error", "No se pudo cargar la lista de compras."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchCompras(); }, [refreshKey]);

  const filteredAndSortedCompras = useMemo(() => {
    let tempCompras = compraList.filter(compra => filterEstado === 'all' || compra.estado === filterEstado);
    tempCompras.sort((a, b) => {
      const dateA = a.fecha_solicitud?.toDate ? a.fecha_solicitud.toDate() : 0;
      const dateB = b.fecha_solicitud?.toDate ? b.fecha_solicitud.toDate() : 0;
      return (sortOrder === 'asc') ? dateA - dateB : dateB - dateA;
    });
    return tempCompras;
  }, [compraList, filterEstado, sortOrder]);

  const getStatusStyle = (estado) => {
     switch (estado) {
      case 'Pendiente': return styles.statusPendiente;
      case 'Recibido': return styles.statusRecibido;
      case 'Cancelado': return styles.statusCancelado;
      default: return styles.roleMaquinaria;
    }
  };

  const handleUpdateStatus = async (id, nuevoEstado) => {
    setExpandedCompraId(null);
    const result = await updateCompraStatus(id, nuevoEstado); //
    if (result.success) {
      Alert.alert("Éxito", `Pedido marcado como ${nuevoEstado}.`);
      fetchCompras();
    } else { Alert.alert("Error", result.error); }
  };

  // --- FUNCIÓN MODIFICADA ---
  const handleDelete = (item) => {
    Alert.alert( "Confirmar Eliminación", `¿Eliminar pedido a ${item.proveedorNombre}?`, //
      [ { text: "Cancelar" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              const result = await deleteCompra(item.id); //
              
              if (result.success) { 
                Alert.alert("Éxito", "Solicitud eliminada."); 
                fetchCompras(); //
              } else { 
                Alert.alert("Error", result.error); //
              }
            } catch (error) {
              console.error("Error fatal al eliminar (GestionCompras):", error);
              Alert.alert("Error Inesperado", "No se pudo ejecutar la acción. Revise la consola.");
            } finally {
              setExpandedCompraId(null); //
            }
          }
        }
      ]
    );
  };
  // --- FIN DE MODIFICACIÓN ---

  const renderCompraItem = ({ item }) => {
    const isExpanded = expandedCompraId === item.id;
    const toggleExpansion = () => setExpandedCompraId(isExpanded ? null : item.id);
    const fecha = item.fecha_solicitud?.toDate ? item.fecha_solicitud.toDate().toLocaleDateString('es-ES') : 'N/A';
    const solicitante = item.solicitanteEmail || 'N/A';

    return (
      <View style={styles.userItem}>
        <View style={styles.userItemHeader}>
          <View style={styles.userItemText}>
            <Text style={styles.userName}>{item.proveedorNombre}</Text>
            <Text style={styles.userEmail}>Solicitado: {fecha}</Text>
            <Text style={[styles.userEmail, { fontWeight: '500', marginTop: 4}]}>Por: {solicitante}</Text>
          </View>
          <View style={styles.userItemRoleContainer}>
            <Text style={[styles.userItemRole, getStatusStyle(item.estado)]}>{item.estado || 'N/A'}</Text>
            <TouchableOpacity style={styles.ellipsisButton} onPress={toggleExpansion}>
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        {isExpanded && (
          <View style={styles.expandedDetailsContainer}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Items:</Text><Text style={styles.detailValue}>{item.items}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Entrega:</Text><Text style={styles.detailValue}>{item.fecha_entrega_deseada || 'N/A'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Depósito:</Text><Text style={styles.detailValue}>{item.deposito_area || 'N/A'}</Text></View>
            <View style={styles.expandedActionsContainer}>
              {item.estado === 'Pendiente' && (
                <>
                  <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => handleUpdateStatus(item.id, 'Cancelado')}>
                    <XCircle size={16} color="#B91C1C" />
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={() => handleUpdateStatus(item.id, 'Recibido')}>
                    <Check size={16} color="#047857" />
                    <Text style={[styles.actionButtonText, styles.statusButtonText]}>Recibido</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                <Trash2 size={16} color="#B91C1C" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Gestión de Compras</Text>
        <TouchableOpacity style={styles.addUserButton} onPress={onGoToAddForm}>
          <ShoppingCart size={18} color="#FFFFFF" />
          <Text style={styles.addUserButtonText}>Nueva Solicitud</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterBar}>
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Filtrar por Estado:</Text>
          <View style={[styles.pickerContainer, styles.filterPicker]}>
            <Picker selectedValue={filterEstado} onValueChange={(v) => setFilterEstado(v)} style={styles.picker}>
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Pendiente" value="Pendiente" />
              <Picker.Item label="Recibido" value="Recibido" />
              <Picker.Item label="Cancelado" value="Cancelado" />
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Ordenar Por Fecha:</Text>
          <View style={[styles.pickerContainer, styles.filterPicker]}>
            <Picker selectedValue={sortOrder} onValueChange={(v) => setSortOrder(v)} style={styles.picker}>
              <Picker.Item label="Más Nuevas" value="desc" />
              <Picker.Item label="Más Antiguas" value="asc" />
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
      </View>
      {loading ? ( <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/> )
       : ( <FlatList data={filteredAndSortedCompras} renderItem={renderCompraItem} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron solicitudes.</Text>} removeClippedSubviews={false} /> )
      }
    </View>
  );
};

// --- Componente Principal del Módulo de Compras ---
// (Esta parte no tiene cambios, se incluye para que copies el archivo completo)
export default function GestionCompras({ user, initialProveedor }) {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingCompra, setEditingCompra] = useState(null);

  useEffect(() => {
    if (initialProveedor) {
      setViewMode('add');
    } else {
        setViewMode('list');
    }
  }, [initialProveedor]); 

  const handleEditCompra = (compra) => {
    setEditingCompra(compra);
    Alert.alert("Info", "Edición no implementada");
  };

  const handleBackToList = (refresh) => {
    setViewMode('list');
    setEditingCompra(null);
    if (refresh) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  if (viewMode === 'add') {
    return <CompraForm onBackToList={handleBackToList} user={user} initialProveedor={initialProveedor} />;
  }
  if (viewMode === 'edit') {
     return <CompraList onGoToAddForm={() => setViewMode('add')} onEditCompra={handleEditCompra} refreshKey={refreshKey} />;
  }
  return <CompraList onGoToAddForm={() => setViewMode('add')} onEditCompra={handleEditCompra} refreshKey={refreshKey} />;
}