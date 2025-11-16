
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  FlatList,
  StyleSheet,
} from "react-native";
import { Bell, X, Clock, Undo2, Send } from "lucide-react-native";
import * as MaquinariaService from "../services/maquinariaService";
import * as PedidoService from "../services/pedidoProveedorService";
import { useUsers } from "../context/UserContext";
import { auth } from "../../firebaseConfig";

export default function NotificationBellAdmin({ onNotificationClick }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);

  const [respuestasPedidos, setRespuestasPedidos] = useState([]);
  const { getUserFullName } = useUsers(); 
  const user = auth.currentUser;

  useEffect(() => {
    
    const unsubReservas = MaquinariaService.streamReservasPendientes((data) => {
      const typedData = data.map((d) => ({
        ...d,
        notificationType: "pending",
      }));
      setSolicitudes(typedData);
    });

    
    const unsubAdmin = MaquinariaService.streamNotificacionesAdmin((data) => {
      const typedData = data.map((d) => ({
        ...d,
        notificationType: d.type || "info",
      }));
      setAdminNotifications(typedData);
    });

    
    let unsubPedidos = () => {};
    if (user) {
      unsubPedidos = PedidoService.streamRespuestasProveedor(
        user.uid,
        (data) => {
          
          setRespuestasPedidos(data);
        }
      );
    }

    return () => {
      unsubReservas();
      unsubAdmin();
      unsubPedidos();
    };
  }, [user]);

  
  const allNotifications = useMemo(() => {
    const combined = [
      ...solicitudes,
      ...adminNotifications,
      ...respuestasPedidos,
    ];

    
    combined.sort((a, b) => {
      const dateA =
        a.createdAt?.toDate() ||
        a.requestedAt?.toDate() ||
        a.fechaCreacion?.toDate() ||
        0;
      const dateB =
        b.createdAt?.toDate() ||
        b.requestedAt?.toDate() ||
        b.fechaCreacion?.toDate() ||
        0;
      return dateB - dateA;
    });
    return combined;
  }, [solicitudes, adminNotifications, respuestasPedidos]);

  const unreadCount = allNotifications.length;

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleItemClick = (item) => {
    if (item.notificationType === "pending") {
      
      if (onNotificationClick) {
        onNotificationClick(item); 
      }
    } else if (item.notificationType === "return") {
      
      MaquinariaService.marcarNotificacionAdminLeida(item.id);
    } else if (item.notificationType === "pedidoRespuesta") {
      
      PedidoService.marcarRespuestaPedidoLeida(item.id);
      
    }

    setModalVisible(false);
  };

  const renderNotifItem = ({ item }) => {
    
    if (item.notificationType === "pending") {
      return (
        <TouchableOpacity
          style={styles.notifCard}
          onPress={() => handleItemClick(item)}
        >
          <View style={styles.notifIcon}>
            <Clock size={24} color="#F59E0B" />
          </View>
          <View style={styles.notifContent}>
            <Text style={styles.notifTitle}>Nueva Solicitud de Reserva</Text>
            <Text style={styles.notifMessage}>
              {getUserFullName(item.requestedById) ||
                `Usuario ${item.requestedById.substring(0, 5)}...`}{" "}
              solicitó {item.machineName}
            </Text>
            <Text style={styles.notifTime}>
              {item.requestedAt?.toDate().toLocaleDateString("es-ES")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    
    if (item.notificationType === "return") {
      return (
        <TouchableOpacity
          style={styles.notifCard}
          onPress={() => handleItemClick(item)}
        >
          <View style={styles.notifIcon}>
            <Undo2 size={24} color="#10B981" />
          </View>
          <View style={styles.notifContent}>
            <Text style={[styles.notifTitle, { color: "#059669" }]}>
              {item.title}
            </Text>
            <Text style={styles.notifMessage}>{item.message}</Text>
            <Text style={styles.notifTime}>
              {item.createdAt?.toDate().toLocaleDateString("es-ES")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    
    
    if (item.notificationType === "pedidoRespuesta") {
      const isAccepted = item.estado === "En proceso";
      const title = isAccepted ? "Pedido Aceptado" : "Pedido Rechazado";
      const color = isAccepted ? "#1D4ED8" : "#B91C1C"; 

      
      const providerName =
        getUserFullName(item.idProveedor) ||
        `Proveedor ${item.idProveedor.substring(0, 5)}...`;

      return (
        <TouchableOpacity
          style={[
            styles.notifCard,
            {
              borderColor: color,
              backgroundColor: isAccepted ? "#EFF6FF" : "#FEF2F2",
            },
          ]}
          onPress={() => handleItemClick(item)}
        >
          <View style={styles.notifIcon}>
            <Send size={24} color={color} />
          </View>
          <View style={styles.notifContent}>
            <Text style={[styles.notifTitle, { color: color }]}>{title}</Text>
            <Text style={styles.notifMessage}>
              {providerName} ha respondido a tu pedido de "{item.nombreProducto}
              ".
            </Text>
            <Text style={styles.notifTime}>
              {item.fechaCreacion?.toDate().toLocaleDateString("es-ES")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    

    return null; 
  };

  return (
    <>
      <TouchableOpacity onPress={handleOpenModal} style={styles.bellButton}>
        <Bell size={24} color="#374151" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notificaciones</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={allNotifications}
            renderItem={renderNotifItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay notificaciones.</Text>
            }
            contentContainerStyle={{ padding: 20 }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: { position: "relative", padding: 8, marginRight: 10 },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F9FAFB",
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  modalContainer: { flex: 1, backgroundColor: "#F9FAFB" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 22, fontWeight: "600", color: "#1F2937" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#6B7280",
  },
  notifCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  notifUnread: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  notifIcon: { marginRight: 12, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  notifMessage: { fontSize: 14, color: "#4B5563", marginTop: 4 },
  notifTime: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
});
