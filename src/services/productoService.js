import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';

const productosCollection = collection(db, "productos");

/**
 * Escucha en tiempo real todos los productos, ordenados por nombre.
 */
export const streamProductos = (callback) => {
  const q = query(productosCollection, orderBy("nombre", "asc"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const productos = [];
    querySnapshot.forEach((doc) => {
      productos.push({ id: doc.id, ...doc.data() });
    });
    callback(productos);
  }, (error) => {
    console.error("Error al obtener productos: ", error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * Crea un nuevo producto en Firestore.
 */
export const createProducto = async (data) => {
  
  const { nombre, imageUrl, precio, cantidadVenta, unidadVenta, almacenId } = data;
  try {
    const newProductoRef = doc(productosCollection); 
    
    await setDoc(newProductoRef, {
      id: newProductoRef.id,
      nombre: nombre,
      imageUrl: imageUrl || null,
      precio: parseFloat(precio) || 0,
      cantidadVenta: parseFloat(cantidadVenta) || 0, 
      unidadVenta: unidadVenta, 
      almacenId: almacenId, 
      fechaCreacion: Timestamp.now(),
    });
  
    return { success: true };
  } catch (error) {
    console.error("Error al crear producto:", error);
    return { success: false, error: 'No se pudo crear el producto.' };
  }
};

/**
 * Actualiza los datos de un producto.
 */
export const updateProducto = async (productoId, dataToUpdate) => {
  try {
    const productoDocRef = doc(db, "productos", productoId);
    await updateDoc(productoDocRef, dataToUpdate);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return { success: false, error: "No se pudo actualizar el producto." };
  }
};

/**
 * Elimina un producto de Firestore.
 */
export const deleteProducto = async (productoId) => {
  try {
    const productoDocRef = doc(db, "productos", productoId);
    await deleteDoc(productoDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return { success: false, error: "No se pudo eliminar el producto." };
  }
};