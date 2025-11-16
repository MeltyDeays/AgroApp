
import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const comprasCollection = collection(db, "compras");

/**
 * Registra una nueva solicitud de compra en Firestore.
 * Basado en H027 y tu nueva solicitud.
 */
export const createCompra = async (formData) => {
    
    
    const { proveedorId, proveedorNombre, items, fecha_entrega_deseada, deposito_area, solicitanteEmail } = formData;

    
    if (!proveedorId || !items || !solicitanteEmail) {
        return { success: false, error: "Proveedor, Items y Solicitante son obligatorios." };
    }
    

    try {
        const newCompraRef = doc(comprasCollection);
        
        await setDoc(newCompraRef, {
            id: newCompraRef.id,
            proveedorId: proveedorId,
            proveedorNombre: proveedorNombre, 
            items: items,
            
            fecha_entrega_deseada: fecha_entrega_deseada || '',
            deposito_area: deposito_area || '',
            solicitanteEmail: solicitanteEmail, 
            fecha_solicitud: Timestamp.now(), 
            estado: 'Pendiente' 
        });

        return { success: true };
    } catch (error) {
        console.error("Error al registrar compra:", error);
        return { success: false, error: 'No se pudo registrar la solicitud de compra.' };
    }
};

/**
 * Obtiene todas las solicitudes de compra, ordenadas por fecha.
 * (Sin cambios)
 */
export const getAllCompras = async () => {
    try {
        const q = query(comprasCollection, orderBy("fecha_solicitud", "desc"));
        const querySnapshot = await getDocs(q);

        const comprasList = [];
        querySnapshot.forEach((doc) => {
            comprasList.push({ id: doc.id, ...doc.data() });
        });
        return comprasList;
    } catch (error) {
        console.error("Error al obtener compras: ", error);
        throw new Error("No se pudo cargar la lista de compras.");
    }
};

/**
 * Actualiza el estado de una compra (Pendiente, Recibido, Cancelado).
 * (Sin cambios)
 */
export const updateCompraStatus = async (compraId, estado) => {
    if (!compraId || !estado) {
        return { success: false, error: "ID de compra y estado son requeridos." };
    }
    try {
        const compraDocRef = doc(db, "compras", compraId);
        await updateDoc(compraDocRef, {
            estado: estado
        });
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        return { success: false, error: "No se pudo actualizar el estado." };
    }
};

/**
 * Elimina una solicitud de compra de Firestore.
 * (Sin cambios)
 */
export const deleteCompra = async (compraId) => {
    if (!compraId) {
        return { success: false, error: "ID de compra es requerido." };
    }
    try {
        const compraDocRef = doc(db, "compras", compraId);
        await deleteDoc(compraDocRef);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar compra:", error);
        return { success: false, error: "No se pudo eliminar la solicitud." };
    }
};