// src/services/maquinariaService.js
import { db } from '../../firebaseConfig'; // Ajusta la ruta si es necesario
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  writeBatch,
  deleteDoc,
  orderBy, // <-- Asegúrate que orderBy esté importado
} from 'firebase/firestore';

// --- (NUEVO) Helper de Notificaciones ---
/**
 * Crea una notificación para un empleado específico.
 * @param {string} userId - El UID del empleado a notificar.
 * @param {string} title - El título de la notificación.
 * @param {string} message - El mensaje.
 * @param {'success' | 'error' | 'info'} type - El tipo de notificación.
 */
const crearNotificacionEmpleado = (userId, title, message, type = 'info') => {
  if (!userId) {
    console.error("Se intentó crear notificación sin userId");
    return;
  }
  return addDoc(collection(db, 'notificaciones'), {
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
};

/**
 * Crea una notificación para todos los administradores.
 * @param {string} title - El título de la notificación.
 * @param {string} message - El mensaje.
 * @param {'success' | 'error' | 'info' | 'return'} type - El tipo de notificación.
 */
const crearNotificacionAdmin = (title, message, type = 'info') => {
  return addDoc(collection(db, 'admin_notifications'), {
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
};

// --- STREAMS (Lecturas en tiempo real) ---

// Escucha todas las máquinas
export const streamMaquinas = (callback) => {
  const q = collection(db, 'machines'); 
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    callback(data); 
  }, (error) => {
    console.error("Error en streamMaquinas: ", error); 
  });
};

// (NUEVO) Escucha máquinas asignadas a un empleado específico
export const streamMaquinasAsignadas = (userId, callback) => {
  if (!userId) return () => {};
  const q = query(collection(db, 'machines'), where('assignedToId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error("Error en streamMaquinasAsignadas: ", error);
  });
};

// Escucha solo las reservas pendientes
export const streamReservasPendientes = (callback) => {
  const q = query(collection(db, 'reservations'), where('status', '==', 'pending')); 
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    callback(data); 
  }, (error) => {
    console.error("Error en streamReservasPendientes: ", error); 
  });
};

// Escucha solo mantenimientos no completados
export const streamMantenimientosPendientes = (callback) => {
  const q = query(collection(db, 'maintenanceRequests'), where('status', '!=', 'completed')); 
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    callback(data); 
  }, (error) => {
    console.error("Error en streamMantenimientosPendientes: ", error); 
  });
};

// --- (NUEVO) Stream de Notificaciones para Empleado ---
export const streamNotificacionesEmpleado = (userId, callback) => {
  if (!userId) return () => {}; 

  const q = query(
    collection(db, 'notificaciones'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const notificaciones = [];
    querySnapshot.forEach((doc) => {
      notificaciones.push({ id: doc.id, ...doc.data() });
    });
    callback(notificaciones);
  }, (error) => {
    console.error("Error al obtener notificaciones: ", error);
    callback([]);
  });
};

// (NUEVO) Stream de Notificaciones para Admin
export const streamNotificacionesAdmin = (callback) => {
  const q = query(
    collection(db, 'admin_notifications'),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const notificaciones = [];
    querySnapshot.forEach((doc) => {
      notificaciones.push({ id: doc.id, ...doc.data() });
    });
    callback(notificaciones);
  }, (error) => {
    console.error("Error al obtener notificaciones de admin: ", error);
    callback([]);
  });
};

// --- ACCIONES (Escrituras) ---

// Empleado: Crea una solicitud de reserva
export const crearSolicitudReserva = (reservaData) => {
  return addDoc(collection(db, 'reservations'), {
    ...reservaData,
    status: 'pending', 
    requestedAt: serverTimestamp(), 
  });
};

// Empleado: Crea una solicitud de mantenimiento
export const crearSolicitudMantenimiento = (mantenimientoData) => {
  return addDoc(collection(db, 'maintenanceRequests'), {
    ...mantenimientoData,
    status: 'pending', // Estado inicial
    requestedAt: serverTimestamp(),
  });
};

// (NUEVO) Empleado: Marca una tarea como completada y devuelve la máquina
export const marcarTareaCompletada = async (machine, userId, userName) => {
  const batch = writeBatch(db);

  // 1. Actualiza la máquina
  const machineRef = doc(db, 'machines', machine.id);
  batch.update(machineRef, { status: 'available', assignedToId: null });

  // 2. Crea notificación para el admin
  await crearNotificacionAdmin(
    'Máquina Devuelta',
    `${userName} ha devuelto la máquina "${machine.name}". Ahora está disponible.`,
    'return'
  );

  return batch.commit();
};

// Admin: Actualiza el estado de una máquina
export const actualizarEstadoMaquina = (machineId, newStatus) => {
  const machineRef = doc(db, 'machines', machineId); 
  const data = {
    status: newStatus, 
    ...(newStatus === 'available' && { assignedToId: null }) 
  };
  return updateDoc(machineRef, data); 
};

// Admin: Aprueba una reserva (MODIFICADO PARA USAR SOLO ID)
export const aprobarReserva = async (reserva) => { 
  const batch = writeBatch(db); 
  
  // 1. Actualiza la reserva
  const reservaRef = doc(db, 'reservations', reserva.id); 
  batch.update(reservaRef, { status: 'approved' }); 
  
  // 2. Actualiza la máquina (solo con el ID)
  const machineRef = doc(db, 'machines', reserva.machineId); 
  batch.update(machineRef, { status: 'in-use', assignedToId: reserva.requestedById }); 
  
  // 3. Enviar notificación al empleado
  await crearNotificacionEmpleado(
    reserva.requestedById,
    'Reserva Aprobada',
    `Tu solicitud para "${reserva.machineName}" ha sido aprobada.`,
    'success'
  );

  return batch.commit(); 
};

// Admin: Rechaza una reserva (MODIFICADO)
export const rechazarReserva = async (reserva) => { // Recibe el objeto 'reserva' completo
  const reservaRef = doc(db, 'reservations', reserva.id); 
  
  // 1. (NUEVO) Enviar notificación al empleado
  await crearNotificacionEmpleado(
    reserva.requestedById,
    'Reserva Rechazada',
    `Tu solicitud para "${reserva.machineName}" fue rechazada.`,
    'error'
  );
  
  // 2. Actualizar (o eliminar) la reserva
  // Opción A: Marcar como rechazada
   return updateDoc(reservaRef, { status: 'rejected' });
  // Opción B: Eliminar la solicitud
  // return deleteDoc(reservaRef); 
};

// Admin: Actualiza estado de mantenimiento (Solicitud de Mantenimiento)
export const actualizarEstadoMantenimiento = async (mantenimientoId, newStatus, machineId) => {
  const batch = writeBatch(db); 
  const mantenimientoRef = doc(db, 'maintenanceRequests', mantenimientoId); 
  batch.update(mantenimientoRef, { status: newStatus }); 

  if (newStatus === 'completed' && machineId) { 
    const machineRef = doc(db, 'machines', machineId); 
    batch.update(machineRef, { status: 'available' }); 
  }

  return batch.commit(); 
};

// --- CRUD DE MAQUINARIA ---

export const createMachine = (data) => {
  return addDoc(collection(db, 'machines'), {
    ...data,
    status: 'available', 
    assignedToId: null,
    lastMaintenance: '', 
    nextMaintenance: '', 
    createdAt: serverTimestamp(),
  });
};

export const updateMachine = (id, data) => {
  const machineRef = doc(db, 'machines', id);
  return updateDoc(machineRef, data);
};

export const deleteMachine = (id) => {
  const machineRef = doc(db, 'machines', id);
  return deleteDoc(machineRef);
};

export const registrarMantenimiento = (id, data) => {
  const machineRef = doc(db, 'machines', id);
  return updateDoc(machineRef, data);
};

// --- (NUEVO) Marcar Notificación como Leída ---
export const marcarNotificacionLeida = (notificacionId) => {
  const notifRef = doc(db, 'notificaciones', notificacionId);
  try {
    return updateDoc(notifRef, { read: true });
  } catch (error) {
    console.error("Error al marcar como leída: ", error);
  }
};

export const marcarNotificacionAdminLeida = (notificationId) => {
  const notifRef = doc(db, 'admin_notifications', notificationId);
  try {
    return updateDoc(notifRef, { read: true });
  } catch (error) {
    console.error("Error al marcar notificación de admin como leída: ", error);
  }
};