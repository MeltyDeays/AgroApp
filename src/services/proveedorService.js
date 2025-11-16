

import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';


const proveedoresCollection = collection(db, "proveedores");

/**
 * Registra un nuevo proveedor en Firestore.
 * Basado en la Historia H023 [cite: 83] y el esquema de BD.
 */
export const createProveedor = async (formData) => {
    const { nombreEmpresa, contacto, telefono, email, direccion, productos_suministrados } = formData;

    
    if (!nombreEmpresa || !contacto || !telefono) {
        return { success: false, error: "Nombre de empresa, contacto y teléfono son obligatorios." };
    }

    try {
        
        const newProveedorRef = doc(proveedoresCollection);
        
        
        await setDoc(newProveedorRef, {
            id: newProveedorRef.id, 
            nombreEmpresa: nombreEmpresa,
            contacto: contacto,
            telefono: telefono,
            email: email || '', 
            direccion: direccion || '', 
            productos_suministrados: productos_suministrados || '', 
            fechaCreacion: new Date(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error al registrar proveedor:", error);
        return { success: false, error: 'No se pudo completar el registro del proveedor.' };
    }
};

/**
 * Obtiene todos los proveedores de la colección "proveedores", ordenados por nombre.
 * Basado en la Historia H024[cite: 84].
 */
export const getAllProveedores = async () => {
    try {
        
        const q = query(proveedoresCollection, orderBy("nombreEmpresa", "asc"));
        const querySnapshot = await getDocs(q);

        const proveedoresList = [];
        querySnapshot.forEach((doc) => {
            proveedoresList.push({ id: doc.id, ...doc.data() });
        });
        return proveedoresList;
    } catch (error) {
        console.error("Error al obtener proveedores: ", error);
        throw new Error("No se pudo cargar la lista de proveedores.");
    }
};

/**
 * Actualiza los datos de un proveedor específico en Firestore.
 * Basado en la Historia H025[cite: 85].
 */
export const updateProveedor = async (proveedorId, updatedData) => {
    if (!proveedorId || !updatedData) {
        return { success: false, error: "ID de proveedor y datos son requeridos." };
    }
    try {
        const proveedorDocRef = doc(db, "proveedores", proveedorId);
        
        
        delete updatedData.id;
        delete updatedData.fechaCreacion;

        await updateDoc(proveedorDocRef, updatedData);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar proveedor:", error);
        return { success: false, error: "No se pudo actualizar el proveedor." };
    }
};

/**
 * Elimina el documento de un proveedor de la colección "proveedores".
 * Basado en la Historia H026[cite: 86].
 */
export const deleteProveedor = async (proveedorId) => {
    if (!proveedorId) {
        return { success: false, error: "ID de proveedor es requerido." };
    }
    try {
        const proveedorDocRef = doc(db, "proveedores", proveedorId);
        await deleteDoc(proveedorDocRef);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar proveedor de Firestore:", error);
        return { success: false, error: "No se pudo eliminar el proveedor de la base de datos." };
    }
};