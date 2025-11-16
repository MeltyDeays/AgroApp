
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LogOut, Check, X } from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import * as PedidoService from '../../services/pedidoProveedorService';
import styles from '../../styles/proveedorStyles';
export default function InicioProveedor() {
  const [user, setUser] = useState(auth.currentUser);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      
      
      const unsubscribe = PedidoService.streamPedidosPendientes(
        user.uid,
        (pedidosRecibidos) => {
          setPedidos(pedidosRecibidos);
          if (loading) setLoading(false);
        }
      );

      
      return () => unsubscribe();
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  
  const handleUpdatePedido = async (pedido, nuevoEstado) => {
    
    const accion = nuevoEstado === 'En proceso' ? 'Aceptar' : 'Rechazar';
    
    Alert.alert(
      `Confirmar ${accion}`,
      `¿Estás seguro de que quieres ${accion.toLowerCase()} el pedido de "${pedido.nombreProducto}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: `Sí, ${accion}`,
          style: nuevoEstado === 'Rechazada' ? 'destructive' : 'default',
          onPress: async () => {
            const result = await PedidoService.actualizarEstadoPedido(pedido.id, nuevoEstado);
            if (!result.success) {
              Alert.alert("Error", result.error);
            }
            
          },
        },
      ]
    );
  };
  

  
  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderPedidoItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nombreProducto}</Text>
      
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Cantidad</Text>
        <Text style={styles.cardValue}>{`${item.cantidad} ${item.unidad || ''}`}</Text>
      </View>
      
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Solicitante</Text>
        <Text style={styles.cardValue}>{item.nombreAdmin || 'Admin'}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Fecha Requerida</Text>
        <Text style={styles.cardValueDate}>{formatFecha(item.fechaRequerida)}</Text>
      </View>

      <View style={styles.actionsContainer}>
        {/* --- (INICIO DE MODIFICACIÓN) --- */}
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleUpdatePedido(item, 'Rechazada')}
        >
          <X size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Rechazar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleUpdatePedido(item, 'En proceso')}
        >
          <Check size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Aceptar</Text>
        </TouchableOpacity>
        {/* --- (FIN DE MODIFICACIÓN) --- */}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pedidos</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#1F2937" size={16} />
          <Text style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {user?.email || 'Proveedor'}
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color="#059669" 
            style={styles.loadingIndicator} 
          />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderPedidoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes pedidos pendientes.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}