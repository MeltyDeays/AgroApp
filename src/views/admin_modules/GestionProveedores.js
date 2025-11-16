
import React, { useState, useEffect, useMemo, useRef } from 'react'; 
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView
} from 'react-native'; 
import { Truck, ChevronLeft, ChevronDown, MoreVertical, Edit, Trash2, Search, ShoppingBag } from 'lucide-react-native';
import { createProveedor, getAllProveedores, updateProveedor, deleteProveedor } from '../../services/proveedorService'; 
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/adminStyles'; 



const ProveedorForm = ({ onBackToList, initialData = null }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    nombreEmpresa: initialData?.nombreEmpresa || '',
    contacto: initialData?.contacto || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    direccion: initialData?.direccion || '',
    productos_suministrados: initialData?.productos_suministrados || '',
  });
  const [loading, setLoading] = useState(false);

  const contactoRef = useRef(null);
  const telefonoRef = useRef(null);
  const emailRef = useRef(null);
  const direccionRef = useRef(null);
  const productosRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    let result;
    if (isEditing) {
      const updateData = { ...formData };
      delete updateData.id;
      result = await updateProveedor(initialData.id, updateData); 
    } else {
      
      result = { success: false, error: "La creación se maneja desde Gestión de Usuarios." };
    }
    setLoading(false);
    if (result.success) {
      Alert.alert("Éxito", isEditing ? "Proveedor actualizado." : "Proveedor registrado.");
      onBackToList(true);
    } else {
      Alert.alert("Error", result.error);
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
        {isEditing ? <Edit size={24} color="#1F2937" /> : <Truck size={24} color="#1F2937" />}
        <Text style={styles.formTitle}>{isEditing ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}</Text>
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Nombre de la Empresa</Text>
        <TextInput style={styles.input} onChangeText={(v) => handleChange('nombreEmpresa', v)} value={formData.nombreEmpresa} 
          returnKeyType="next" onSubmitEditing={() => contactoRef.current?.focus()} blurOnSubmit={false} />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Nombre de Contacto</Text>
        <TextInput ref={contactoRef} style={styles.input} onChangeText={(v) => handleChange('contacto', v)} value={formData.contacto} 
          returnKeyType="next" onSubmitEditing={() => telefonoRef.current?.focus()} blurOnSubmit={false} />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Teléfono</Text>
        <TextInput ref={telefonoRef} style={styles.input} keyboardType="phone-pad" onChangeText={(v) => handleChange('telefono', v)} value={formData.telefono} 
          returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} blurOnSubmit={false} />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Email (Opcional)</Text>
        <TextInput ref={emailRef} style={[styles.input, { backgroundColor: '#E5E7EB', color: '#6B7280' }]} autoCapitalize="none" keyboardType="email-address" onChangeText={(v) => handleChange('email', v)} value={formData.email} 
          editable={false} 
        />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Dirección (Opcional)</Text>
        <TextInput ref={direccionRef} style={styles.input} onChangeText={(v) => handleChange('direccion', v)} value={formData.direccion} 
          returnKeyType="next" onSubmitEditing={() => productosRef.current?.focus()} blurOnSubmit={false} />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Productos que Suministra (Opcional)</Text>
        <TextInput 
          ref={productosRef} 
          style={styles.input} 
          onChangeText={(v) => handleChange('productos_suministrados', v)} 
          value={formData.productos_suministrados} 
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>{isEditing ? "Guardar Cambios" : "Registrar Proveedor"}</Text>}
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};


const ProveedorList = ({ onEditProveedor, onRealizarPedido, refreshKey }) => {
  const [proveedorList, setProveedorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedProveedorId, setExpandedProveedorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProveedores = async () => {
    setLoading(true);
    try { const proveedores = await getAllProveedores(); setProveedorList(proveedores); } 
    catch (error) { Alert.alert("Error", "No se pudo cargar la lista de proveedores."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchProveedores(); }, [refreshKey]);

  const filteredAndSortedProveedores = useMemo(() => {
    let tempProveedores = proveedorList.filter(prov => {
      if (!searchTerm) return true;
      return prov.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase());
    });
    tempProveedores.sort((a, b) => {
      const nameA = a.nombreEmpresa.toLowerCase();
      const nameB = b.nombreEmpresa.toLowerCase();
      return (sortOrder === 'asc') ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return tempProveedores;
  }, [proveedorList, sortOrder, searchTerm]);

  const renderProveedorItem = ({ item }) => {
    const isExpanded = expandedProveedorId === item.id;
    const toggleExpansion = () => setExpandedProveedorId(isExpanded ? null : item.id);

    
    
    

    return (
      <View style={styles.userItem}>
        <View style={styles.userItemHeader}>
          <View style={styles.userItemText}>
            <Text style={styles.userName}>{item.nombreEmpresa}</Text>
            <Text style={styles.userEmail}>Contacto: {item.contacto}</Text>
            <Text style={styles.userEmail}>Tel: {item.telefono}</Text>
          </View>
          <View style={styles.userItemRoleContainer}>
            <TouchableOpacity style={styles.ellipsisButton} onPress={toggleExpansion}>
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        {isExpanded && (
          <View style={styles.expandedDetailsContainer}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Email:</Text><Text style={styles.detailValue}>{item.email || 'N/A'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Dirección:</Text><Text style={styles.detailValue}>{item.direccion || 'N/A'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Suministra:</Text><Text style={styles.detailValue}>{item.productos_suministrados || 'N/A'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Creado:</Text><Text style={styles.detailValue}>{item.fechaCreacion?.toDate ? item.fechaCreacion.toDate().toLocaleDateString('es-ES') : 'N/A'}</Text></View>
            
            {/* --- (INICIO DE MODIFICACIÓN) --- */}
            <View style={styles.expandedActionsContainer}>
              <TouchableOpacity style={[styles.actionButton, styles.pedidoButton]} onPress={() => onRealizarPedido(item)}>
                <ShoppingBag size={16} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, styles.pedidoButtonText]}>Realizar Pedido</Text>
              </TouchableOpacity>
              
              {/* Botón de eliminar deshabilitado de esta vista */}
              {/*
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                <Trash2 size={16} color="#B91C1C" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
              </TouchableOpacity>
              */}

              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEditProveedor(item)}>
                <Edit size={16} color="#1D4ED8" />
                <Text style={[styles.actionButtonText, styles.editButtonText]}>Editar Detalles</Text>
              </TouchableOpacity>
            </View>
            {/* --- (FIN DE MODIFICACIÓN) --- */}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.listContainer}>
      
      {/* --- (INICIO DE MODIFICACIÓN) --- */}
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Gestión de Proveedores</Text>
        {/* Botón de Agregar deshabilitado
        <TouchableOpacity style={styles.addUserButton} onPress={onGoToAddForm}>
          <Truck size={18} color="#FFFFFF" />
          <Text style={styles.addUserButtonText}>Agregar Proveedor</Text>
        </TouchableOpacity>
        */}
      </View>

      {/* Texto de ayuda */}
      <Text style={{...styles.userEmail, paddingHorizontal: 0, marginBottom: 20, textAlign: 'center', fontSize: 13}}>
        Los proveedores ahora se crean en <Text style={{fontWeight: 'bold'}}>Gestión de Usuarios</Text> (rol "Proveedor").
        Desde aquí puede <Text style={{fontWeight: 'bold'}}>Editar</Text> sus datos de contacto o <Text style={{fontWeight: 'bold'}}>Realizar Pedidos</Text>.
      </Text>
      {/* --- (FIN DE MODIFICACIÓN) --- */}

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchInputIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre de empresa..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#6B7280"
        />
      </View>
      <View style={styles.filterBar}>
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Ordenar A-Z:</Text>
          <View style={[styles.pickerContainer, styles.filterPicker]}>
            <Picker selectedValue={sortOrder} onValueChange={(v) => setSortOrder(v)} style={styles.picker}>
              <Picker.Item label="A - Z" value="asc" />
              <Picker.Item label="Z - A" value="desc" />
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
      </View>
      {loading ? ( <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/> )
       : ( <FlatList data={filteredAndSortedProveedores} renderItem={renderProveedorItem} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron proveedores.</Text>} removeClippedSubviews={false} /> )
      }
    </View>
  );
};



export default function GestionProveedores({ onNavigateToPedido }) {
  const [viewMode, setViewMode] = useState('list'); 
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProveedor, setEditingProveedor] = useState(null);

  const handleEditProveedor = (proveedor) => {
    setEditingProveedor(proveedor);
    setViewMode('edit');
  };

  const handleBackToList = (refresh) => {
    setViewMode('list');
    setEditingProveedor(null);
    if (refresh) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  
  
  
  
  
  

  if (viewMode === 'edit') {
    return <ProveedorForm onBackToList={handleBackToList} initialData={editingProveedor} />;
  }
  return <ProveedorList
            
            onEditProveedor={handleEditProveedor}
            onRealizarPedido={onNavigateToPedido} 
            refreshKey={refreshKey}
          />;
}