import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView, Image
} from 'react-native';
import { Package, ChevronLeft, Plus, Edit, Trash2, ChevronDown } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/adminStyles'; // Estilos base
import productoStyles from '../../styles/productoStyles'; // Estilos del catálogo
import * as productoService from '../../services/productoService';
import * as almacenService from '../../services/almacenService';

// --- Formulario para Crear/Editar Producto ---
const ProductoForm = ({ onBackToList, initialData = null }) => {
  const isEditing = !!initialData;
  // --- (INICIO DE MODIFICACIÓN) ---
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    imageUrl: initialData?.imageUrl || '',
    precio: initialData?.precio?.toString() || '',
    cantidadVenta: initialData?.cantidadVenta?.toString() || '', // <-- NUEVO
    unidadVenta: initialData?.unidadVenta || 'kilos', // <-- MODIFICADO
    almacenId: initialData?.almacenId || '',
  });
  // --- (FIN DE MODIFICACIÓN) ---
  const [loading, setLoading] = useState(false);
  const [almacenes, setAlmacenes] = useState([]);

  const imageRef = useRef(null);
  const precioRef = useRef(null);
  // --- (INICIO DE MODIFICACIÓN) ---
  const cantidadVentaRef = useRef(null); // <-- NUEVO
  // --- (FIN DE MODIFICACIÓN) ---

  // Cargar almacenes para el Picker
  useEffect(() => {
    const unsub = almacenService.streamAlmacenes((data) => {
      setAlmacenes(data);
      if (!isEditing && data.length > 0 && !formData.almacenId) {
        setFormData(prev => ({ ...prev, almacenId: data[0].id }));
      }
    });
    return () => unsub();
  }, [isEditing, formData.almacenId]); // formData.almacenId
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    // --- (INICIO DE MODIFICACIÓN) ---
    const { nombre, imageUrl, precio, cantidadVenta, unidadVenta, almacenId } = formData;
    
    if (!nombre || !precio || !cantidadVenta || !unidadVenta || !almacenId) {
      Alert.alert("Error", "Todos los campos (Nombre, Precio, Cantidad, Unidad y Almacén) son obligatorios.");
      setLoading(false);
      return;
    }
    
    const data = {
        nombre,
        imageUrl,
        precio: parseFloat(precio),
        cantidadVenta: parseFloat(cantidadVenta), // <-- NUEVO
        unidadVenta: unidadVenta, // <-- MODIFICADO
        almacenId,
    };
    // --- (FIN DE MODIFICACIÓN) ---

    try {
      if (isEditing) {
        await productoService.updateProducto(initialData.id, data);
        Alert.alert("Éxito", "Producto actualizado.");
      } else {
        await productoService.createProducto(data);
        Alert.alert("Éxito", "Producto registrado.");
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
          <Text style={styles.backButtonText}>Volver al catálogo</Text>
        </TouchableOpacity>
        <View style={styles.formHeader}>
          <Package size={24} color="#1F2937" />
          <Text style={styles.formTitle}>{isEditing ? "Editar Producto" : "Registrar Nuevo Producto"}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Producto</Text>
          <TextInput style={styles.input} onChangeText={(v) => handleChange('nombre', v)} value={formData.nombre}
            placeholder="Ej: Maíz Amarillo (Saco)"
            returnKeyType="next" onSubmitEditing={() => imageRef.current?.focus()} blurOnSubmit={false} />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>URL de la Imagen (Opcional)</Text>
          <TextInput ref={imageRef} style={styles.input} onChangeText={(v) => handleChange('imageUrl', v)} value={formData.imageUrl}
            placeholder="https://ejemplo.com/imagen.png"
            autoCapitalize="none"
            returnKeyType="next" onSubmitEditing={() => precioRef.current?.focus()} blurOnSubmit={false} />
        </View>

        {/* --- (INICIO DE MODIFICACIÓN) --- */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Precio Total (del Paquete)</Text>
          <TextInput ref={precioRef} style={styles.input} onChangeText={(v) => handleChange('precio', v)} value={formData.precio}
            placeholder="Ej: 1200.00"
            keyboardType="numeric"
            returnKeyType="next"
            onSubmitEditing={() => cantidadVentaRef.current?.focus()} // <-- MODIFICADO
            blurOnSubmit={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cantidad de Venta (Número)</Text>
          <TextInput ref={cantidadVentaRef} style={styles.input} onChangeText={(v) => handleChange('cantidadVenta', v)} value={formData.cantidadVenta}
            placeholder="Ej: 50"
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Unidad de Venta (de la cantidad)</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={formData.unidadVenta} onValueChange={(v) => handleChange('unidadVenta', v)} style={styles.picker}>
              <Picker.Item label="Kilos (kg)" value="kilos" />
              <Picker.Item label="Libras (lb)" value="libras" />
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
        {/* --- (FIN DE MODIFICACIÓN) --- */}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Almacén de Origen (Stock)</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={formData.almacenId} onValueChange={(v) => handleChange('almacenId', v)} style={styles.picker}>
              {almacenes.length === 0 ? (
                <Picker.Item label="Cargando almacenes..." value="" />
              ) : (
                almacenes.map(almacen => (
                  <Picker.Item key={almacen.id} label={`${almacen.nombre} (${almacen.materiaPrima})`} value={almacen.id} />
                ))
              )}
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.registerButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>{isEditing ? "Guardar Cambios" : "Registrar Producto"}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Tarjeta de Producto (para la cuadrícula) ---
const ProductCard = ({ item, onEdit, onDelete, almacenes }) => {
  const almacenOrigen = useMemo(() => {
    return almacenes.find(a => a.id === item.almacenId);
  }, [almacenes, item.almacenId]);

  return (
    <View style={productoStyles.cardContainer}>
      <Image 
        source={item.imageUrl ? { uri: item.imageUrl } : require('../../../assets/icon.png')} // Fallback
        style={productoStyles.cardImage} 
      />
      {/* --- (INICIO DE MODIFICACIÓN) --- */}
      <View style={productoStyles.cardInfo}>
        <Text style={productoStyles.cardName} numberOfLines={1}>{item.nombre}</Text>
        {/* Muestra el precio total */}
        <Text style={productoStyles.cardPrice}>C$ {item.precio.toFixed(2)}</Text>
        {/* Muestra la cantidad y unidad */}
        <Text style={productoStyles.cardPackage}>
          Paquete: {item.cantidadVenta} {item.unidadVenta}
        </Text>
        <Text style={productoStyles.cardStock}>
          Stock de: {almacenOrigen?.nombre || 'N/A'}
        </Text>
      </View>
      {/* --- (FIN DE MODIFICACIÓN) --- */}
      <View style={productoStyles.cardActions}>
        <TouchableOpacity style={productoStyles.actionButton} onPress={() => onDelete(item)}>
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity style={productoStyles.actionButton} onPress={() => onEdit(item)}>
          <Edit size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Lista Principal de Productos (Cuadrícula) ---
const ProductoList = ({ onGoToAddForm, onEdit }) => {
  const [productoList, setProductoList] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const unsubProductos = productoService.streamProductos((productos) => {
      setProductoList(productos);
      setLoading(false);
    });
    const unsubAlmacenes = almacenService.streamAlmacenes((data) => {
      setAlmacenes(data);
    });
    return () => {
      unsubProductos();
      unsubAlmacenes();
    };
  }, [refreshKey]);

  const handleDelete = (item) => {
    Alert.alert("Confirmar Eliminación", `¿Eliminar producto "${item.nombre}"?`,
      [{ text: "Cancelar" },
       { text: "Eliminar", style: "destructive", onPress: async () => {
          try {
            await productoService.deleteProducto(item.id);
            Alert.alert("Éxito", "Producto eliminado.");
            setRefreshKey(k => k + 1); 
          } catch (error) {
            Alert.alert("Error", error.message);
          }
       }}
      ]
    );
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Catálogo de Productos</Text>
        <TouchableOpacity style={styles.addUserButton} onPress={onGoToAddForm}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addUserButtonText}>Nuevo Producto</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/>
      ) : (
        <FlatList
          data={productoList}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onEdit={onEdit}
              onDelete={handleDelete}
              almacenes={almacenes}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2} // <-- 2 columnas
          contentContainerStyle={productoStyles.gridContainer}
          ListEmptyComponent={<Text style={styles.emptyListText}>No hay productos registrados.</Text>}
        />
      )}
    </View>
  );
};

// --- Componente Principal ---
export default function GestionProductos() {
  const [viewMode, setViewMode] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProducto, setEditingProducto] = useState(null);

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setViewMode('edit');
  };

  const handleBackToList = (refresh) => {
    setViewMode('list');
    setEditingProducto(null);
    if (refresh) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  if (viewMode === 'add') {
    return <ProductoForm onBackToList={handleBackToList} />;
  }
  if (viewMode === 'edit') {
    return <ProductoForm onBackToList={handleBackToList} initialData={editingProducto} />;
  }
  return <ProductoList onGoToAddForm={() => setViewMode('add')} onEdit={handleEdit} refreshKey={refreshKey} />;
}