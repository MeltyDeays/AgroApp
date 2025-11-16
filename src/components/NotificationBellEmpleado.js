// src/components/NotificationBellEmpleado.js
import React, { useState, useEffect, useMemo } from 'react'; // <-- AÑADIDO useMemo
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Alert, // <-- AÑADIDO
} from 'react-native';
// --- AÑADIDO: UserCheck, XCircle ---
import { Bell, X, Info, CheckCircle, AlertCircle, UserCheck, XCircle } from 'lucide-react-native';
import { auth } from '../../firebaseConfig';
import * as MaquinariaService from '../services/maquinariaService';
import * as MapaService from '../services/mapaService'; // <-- AÑADIDO

export default function NotificationBellEmpleado() {
  const [modalVisible, setModalVisible] = useState(false);
  const [maquinariaNotifications, setMaquinariaNotifications] = useState([]); // <-- Renombrado
  const [supervisorRequests, setSupervisorRequests] = useState([]); // <-- AÑADIDO
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // 1. Listener para notificaciones de maquinaria
      const unsubscribeMaquinaria = MaquinariaService.streamNotificacionesEmpleado(
        user.uid,
        (notifs) => {
          setMaquinariaNotifications(notifs);
        }
      );
      
      // --- AÑADIDO: 2. Listener para solicitudes de supervisor ---
      const unsubscribeSupervisor = MapaService.streamSupervisorRequests(
        user.uid,
        (solicitudes) => {
          setSupervisorRequests(solicitudes);
        }
      );

      return () => {
        unsubscribeMaquinaria();
        unsubscribeSupervisor(); // <-- Limpiar
      };
    }
  }, [user]);

  // --- AÑADIDO: Combinar todas las notificaciones ---
  const allNotifications = useMemo(() => {
    const combined = [...maquinariaNotifications, ...supervisorRequests];
    // Ordenar por fecha, más nuevas primero
    combined.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || a.fechaCreacion?.toDate() || 0;
      const dateB = b.createdAt?.toDate() || b.fechaCreacion?.toDate() || 0;
      return dateB - dateA;
    });
    return combined;
  }, [maquinariaNotifications, supervisorRequests]);


  const unreadCount = useMemo(() => {
    // Contar notificaciones de maquinaria no leídas
    const unreadMaquinaria = maquinariaNotifications.filter(n => !n.read).length;
    // Solicitudes de supervisor siempre cuentan como "no leídas" hasta ser respondidas
    const unreadSupervisor = supervisorRequests.length; 
    return unreadMaquinaria + unreadSupervisor;
  }, [maquinariaNotifications, supervisorRequests]);


  const openModal = () => {
    setModalVisible(true);
    // Marcar solo las de maquinaria como leídas al abrir
    maquinariaNotifications.forEach(notif => {
      if (!notif.read && !notif.notificationType) { // Asegura no marcar las de supervisor
        MaquinariaService.marcarNotificacionLeida(notif.id);
      }
    });
  };

  // --- AÑADIDO: Manejador para responder a la solicitud ---
  const handleResponderSolicitud = async (solicitud, aceptar) => {
    const accion = aceptar ? "aceptada" : "rechazada";
    try {
      await MapaService.responderSolicitudSupervisor(solicitud, aceptar);
      Alert.alert("Éxito", `Solicitud ${accion} correctamente.`);
      // La lista se actualizará sola gracias al listener
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };


  const getIcon = (type) => {
    if (type === 'success') {
      return <CheckCircle size={24} color="#10B981" />;
    }
    if (type === 'error') {
      return <AlertCircle size={24} color="#EF4444" />;
    }
    // --- AÑADIDO: Icono para solicitud de supervisor ---
    if (type === 'supervisorRequest') {
      return <UserCheck size={24} color="#2563EB" />;
    }
    return <Info size={24} color="#3B82F6" />;
  };

  const renderNotifItem = ({ item }) => {
    
    // --- AÑADIDO: Renderizado para Solicitud de Supervisor ---
    if (item.notificationType === 'supervisorRequest') {
      return (
        <View style={[styles.notifCard, styles.notifUnread, {borderColor: '#93C5FD'}]}>
          <View style={styles.notifIcon}>{getIcon(item.notificationType)}</View>
          <View style={styles.notifContent}>
            <Text style={[styles.notifTitle, {color: '#1E40AF'}]}>Solicitud de Supervisor</Text>
            <Text style={styles.notifMessage}>
              Has sido nominado como supervisor para el sector: <Text style={{fontWeight: 'bold'}}>{item.sectorNombre}</Text>.
            </Text>
            <Text style={styles.notifTime}>
              Enviada: {item.fechaCreacion?.toDate().toLocaleDateString('es-ES')}
            </Text>
            {/* Botones de Acción */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleResponderSolicitud(item, false)}
              >
                <XCircle size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleResponderSolicitud(item, true)}
              >
                <CheckCircle size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Renderizado normal (Maquinaria)
    return (
      <View style={[styles.notifCard, !item.read && styles.notifUnread]}>
        <View style={styles.notifIcon}>{getIcon(item.type)}</View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifMessage}>{item.message}</Text>
          <Text style={styles.notifTime}>
            {item.createdAt?.toDate().toLocaleDateString('es-ES')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity onPress={openModal} style={styles.bellButton}>
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
            data={allNotifications} // <-- Usar la lista combinada
            renderItem={renderNotifItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tienes notificaciones.</Text>
            }
            contentContainerStyle={{ padding: 20 }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: { position: 'relative', padding: 8, marginRight: 10 },
  badge: {
    position: 'absolute', top: 4, right: 4, backgroundColor: '#EF4444',
    borderRadius: 10, width: 20, height: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#F9FAFB'
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 22, fontWeight: '600', color: '#1F2937' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#6B7280' },
  notifCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  notifUnread: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  notifIcon: { marginRight: 12, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  notifMessage: { fontSize: 14, color: '#4B5563', marginTop: 4 },
  notifTime: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  
  // --- AÑADIDOS: Estilos para botones de acción ---
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  rejectButton: {
    backgroundColor: '#EF4444', // Rojo
  },
  acceptButton: {
    backgroundColor: '#10B981', // Verde
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  }
});