import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';

const pedidosClienteCollection = collection(db, "pedidosCliente");

/**
 * Crea un nuevo pedido de un cliente (socio) en Firestore.
 */
export const createPedidoCliente = async (userId, userName, cartItems, total, paymentMethod, paymentDetails) => {
  try {
    const newPedidoRef = doc(pedidosClienteCollection); // Genera ID automático
    
    await setDoc(newPedidoRef, {
      id: newPedidoRef.id,
      socioId: userId,
      socioNombre: userName,
      items: cartItems, // Array de objetos de producto del carrito
      totalPedido: total,
      metodoPago: paymentMethod, // "Tarjeta" o "Físico"
      paymentDetails: paymentDetails || null, // Ej: { last4: '1234' } o null
      estado: 'Pendiente', // Pendiente de aprobación por el Admin
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