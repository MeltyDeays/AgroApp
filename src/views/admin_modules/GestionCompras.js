// src/views/admin_modules/GestionCompras.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView
} from 'react-native'; 
import { ShoppingCart, ChevronLeft, ChevronDown, MoreVertical, Check, XCircle, Trash2, Calendar, CheckSquare } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TabView, TabBar } from "react-native-tab-view"; 
import { Timestamp } from 'firebase/firestore'; 

// Importamos los dos servicios
import { crearPedidoProveedor, streamPedidosAdmin, marcarPedidoRecibido } from '../../services/pedidoProveedorService'; 
import { getAllCompras, updateCompraStatus, deleteCompra } from '../../services/compraService'; 
import { auth } from '../../../firebaseConfig'; 

import { getAllProveedores } from '../../services/proveedorService'; 
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/adminStyles'; 

// --- Formulario de Compras (MODIFICADO) ---
const CompraForm = ({ onBackToList, initialData = null, user = null, initialProveedor = null }) => {
  const isEditing = !!initialData;
  
  // --- (INICIO DE MODIFICACIÓN) ---
  // Añadimos TODOS los campos
  const [formData, setFormData] = useState({
    nombreProducto: initialData?.nombreProducto || '',
    cantidad: initialData?.cantidad || '',
    unidad: initialData?.unidad || 'unidades',
    items: initialData?.items || '', // <-- AÑADIDO (Descripción)
    deposito_area: initialData?.deposito_area || '', // <-- AÑADIDO
    fechaRequeridaStr: initialData?.fechaRequeridaStr || '', 
  });
  // --- (FIN DE MODIFICACIÓN) ---

  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(initialProveedor?.id || '');
  const [selectedProviderName, setSelectedProviderName] = useState(initialProveedor?.nombreEmpresa || ''); // <-- AÑADIDO
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Refs para los nuevos campos
  const cantidadRef = useRef(null);
  const unidadRef = useRef(null);
  const itemsRef = useRef(null);
  const depositoRef = useRef(null);


  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providerList = await getAllProveedores();
        setProviders(providerList);
        if (initialProveedor) {
          setSelectedProviderId(initialProveedor.id);
          setSelectedProviderName(initialProveedor.nombreEmpresa);
        } else if (!isEditing && providerList.length > 0) {
          setSelectedProviderId(providerList[0].id);
          setSelectedProviderName(providerList[0].nombreEmpresa);
        }
      } catch (error) { Alert.alert("Error", "No se pudieron cargar los proveedores."); }
    };
    fetchProviders();
  }, [isEditing, initialProveedor]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- (INICIO DE MODIFICACIÓN) ---
  // Guardamos nombre e ID al cambiar
  const handleProviderChange = (proveedorId) => {
    const selectedProvider = providers.find(p => p.id === proveedorId);
    if (selectedProvider) {
      setSelectedProviderId(selectedProvider.id);
      setSelectedProviderName(selectedProvider.nombreEmpresa);
    }
  };
  // --- (FIN DE MODIFICACIÓN) ---

  const handleSubmit = async () => {
    setLoading(true);

    if (!selectedProviderId) {
        Alert.alert("Error", "No se ha seleccionado un proveedor.");
        setLoading(false);
        return;
    }
    // --- (INICIO DE MODIFICACIÓN) ---
    // Validación actualizada
    if (!formData.nombreProducto || !formData.cantidad || !formData.fechaRequeridaStr || !formData.items) {
        Alert.alert("Error", "Producto, Cantidad, Items (Descripción) y Fecha son campos obligatorios.");
        setLoading(false);
        return;
    }
    // --- (FIN DE MODIFICACIÓN) ---

    let fechaRequeridaTimestamp = null;
    const parts = formData.fechaRequeridaStr.split('/');
    if (parts.length === 3) {
        const dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
        if (!isNaN(dateObj)) {
            fechaRequeridaTimestamp = Timestamp.fromDate(dateObj);
        }
    }
    if (!fechaRequeridaTimestamp) {
        Alert.alert("Error", "El formato de fecha es inválido (debe ser dd/mm/yyyy).");
        setLoading(false);
        return;
    }

    // --- (INICIO DE MODIFICACIÓN) ---
    // Enviamos TODOS los datos
    const pedidoData = {
        idAdmin: user?.uid,
        nombreAdmin: user?.displayName || user?.email || 'Admin',
        idProveedor: selectedProviderId,
        nombreProveedor: selectedProviderName, // <-- AÑADIDO
        nombreProducto: formData.nombreProducto,
        cantidad: parseInt(formData.cantidad, 10) || 0,
        unidad: formData.unidad,
        items: formData.items, // <-- AÑADIDO
        deposito_area: formData.deposito_area, // <-- AÑADIDO
        fechaRequerida: fechaRequeridaTimestamp,
    };
    // --- (FIN DE MODIFICACIÓN) ---

    const result = await crearPedidoProveedor(pedidoData);

    setLoading(false);
    if (result.success) {
      Alert.alert("Éxito", "Solicitud de pedido enviada al proveedor.");
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
        handleChange('fechaRequeridaStr', fDate);
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
        <Text style={styles.formTitle}>Nueva Solicitud a Proveedor</Text>
      </View>
      <Text style={styles.formSubtitle}>Llene los detalles de la solicitud.</Text>
      
      <View style={styles.inputGroup}>
          <Text style={styles.label}>Proveedor</Text>
          {initialProveedor ? (
            <TextInput style={[styles.input, { backgroundColor: '#E5E7EB', color: '#6B7280' }]} value={selectedProviderName} editable={false}/>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedProviderId} onValueChange={handleProviderChange} style={styles.picker}>
                {providers.map(p => (<Picker.Item key={p.id} label={p.nombreEmpresa} value={p.id} />))}
              </Picker>
              <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
            </View>
          )}
      </View>

      {/* --- (INICIO DE MODIFICACIÓN DE CAMPOS) --- */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Producto Principal (Título)</Text>
        <TextInput 
          style={styles.input} 
          onChangeText={(v) => handleChange('nombreProducto', v)} 
          value={formData.nombreProducto} 
          placeholder="Ej: Semilla de Maíz X"
          returnKeyType="next"
          onSubmitEditing={() => cantidadRef.current?.focus()}
          blurOnSubmit={false}
        />
      </View>
      <View style={{flexDirection: 'row', gap: 16}}>
        <View style={[styles.inputGroup, {flex: 2}]}>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput 
              ref={cantidadRef}
              style={styles.input} 
              keyboardType="numeric" 
              onChangeText={(v) => handleChange('cantidad', v)} 
              value={formData.cantidad} 
              placeholder="Ej: 50"
              returnKeyType="next"
              onSubmitEditing={() => unidadRef.current?.focus()}
              blurOnSubmit={false}
            />
        </View>
        <View style={[styles.inputGroup, {flex: 3}]}>
            <Text style={styles.label}>Unidad</Text>
            <TextInput 
              ref={unidadRef}
              style={styles.input} 
              onChangeText={(v) => handleChange('unidad', v)} 
              value={formData.unidad} 
              placeholder="Ej: sacos, cajas, kg"
              returnKeyType="next"
              onSubmitEditing={() => itemsRef.current?.focus()}
              blurOnSubmit={false}
            />
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Items (Descripción Detallada)</Text>
        <TextInput 
          ref={itemsRef}
          style={[styles.input, {height: 80}]} 
          multiline 
          onChangeText={(v) => handleChange('items', v)} 
          value={formData.items} 
          placeholder="Ej: 50 sacos de Semilla de Maíz X (lote 123), 20 cajas de Fertilizante Y..."
          returnKeyType="next"
          onSubmitEditing={() => depositoRef.current?.focus()}
          blurOnSubmit={false}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Área de Depósito (Opcional)</Text>
        <TextInput 
          ref={depositoRef}
          style={styles.input} 
          onChangeText={(v) => handleChange('deposito_area', v)} 
          value={formData.deposito_area} 
          placeholder="Ej: Bodega Principal"
        />
      </View>
      {/* --- (FIN DE MODIFICACIÓN DE CAMPOS) --- */}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fecha Requerida</Text>
        <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowDatePicker(true)}>
          <Text style={formData.fechaRequeridaStr ? styles.dateInputText : styles.dateInputTextPlaceholder}>
            {formData.fechaRequeridaStr || 'Seleccionar fecha...'}
          </Text>
          <Calendar size={20} color="#6B7280" style={styles.dateInputIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Solicitante (Admin)</Text>
        <TextInput style={[styles.input, { backgroundColor: '#E5E7EB', color: '#6B7280' }]} value={user?.email || 'N/A'} editable={false}/>
      </View>
      
      <TouchableOpacity style={styles.registerButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>Enviar Solicitud</Text>}
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} minimumDate={new Date()}/>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
};


// --- (NUEVO) Lista de Pedidos (Nueva Colección) ---
const PedidosList = ({ onGoToAddForm, user }) => {
  const [pedidosList, setPedidosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedPedidoId, setExpandedPedidoId] = useState(null);

  // Escucha los pedidos de la NUEVA colección
  useEffect(() => {
    setLoading(true);
    const unsubscribe = streamPedidosAdmin(user.uid, (pedidos) => {
      setPedidosList(pedidos);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const filteredAndSortedPedidos = useMemo(() => {
    let tempPedidos = pedidosList.filter(p => filterEstado === 'all' || p.estado === filterEstado);
    tempPedidos.sort((a, b) => {
      const dateA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate() : 0;
      const dateB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate() : 0;
      return (sortOrder === 'asc') ? dateA - dateB : dateB - dateA;
    });
    return tempPedidos;
  }, [pedidosList, filterEstado, sortOrder]);

  // Estilos para los NUEVOS estados
  const getStatusStyle = (estado) => {
     switch (estado) {
      case 'En espera': return styles.statusEnEspera;
      case 'En proceso': return styles.statusEnProceso;
      case 'Rechazada': return styles.statusRechazada;
      case 'Recibido': return styles.statusRecibido;
      default: return styles.roleMaquinaria;
    }
  };

  const handleMarcarRecibido = (pedido) => {
    Alert.alert(
      "Confirmar Recepción",
      `¿Confirmar que ha recibido "${pedido.nombreProducto}"?`,
      [
        { text: "Cancelar" },
        {
          text: "Sí, Recibido",
          onPress: async () => {
            await marcarPedidoRecibido(pedido.id);
            // La lista se actualiza sola por el listener
          },
        },
      ]
    );
  };

  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderPedidoItem = ({ item }) => {
    const isExpanded = expandedPedidoId === item.id;
    const toggleExpansion = () => setExpandedPedidoId(isExpanded ? null : item.id);
    const fechaSol = item.fechaCreacion ? formatFecha(item.fechaCreacion) : 'N/A';

    return (
      <View style={styles.userItem}>
        <View style={styles.userItemHeader}>
          <View style={styles.userItemText}>
            {/* --- (INICIO DE MODIFICACIÓN) --- */}
            <Text style={styles.userName}>{item.nombreProducto}</Text>
            <Text style={styles.userEmail}>A: {item.nombreProveedor || item.idProveedor}</Text>
            <Text style={styles.userEmail}>Solicitado: {fechaSol} ({item.cantidad} {item.unidad})</Text>
            <Text style={[styles.userEmail, { fontWeight: '500', marginTop: 4}]}>Req. para el: {formatFecha(item.fechaRequerida)}</Text>
            {/* --- (FIN DE MODIFICACIÓN) --- */}
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
            {/* --- (INICIO DE MODIFICACIÓN) --- */}
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Items:</Text><Text style={styles.detailValue}>{item.items}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Depósito:</Text><Text style={styles.detailValue}>{item.deposito_area || 'N/A'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>ID Pedido:</Text><Text style={styles.detailValue}>{item.id}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>ID Prov.:</Text><Text style={styles.detailValue}>{item.idProveedor}</Text></View>
            {/* --- (FIN DE MODIFICACIÓN) --- */}
            <View style={styles.expandedActionsContainer}>
              {/* Botón para marcar como Recibido (solo si está 'En proceso') */}
              {item.estado === 'En proceso' && (
                  <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={() => handleMarcarRecibido(item)}>
                    <CheckSquare size={16} color="#047857" />
                    <Text style={[styles.actionButtonText, styles.statusButtonText]}>Marcar Recibido</Text>
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
        <Text style={styles.formTitle}>Pedidos a Proveedores</Text>
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
              <Picker.Item label="En espera" value="En espera" />
              <Picker.Item label="En proceso" value="En proceso" />
              <Picker.Item label="Rechazada" value="Rechazada" />
              <Picker.Item label="Recibido" value="Recibido" />
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
       : ( <FlatList data={filteredAndSortedPedidos} renderItem={renderPedidoItem} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron solicitudes.</Text>} removeClippedSubviews={false} /> )
      }
    </View>
  );
};

// --- (VIEJO) Lista de Compras (Colección Antigua) ---
const CompraListAntigua = ({ onGoToAddForm }) => {
  const [compraList, setCompraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedCompraId, setExpandedCompraId] = useState(null);

  const fetchCompras = async () => {
    setLoading(true);
    try { const compras = await getAllCompras(); setCompraList(compras); } 
    catch (error) { Alert.alert("Error", "No se pudo cargar la lista de compras."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchCompras(); }, []); // Solo carga una vez

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
    const result = await updateCompraStatus(id, nuevoEstado);
    if (result.success) {
      Alert.alert("Éxito", `Pedido marcado como ${nuevoEstado}.`);
      fetchCompras();
    } else { Alert.alert("Error", result.error); }
  };

  const handleDelete = (item) => {
    Alert.alert( "Confirmar Eliminación", `¿Eliminar pedido a ${item.proveedorNombre}?`, 
      [ { text: "Cancelar" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              const result = await deleteCompra(item.id); 
              if (result.success) { 
                Alert.alert("Éxito", "Solicitud eliminada."); 
                fetchCompras(); 
              } else { 
                Alert.alert("Error", result.error); 
              }
            } catch (error) {
              console.error("Error fatal al eliminar (GestionCompras):", error);
              Alert.alert("Error Inesperado", "No se pudo ejecutar la acción. Revise la consola.");
            } finally {
              setExpandedCompraId(null); 
            }
          }
        }
      ]
    );
  };

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
        <Text style={styles.formTitle}>Historial de Compras (Antiguo)</Text>
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
       : ( <FlatList data={filteredAndSortedCompras} renderItem={renderCompraItem} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron solicitudes antiguas.</Text>} removeClippedSubviews={false} /> )
      }
    </View>
  );
};


// --- Componente Principal del Módulo de Compras (REDISEÑADO CON TABS) ---
export default function GestionCompras({ user, initialProveedor }) {
  const [viewMode, setViewMode] = useState('list');
  const [editingCompra, setEditingCompra] = useState(null); // Para el formulario de edición
  const [index, setIndex] = useState(0); // Pestaña 0 = Nuevos, Pestaña 1 = Antiguos

  const routes = useMemo(
    () => [
      { key: "nuevos", title: "Pedidos a Proveedor" }, // <-- Título cambiado
      { key: "antiguos", title: "Historial (Antiguo)" }, // <-- Título cambiado
    ],
    []
  );

  const currentUser = user || auth.currentUser;

  // Si venimos de 'GestionProveedores', vamos directo al formulario
  useEffect(() => {
    if (initialProveedor) {
      setViewMode('add');
    } else {
      setViewMode('list');
    }
  }, [initialProveedor]); 

  const handleBackToList = (refresh) => {
    setViewMode('list');
    setEditingCompra(null);
    // 'refresh' no es necesario porque las listas ahora usan listeners (stream)
  };

  // Renderiza la escena para el TabView
  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case "nuevos":
          return (
            <PedidosList
              onGoToAddForm={() => setViewMode("add")}
              user={currentUser}
            />
          );
        case "antiguos":
          return (
            <CompraListAntigua
              onGoToAddForm={() => setViewMode("add")}
            />
          );
        default:
          return null;
      }
    },
    [currentUser]
  );

  // Si estamos en modo 'add', muestra solo el formulario
  if (viewMode === 'add') {
    return <CompraForm onBackToList={handleBackToList} user={currentUser} initialProveedor={initialProveedor} />;
  }

  // Si estamos en modo 'edit' (aún no implementado, pero listo)
  if (viewMode === 'edit') {
     return <CompraForm onBackToList={handleBackToList} user={currentUser} initialData={editingCompra} />;
  }

  // Por defecto, muestra la lista con pestañas
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