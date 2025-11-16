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
  Timestamp,
  writeBatch
} from 'firebase/firestore';

const almacenesCollection = collection(db, "almacenes");

/**
 * Helper para convertir diferentes unidades a Kilos (kg).
 * Asumimos: 1 Libra = 0.453592 kg, 1 Tonelada = 1000 kg.
 */
export const convertirAKilos = (cantidad, unidad) => {
  const valor = parseFloat(cantidad) || 0;
  switch (unidad) {
    case 'libras':
      return valor * 0.453592;
    case 'toneladas':
      return valor * 1000;
    case 'kilos':
    default:
      return valor;
  }
};

/**
 * Escucha en tiempo real todos los almacenes, ordenados por nombre.
 */
export const streamAlmacenes = (callback) => {
  const q = query(almacenesCollection, orderBy("nombre", "asc"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const almacenes = [];
    querySnapshot.forEach((doc) => {
      almacenes.push({ id: doc.id, ...doc.data() });
    });
    callback(almacenes);
  }, (error) => {
    console.error("Error al obtener almacenes: ", error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * Crea un nuevo almacén en Firestore.
 */
export const createAlmacen = async (data) => {
  const { nombre, materiaPrima, capacidadMaxima } = data;
  try {
    const newAlmacenRef = doc(almacenesCollection); 
    
    await setDoc(newAlmacenRef, {
      id: newAlmacenRef.id,
      nombre: nombre,
      materiaPrima: materiaPrima,
      capacidadMaxima: parseFloat(capacidadMaxima) || 0,
      cantidadActual: 0, 
      fechaCreacion: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error al crear almacén:", error);
    return { success: false, error: 'No se pudo crear el almacén.' };
  }
};

/**
 * Actualiza los datos de un almacén (detalles o cantidad).
 */
export const updateAlmacen = async (almacenId, dataToUpdate) => {
  try {
    const almacenDocRef = doc(db, "almacenes", almacenId);
    await updateDoc(almacenDocRef, dataToUpdate);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar almacén:", error);
    return { success: false, error: "No se pudo actualizar el almacén." };
  }
};

/**
 * Elimina un almacén de Firestore.
 */
export const deleteAlmacen = async (almacenId) => {
  try {
    const almacenDocRef = doc(db, "almacenes", almacenId);
    await deleteDoc(almacenDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar almacén:", error);
    return { success: false, error: "No se pudo eliminar el almacén." };
  }
};