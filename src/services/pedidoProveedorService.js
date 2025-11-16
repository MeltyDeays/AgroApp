
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  Timestamp, 
  addDoc
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const pedidosCollection = collection(db, "pedidosProveedor");

/**
 * (Para el Proveedor) Escucha en tiempo real los pedidos PENDIENTES.
 */
export const streamPedidosPendientes = (providerId, callback) => {
  const q = query(
    pedidosCollection,
    where("idProveedor", "==", providerId),
    where("estado", "==", "En espera"),
    orderBy("fechaRequerida", "asc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({ id: doc.id, ...doc.data() });
    });
    callback(pedidos);
  }, (error) => {
    console.error("Error al obtener pedidos pendientes: ", error);
    callback([]);
  });

  return unsubscribe; 
};

/**
 * (Para el Proveedor) Actualiza el estado de un pedido (Aceptar o Rechazar).
 */
export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
  if (!pedidoId || !nuevoEstado) {
    return { success: false, error: "ID de pedido y estado son requeridos." };
  }
  try {
    const pedidoDocRef = doc(db, "pedidosProveedor", pedidoId);
    
    await updateDoc(pedidoDocRef, {
      estado: nuevoEstado,
      adminNotificado: false 
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return { success: false, error: "No se pudo actualizar el pedido." };
  }
};

/**
 * (Para el Admin) Crea una nueva solicitud de pedido a un proveedor.
 * MODIFICADO: Acepta todos los campos del formulario.
 */
export const crearPedidoProveedor = async (pedidoData) => {
    try {
        const docRef = await addDoc(pedidosCollection, {
            
            idAdmin: pedidoData.idAdmin,
            nombreAdmin: pedidoData.nombreAdmin,
            idProveedor: pedidoData.idProveedor,
            nombreProveedor: pedidoData.nombreProveedor, 
            nombreProducto: pedidoData.nombreProducto,
            cantidad: pedidoData.cantidad,
            unidad: pedidoData.unidad,
            items: pedidoData.items, 
            deposito_area: pedidoData.deposito_area, 
            fechaRequerida: pedidoData.fechaRequerida,
            
            estado: 'En espera',
            adminNotificado: true, 
            fechaCreacion: Timestamp.now(),
        });
        
        await updateDoc(docRef, { id: docRef.id });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al crear pedido:", error);
        return { success: false, error: 'No se pudo crear el pedido.' };
    }
};

/**
 * (Para el Admin) Escucha en tiempo real TODOS los pedidos que ÉL ha creado.
 */
export const streamPedidosAdmin = (adminId, callback) => {
    if (!adminId) return () => {}; 
    const q = query(
      pedidosCollection,
      where("idAdmin", "==", adminId),
      orderBy("fechaCreacion", "desc")
    );
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pedidos = [];
      querySnapshot.forEach((doc) => {
        pedidos.push({ id: doc.id, ...doc.data() });
      });
      callback(pedidos);
    }, (error) => {
      console.error("Error al obtener pedidos de admin: ", error);
      callback([]);
    });
  
    return unsubscribe; 
  };

/**
 * (Para el Admin) Escucha las respuestas de los proveedores para la campana.
 */
export const streamRespuestasProveedor = (adminId, callback) => {
  if (!adminId) return () => {};
  const q = query(
    pedidosCollection,
    where("idAdmin", "==", adminId),
    where("adminNotificado", "==", false),
    where("estado", "!=", "En espera") 
  );

  return onSnapshot(q, (querySnapshot) => {
    const notificaciones = [];
    querySnapshot.forEach((doc) => {
      notificaciones.push({ 
        id: doc.id, 
        ...doc.data(), 
        notificationType: 'pedidoRespuesta' 
      });
    });
    callback(notificaciones);
  }, (error) => {
    console.error("Error al obtener notificaciones de pedidos: ", error);
    callback([]);
  });
};

/**
 * (Para el Admin) Marca una respuesta de pedido como "leída" (vista).
 */
export const marcarRespuestaPedidoLeida = (pedidoId) => {
  const pedidoDocRef = doc(db, "pedidosProveedor", pedidoId);
  return updateDoc(pedidoDocRef, {
    adminNotificado: true
  });
};

/**
 * (Para el Admin) Marca un pedido como "Recibido".
 */
export const marcarPedidoRecibido = (pedidoId) => {
  const pedidoDocRef = doc(db, "pedidosProveedor", pedidoId);
  return updateDoc(pedidoDocRef, {
    estado: 'Recibido',
    adminNotificado: true 
  });
};