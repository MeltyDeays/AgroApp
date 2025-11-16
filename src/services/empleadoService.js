import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, deleteDoc, where } from 'firebase/firestore'; 
import { db } from '../../firebaseConfig'; 

const empleadosCollection = collection(db, "empleados");
const usuariosCollection = collection(db, "usuarios"); // Necesario para mantener sincronización

/**
 * Registra un nuevo documento en la colección 'empleados'. 
 * Se usa como espejo del registro en 'usuarios' al crear un nuevo empleado.
 */
export const createEmpleado = async (userData) => {
    const { uid, nombres, apellidos, email, cedula, edad, rol } = userData;
    try {
        await setDoc(doc(db, "empleados", uid), {
            uid: uid,
            nombres: nombres,
            apellidos: apellidos,
            email: email,
            cedula: cedula,
            edad: edad,
            rol: rol,
            sectorId: null, // Inicialmente nulo
            fechaCreacion: new Date(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error al registrar empleado espejo:", error);
        return { success: false, error: 'No se pudo crear el registro del empleado.' };
    }
};

/**
 * Obtiene todos los empleados de la colección "empleados", ordenados por nombre.
 */
export const fetchEmpleados = async () => {
    try {
        const q = query(empleadosCollection, orderBy("nombres", "asc"));
        const querySnapshot = await getDocs(q);

        const empleadosList = [];
        querySnapshot.forEach((doc) => {
            empleadosList.push({ ...doc.data() });
        });
        return empleadosList;
    } catch (error) {
        console.error("Error al obtener empleados: ", error);
        throw new Error("No se pudo cargar la lista de empleados.");
    }
};

/**
 * Actualiza el sectorId y otros datos editables de un empleado.
 */
export const updateEmpleado = async (uid, updatedData) => {
    if (!uid || !updatedData) {
        throw new Error("UID de empleado y datos son requeridos.");
    }
    try {
        // 1. Actualizar la colección 'empleados' (principal)
        const empleadoDocRef = doc(db, "empleados", uid);
        await updateDoc(empleadoDocRef, updatedData);
        
        // 2. Sincronizar sectorId en la colección 'usuarios' (mantener integridad)
        const userDocRef = doc(db, "usuarios", uid);
        await updateDoc(userDocRef, {
            sectorId: updatedData.sectorId || null // Aseguramos que se sincronice el campo
        });

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        throw new Error("No se pudo actualizar el empleado.");
    }
};

/**
 * Elimina el documento de un empleado de la colección "empleados".
 * No elimina la cuenta de Auth ni el documento principal en 'usuarios'.
 */
export const deleteEmpleado = async (uid) => {
    if (!uid) {
        return { success: false, error: "UID de empleado es requerido." };
    }
    try {
        const empleadoDocRef = doc(db, "empleados", uid);
        await deleteDoc(empleadoDocRef);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar empleado de Firestore:", error);
        return { success: false, error: "No se pudo eliminar el empleado de la base de datos." };
    }
};

// Función de utilidad para obtener un solo empleado por UID
export const getEmpleadoByUid = async (uid) => {
    try {
        const docRef = doc(db, "empleados", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error al obtener empleado:", error);
        return null;
    }
};