import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
// --- 1. Importar 'Check' para el nuevo botón ---
import { ArrowLeft, CheckCircle, Clock, XCircle, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../../firebaseConfig';
import * as pedidoClienteService from '../../services/pedidoClienteService';
import styles from '../../styles/socioStyles'; 

export default function MisPedidos() {
  const navigation = useNavigation();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setLoading(true);
      // Nos suscribimos a los pedidos de este socio
      const unsubscribe = pedidoClienteService.streamPedidosCliente(user.uid, (pedidosData) => {
        setPedidos(pedidosData);
        setLoading(false);
      });
      
      // --- 2. Marcar notificaciones como vistas ---
      // Lo llamamos después de un breve momento para asegurar que el stream se estableció
      setTimeout(() => {
        pedidoClienteService.marcarPedidosComoVistos(user.uid);
      }, 1000); 

      return () => unsubscribe();
    }
  }, [user]);

  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // --- 3. Lógica para confirmar entrega ---
  const handleConfirmarEntrega = (pedidoId) => {
    Alert.alert(
      "Confirmar Entrega",
      "¿Estás seguro de que ya has recibido este pedido?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, lo recibí",
          style: "default",
          onPress: async () => {
            try {
              await pedidoClienteService.completarPedidoSocio(pedidoId);
              Alert.alert("¡Éxito!", "Pedido marcado como completado.");
            } catch (error) {
              Alert.alert("Error", "No se pudo actualizar el pedido.");
            }
          },
        },
      ]
    );
  };

  // --- 4. Actualizar getStatusInfo ---
  const getStatusInfo = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return { style: styles.statusPendiente, text: "Pendiente", Icon: Clock };
      case 'Aprobado': // Aprobado ahora significa "En Camino"
        return { style: styles.statusAprobado, text: "En Camino", Icon: CheckCircle };
      case 'Completado': // Nuevo estado
        return { style: styles.statusCompletado, text: "Completado", Icon: Check };
      case 'Rechazado':
        return { style: styles.statusRechazado, text: "Rechazado", Icon: XCircle };
      default:
        return { style: {}, text: estado, Icon: Clock };
    }
  };

  const renderItem = ({ item }) => {
    const { style, text, Icon } = getStatusInfo(item.estado);
    const iconColor = style.color || '#6B7280';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Pedido ID: ...{item.id.slice(-6)}</Text>
            <Text style={styles.orderDate}>Fecha: {formatFecha(item.fechaPedido)}</Text>
          </View>
          <View style={[styles.orderStatus, style]}>
            <Icon size={14} color={iconColor} />
            <Text style={[styles.orderStatusText, { color: iconColor }]}>{text}</Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          {item.items.map((prod, index) => (
            <View key={index} style={styles.orderItemRow}>
              <Text style={styles.orderItemName} numberOfLines={1}>{prod.nombre} (x{prod.cantidad})</Text>
              <Text style={styles.orderItemSubtotal}>C$ {(prod.precio * prod.cantidad).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.orderTotalRow}>
          <Text style={styles.orderTotalLabel}>Total Pedido:</Text>
          <Text style={styles.orderTotalValue}>C$ {item.totalPedido.toFixed(2)}</Text>
        </View>

        {item.estado === 'Rechazado' && (
          <View style={styles.orderReasonContainer}>
            <Text style={styles.orderReasonLabel}>Motivo del rechazo:</Text>
            <Text style={styles.orderReasonText}>
              "{item.motivoRechazo || 'No se especificó un motivo.'}"
            </Text>
          </View>
        )}
        
        {/* --- 5. Mostrar botón de confirmar entrega --- */}
        {item.estado === 'Aprobado' && (
          <TouchableOpacity 
            style={styles.orderConfirmButton}
            onPress={() => handleConfirmarEntrega(item.id)}
          >
            <Text style={styles.orderConfirmButtonText}>Confirmar Entrega</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Pedidos</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartText}>No has realizado ningún pedido.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}