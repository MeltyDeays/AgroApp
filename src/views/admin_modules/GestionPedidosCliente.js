import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Alert, ScrollView, TouchableOpacity 
} from 'react-native';
import { TabView, TabBar } from "react-native-tab-view"; 
import { Check, XCircle, User, Calendar, Tag, Info, Home } from 'lucide-react-native';
import { useUsers } from '../../context/UserContext';
import * as pedidoClienteService from '../../services/pedidoClienteService';
import * as almacenService from '../../services/almacenService'; 
import * as productoService from '../../services/productoService'; 
import styles from '../../styles/adminStyles'; 

const PedidosList = ({ pedidos, onApprove, onReject }) => {
  const { getUserFullName } = useUsers();

  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderItem = ({ item }) => {
    const isPending = item.estado === 'Pendiente';
    
    const handleRechazar = () => {
      Alert.prompt(
        "Rechazar Pedido",
        "Introduce un breve motivo (opcional):",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Confirmar Rechazo",
            style: "destructive",
            onPress: (motivo) => onReject(item.id, motivo || "Rechazado por el administrador."),
          },
        ],
        "plain-text"
      );
    };

    // --- (INICIO DE MODIFICACIÓN) ---
    // Colores de estado actualizados
    const getStatusStyle = (estado) => {
      switch (estado) {
        case 'Pendiente': return styles.statusEnEspera; // Amarillo
        case 'Aprobado': return styles.statusEnProceso; // Azul (En Camino)
        case 'Completado': return styles.statusRecibido; // Verde
        case 'Rechazado': return styles.statusRechazada; // Rojo
        default: return styles.roleMaquinaria;
      }
    };
    // --- (FIN DE MODIFICACIÓN) ---

    return (
      <View style={styles.userItem}>
        <View style={styles.userItemHeader}>
          <View style={styles.userItemText}>
            <Text style={styles.userName}>Socio: {getUserFullName(item.socioId) || item.socioNombre}</Text>
            <Text style={styles.userEmail}>ID Pedido: {item.id}</Text>
            <Text style={styles.userEmail}>Fecha: {formatFecha(item.fechaPedido)}</Text>
            <Text style={[styles.userName, { color: '#10B981', marginTop: 4 }]}>Total: C$ {item.totalPedido.toFixed(2)}</Text>
          </View>
          <View style={styles.userItemRoleContainer}>
            <Text style={[styles.userItemRole, getStatusStyle(item.estado)]}>{item.estado}</Text>
          </View>
        </View>
        <View style={styles.expandedDetailsContainer}>
          <View style={styles.detailRow}>
            <User size={16} color="#6B7280" /><Text style={styles.detailLabel}>Socio ID:</Text>
            <Text style={styles.detailValue}>{item.socioId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Tag size={16} color="#6B7280" /><Text style={styles.detailLabel}>Método Pago:</Text>
            <Text style={styles.detailValue}>{item.metodoPago} {item.paymentDetails ? `(...${item.paymentDetails.last4})` : ''}</Text>
          </View>
          <View style={styles.detailRow}>
            <Home size={16} color="#6B7280" /><Text style={styles.detailLabel}>Dirección:</Text>
            <Text style={styles.detailValue}>{item.direccionEntrega || 'No especificada'}</Text>
          </View>
          {item.motivoRechazo && (
            <View style={styles.detailRow}>
              <Info size={16} color="#B91C1C" /><Text style={[styles.detailLabel, {color: '#B91C1C'}]}>Motivo:</Text>
              <Text style={[styles.detailValue, {color: '#B91C1C'}]}>{item.motivoRechazo}</Text>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 12, marginBottom: 8 }]}>Items del Pedido:</Text>
          {item.items.map((prod, index) => (
            <View key={index} style={[styles.detailRow, {backgroundColor: '#F9FAFB', padding: 8, borderRadius: 4}]}>
              <Text style={styles.detailValue}>{prod.nombre} (x{prod.cantidad})</Text>
              <Text style={[styles.detailValue, {fontWeight: 'bold'}]}>C$ {(prod.precio * prod.cantidad).toFixed(2)}</Text>
            </View>
          ))}

          {isPending && (
            <View style={styles.expandedActionsContainer}>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleRechazar}>
                <XCircle size={16} color="#B91C1C" />
                <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={() => onApprove(item)}>
                <Check size={16} color="#047857" />
                <Text style={[styles.actionButtonText, styles.statusButtonText]}>Aprobar Pedido</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={pedidos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron pedidos en esta categoría.</Text>}
      contentContainerStyle={{ padding: 20 }}
    />
  );
};

export default function GestionPedidosCliente() {
  const [index, setIndex] = useState(0);
  // --- (INICIO DE MODIFICACIÓN) ---
  const [routes] = useState([
    { key: 'pendientes', title: 'Pendientes' },
    { key: 'aprobados', title: 'En Camino' }, // Texto cambiado
    { key: 'completados', title: 'Completados' }, // Nuevo
    { key: 'rechazados', title: 'Rechazados' },
  ]);
  // --- (FIN DE MODIFICACIÓN) ---

  const [loading, setLoading] = useState(true);
  const [allPedidos, setAllPedidos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [productos, setProductos] = useState([]); 

  useEffect(() => {
    setLoading(true);
    
    const unsubPedidos = pedidoClienteService.streamPedidosAdmin((pedidos) => {
      setAllPedidos(pedidos);
      setLoading(false);
    });

    const unsubAlmacenes = almacenService.streamAlmacenes(setAlmacenes);
    const unsubProductos = productoService.streamProductos(setProductos); 

    return () => {
      unsubPedidos();
      unsubAlmacenes();
      unsubProductos(); 
    };
  }, []);

  // --- (INICIO DE MODIFICACIÓN) ---
  const { pendientes, aprobados, completados, rechazados } = useMemo(() => {
    return {
      pendientes: allPedidos.filter(p => p.estado === 'Pendiente'),
      aprobados: allPedidos.filter(p => p.estado === 'Aprobado'),
      completados: allPedidos.filter(p => p.estado === 'Completado'), // Nuevo
      rechazados: allPedidos.filter(p => p.estado === 'Rechazado'),
    };
  }, [allPedidos]);
  // --- (FIN DE MODIFICACIÓN) ---

  const handleApprove = async (pedido) => {
    Alert.alert(
      "Confirmar Aprobación",
      `¿Aprobar y descontar el stock para el pedido de ${pedido.socioNombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Aprobar",
          style: "default",
          onPress: async () => {
            try {
              await pedidoClienteService.aprobarPedido(pedido, almacenes, productos);
              Alert.alert("Éxito", "Pedido aprobado y stock descontado.");
            } catch (error) {
              Alert.alert("Error al Aprobar", error.message);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (pedidoId, motivo) => {
    try {
      await pedidoClienteService.rechazarPedido(pedidoId, motivo);
      Alert.alert("Éxito", "Pedido rechazado.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // --- (INICIO DE MODIFICACIÓN) ---
  const renderScene = useCallback(({ route }) => {
    if (loading) {
      return <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />;
    }
    switch (route.key) {
      case 'pendientes':
        return <PedidosList pedidos={pendientes} onApprove={handleApprove} onReject={handleReject} />;
      case 'aprobados':
        return <PedidosList pedidos={aprobados} onApprove={null} onReject={null} />;
      case 'completados': // Nuevo
        return <PedidosList pedidos={completados} onApprove={null} onReject={null} />;
      case 'rechazados':
        return <PedidosList pedidos={rechazados} onApprove={null} onReject={null} />;
      default:
        return null;
    }
  }, [loading, pendientes, aprobados, completados, rechazados, handleApprove, handleReject]);
  // --- (FIN DE MODIFICACIÓN) ---

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