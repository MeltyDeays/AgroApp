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
  deleteDoc, // <-- Asegúrate que esté importado
} from 'firebase/firestore';

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

// --- ACCIONES (Escrituras) ---

// Empleado: Crea una solicitud de reserva
export const crearSolicitudReserva = (reservaData) => {
  return addDoc(collection(db, 'reservations'), {
    ...reservaData,
    status: 'pending', 
    requestedAt: serverTimestamp(), 
  });
};

// (NUEVA FUNCIÓN)
// Empleado: Crea una solicitud de mantenimiento
export const crearSolicitudMantenimiento = (mantenimientoData) => {
  return addDoc(collection(db, 'maintenanceRequests'), {
    ...mantenimientoData,
    status: 'pending', // Estado inicial
    requestedAt: serverTimestamp(),
  });
};

// Admin: Actualiza el estado de una máquina
export const actualizarEstadoMaquina = (machineId, newStatus) => {
  const machineRef = doc(db, 'machines', machineId); 
  const data = {
    status: newStatus, 
    ...(newStatus === 'available' && { assignedTo: null }) 
  };
  return updateDoc(machineRef, data); 
};

// Admin: Aprueba una reserva
export const aprobarReserva = async (reservaId, machineId, employeeName) => {
  const batch = writeBatch(db); 
  const reservaRef = doc(db, 'reservations', reservaId); 
  batch.update(reservaRef, { status: 'approved' }); 
  
  const machineRef = doc(db, 'machines', machineId); 
  batch.update(machineRef, { status: 'in-use', assignedTo: employeeName }); 
  
  return batch.commit(); 
};

// Admin: Rechaza una reserva
export const rechazarReserva = (reservaId) => {
  const reservaRef = doc(db, 'reservations', reservaId); 
  return updateDoc(reservaRef, { status: 'rejected' }); 
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

// CREATE (MODIFICADO: Sin mantenimiento, con imagen base64)
export const createMachine = (data) => {
  // data debe ser: { name, type, imageUrl }
  return addDoc(collection(db, 'machines'), {
    ...data,
    status: 'available', 
    assignedTo: null,
    lastMaintenance: '', // Se deja vacío para registrarlo luego
    nextMaintenance: '', // Se deja vacío para registrarlo luego
    createdAt: serverTimestamp(),
  });
};

// UPDATE (MODIFICADO: Sin mantenimiento, con imagen base64)
export const updateMachine = (id, data) => {
  // data puede ser: { name, type, imageUrl }
  const machineRef = doc(db, 'machines', id);
  return updateDoc(machineRef, data);
};

// DELETE
export const deleteMachine = (id) => {
  const machineRef = doc(db, 'machines', id);
  return deleteDoc(machineRef);
};

// --- (NUEVO) REGISTRO DE MANTENIMIENTO ---
export const registrarMantenimiento = (id, data) => {
  // data debe ser: { lastMaintenance, nextMaintenance }
  const machineRef = doc(db, 'machines', id);
  return updateDoc(machineRef, data);
}