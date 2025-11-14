// src/components/NotificationBellEmpleado.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Bell, X, Info, CheckCircle, AlertCircle } from 'lucide-react-native';
import { auth } from '../../firebaseConfig';
import * as MaquinariaService from '../services/maquinariaService';

export default function NotificationBellEmpleado() {
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // Esta campana escucha las notificaciones personales
      const unsubscribe = MaquinariaService.streamNotificacionesEmpleado(
        user.uid,
        (notifs) => {
          setNotifications(notifs);
        }
      );
      return () => unsubscribe();
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openModal = () => {
    setModalVisible(true);
    // Marcar todas como leídas al abrir
    notifications.forEach(notif => {
      if (!notif.read) {
        MaquinariaService.marcarNotificacionLeida(notif.id);
      }
    });
  };

  const getIcon = (type) => {
    if (type === 'success') {
      return <CheckCircle size={24} color="#10B981" />;
    }
    if (type === 'error') {
      return <AlertCircle size={24} color="#EF4444" />;
    }
    return <Info size={24} color="#3B82F6" />;
  };

  const renderNotifItem = ({ item }) => (
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
            data={notifications}
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
});