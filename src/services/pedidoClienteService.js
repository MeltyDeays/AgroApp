import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  orderBy,
  Timestamp,
  where,
  runTransaction
} from 'firebase/firestore';

import { convertirAKilos } from './almacenService';
import { streamProductos } from './productoService'; 

const pedidosClienteCollection = collection(db, "pedidosCliente");

/**
 * Crea un nuevo pedido de un cliente (socio) en Firestore.
 */
// --- (INICIO DE MODIFICACIÓN) ---
export const createPedidoCliente = async (userId, userName, cartItems, total, paymentMethod, paymentDetails, direccion) => {
// --- (FIN DE MODIFICACIÓN) ---
  try {
    const newPedidoRef = doc(pedidosClienteCollection); // Genera ID automático
    
    await setDoc(newPedidoRef, {
      id: newPedidoRef.id,
      socioId: userId,
      socioNombre: userName,
      items: cartItems, 
      totalPedido: total,
      metodoPago: paymentMethod, 
      paymentDetails: paymentDetails || null, 
      // --- (INICIO DE MODIFICACIÓN) ---
      direccionEntrega: direccion, // <-- NUEVO
      // --- (FIN DE MODIFICACIÓN) ---
      estado: 'Pendiente', 
      fechaPedido: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error al crear pedido de cliente:", error);
    return { success: false, error: 'No se pudo registrar el pedido.' };
  }
};

/**
 * Escucha en tiempo real los pedidos de UN socio específico.
 */
export const streamPedidosCliente = (userId, callback) => {
  if (!userId) return () => {};

  const q = query(
    pedidosClienteCollection,
    where("socioId", "==", userId),
    orderBy("fechaPedido", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({ id: doc.id, ...doc.data() });
    });
    callback(pedidos);
  }, (error) => {
    console.error("Error al obtener pedidos de cliente: ", error);
    callback([]);
  });

  return unsubscribe;
};

// --- (NUEVAS FUNCIONES DE ADMIN) ---

/**
 * (Para Admin) Escucha todos los pedidos.
 */
export const streamPedidosAdmin = (callback) => {
  const q = query(
    pedidosClienteCollection,
    orderBy("fechaPedido", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({ id: doc.id, ...doc.data() });
    });
    callback(pedidos);
  }, (error) => {
    console.error("Error al obtener todos los pedidos (admin): ", error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * (Para Admin - Notificaciones) Escucha solo pedidos pendientes.
 */
export const streamPedidosPendientesAdmin = (callback) => {
  const q = query(
    pedidosClienteCollection,
    where("estado", "==", "Pendiente"),
    orderBy("fechaPedido", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({ 
        id: doc.id, 
        ...doc.data(), 
        notificationType: 'pedidoCliente' // Tipo para la campana
      });
    });
    callback(pedidos);
  }, (error) => {
    console.error("Error al obtener pedidos pendientes (admin): ", error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * (Para Admin) Rechaza un pedido.
 */
export const rechazarPedido = async (pedidoId, motivo) => {
  try {
    const pedidoRef = doc(db, "pedidosCliente", pedidoId);
    await updateDoc(pedidoRef, {
      estado: 'Rechazado',
      motivoRechazo: motivo || 'N/A'
    });
    return { success: true };
  } catch (error) {
    console.error("Error al rechazar pedido:", error);
    return { success: false, error: "No se pudo actualizar el pedido." };
  }
};

/**
 * (Para Admin) Aprueba un pedido y descuenta el stock del almacén.
 */
export const aprobarPedido = async (pedido, almacenes, productos) => {
  
  const stockUpdates = new Map(); 

  for (const item of pedido.items) {
    const productoInfo = productos.find(p => p.id === item.id);
    if (!productoInfo) {
      throw new Error(`El producto "${item.nombre}" ya no existe en el catálogo. No se puede aprobar.`);
    }

    const cantidadEnKilos = convertirAKilos(
      productoInfo.cantidadVenta * item.cantidad, 
      productoInfo.unidadVenta 
    );

    const almacenId = productoInfo.almacenId;
    if (!almacenId) {
      throw new Error(`El producto "${item.nombre}" no tiene un almacén de origen asignado.`);
    }

    const currentDebit = stockUpdates.get(almacenId) || 0;
    stockUpdates.set(almacenId, currentDebit + cantidadEnKilos);
  }

  try {
    await runTransaction(db, async (transaction) => {
      const almacenDocs = new Map();
      
      for (const almacenId of stockUpdates.keys()) {
        const almacenRef = doc(db, "almacenes", almacenId);
        const almacenDoc = await transaction.get(almacenRef);
        if (!almacenDoc.exists()) {
          throw new Error(`El almacén con ID ${almacenId} no existe.`);
        }
        almacenDocs.set(almacenId, almacenDoc);
      }

      for (const [almacenId, cantidadARestar] of stockUpdates.entries()) {
        const almacenDoc = almacenDocs.get(almacenId);
        const almacenData = almacenDoc.data();
        
        const nuevaCantidad = (almacenData.cantidadActual || 0) - cantidadARestar;

        if (nuevaCantidad < 0) {
          throw new Error(
            `Stock insuficiente para "${almacenData.materiaPrima}" en el almacén "${almacenData.nombre}". \nNecesita: ${cantidadARestar.toFixed(0)} kg. \nDisponible: ${almacenData.cantidadActual.toFixed(0)} kg.`
          );
        }

        transaction.update(almacenDoc.ref, { cantidadActual: nuevaCantidad });
      }

      const pedidoRef = doc(db, "pedidosCliente", pedido.id);
      transaction.update(pedidoRef, { estado: 'Aprobado' });
    });

    return { success: true };
  } catch (error) {
    console.error("Error en la transacción de aprobación:", error);
    throw error; 
  }
};