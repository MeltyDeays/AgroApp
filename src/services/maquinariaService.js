
import { db } from '../../firebaseConfig'; 
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
  orderBy, 
} from 'firebase/firestore';


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




export const streamMaquinas = (callback) => {
  const q = collection(db, 'machines'); 
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    callback(data); 
  }, (error) => {
    console.error("Error en streamMaquinas: ", error); 
  });
};


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


export const streamReservasPendientes = (callback) => {
  const q = query(collection(db, 'reservations'), where('status', '==', 'pending')); 
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    callback(data); 
  }, (error) => {
    console.error("Error en streamReservasPendientes: ", error); 
  });
};


export const streamMantenimientosPendientes = (callback) => {
  const q = query(collection(db, 'maintenanceRequests'), where('status', '!=', 'completed')); 
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    callback(data); 
  }, (error) => {
    console.error("Error en streamMantenimientosPendientes: ", error); 
  });
};


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




export const crearSolicitudReserva = (reservaData) => {
  return addDoc(collection(db, 'reservations'), {
    ...reservaData,
    status: 'pending', 
    requestedAt: serverTimestamp(), 
  });
};


export const crearSolicitudMantenimiento = (mantenimientoData) => {
  return addDoc(collection(db, 'maintenanceRequests'), {
    ...mantenimientoData,
    status: 'pending', 
    requestedAt: serverTimestamp(),
  });
};


export const marcarTareaCompletada = async (machine, userId, userName) => {
  const batch = writeBatch(db);

  
  const machineRef = doc(db, 'machines', machine.id);
  batch.update(machineRef, { status: 'available', assignedToId: null });

  
  await crearNotificacionAdmin(
    'Máquina Devuelta',
    `${userName} ha devuelto la máquina "${machine.name}". Ahora está disponible.`,
    'return'
  );

  return batch.commit();
};


export const actualizarEstadoMaquina = (machineId, newStatus) => {
  const machineRef = doc(db, 'machines', machineId); 
  const data = {
    status: newStatus, 
    ...(newStatus === 'available' && { assignedToId: null }) 
  };
  return updateDoc(machineRef, data); 
};


export const aprobarReserva = async (reserva) => { 
  const batch = writeBatch(db); 
  
  
  const reservaRef = doc(db, 'reservations', reserva.id); 
  batch.update(reservaRef, { status: 'approved' }); 
  
  
  const machineRef = doc(db, 'machines', reserva.machineId); 
  batch.update(machineRef, { status: 'in-use', assignedToId: reserva.requestedById }); 
  
  
  await crearNotificacionEmpleado(
    reserva.requestedById,
    'Reserva Aprobada',
    `Tu solicitud para "${reserva.machineName}" ha sido aprobada.`,
    'success'
  );

  return batch.commit(); 
};


export const rechazarReserva = async (reserva) => { 
  const reservaRef = doc(db, 'reservations', reserva.id); 
  
  
  await crearNotificacionEmpleado(
    reserva.requestedById,
    'Reserva Rechazada',
    `Tu solicitud para "${reserva.machineName}" fue rechazada.`,
    'error'
  );
  
  
  
   return updateDoc(reservaRef, { status: 'rejected' });
  
  
};


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