// src/services/usuarioService.js
import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'; 
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp, getApp } from 'firebase/app';
import { db, auth } from '../../firebaseConfig'; 
import { createEmpleado } from './empleadoService'; // <-- IMPORTADO

const usuariosCollection = collection(db, "usuarios");
const proveedoresCollection = collection(db, "proveedores"); 

/**
 * Registra un nuevo usuario en Firebase Auth y crea su documento en Firestore.
 * Crea registros espejo en 'empleados' o 'proveedores' según el rol.
 * El campo 'sector' ahora es 'sectorId' para empleados (y es opcional al crear).
 */
export const registerEmployee = async (formData) => {
    // Sector (viejo campo) se renombra a sectorId y no es obligatorio al registrar
    const { email, password, nombres, apellidos, cedula, edad, rol } = formData; 

    // Validación simple
    if (!email || !password || !nombres || !apellidos || !rol || !cedula || !edad) {
        return { success: false, error: "Faltan datos obligatorios (Nombres, Apellidos, Email, Contraseña, Cédula, Edad, Rol)." };
    }

    try {
        const mainApp = auth.app;
        const config = mainApp.options;
        const secondaryAppName = 'user-creation-instance';
        let secondaryApp;
        try { secondaryApp = getApp(secondaryAppName); }
        catch (error) { secondaryApp = initializeApp(config, secondaryAppName); }
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;
        const userId = user.uid;

        // 1. Guarda la información detallada en Firestore ('usuarios')
        // Ya no guardamos "sector" aquí si es empleado, solo la metadata general.
        await setDoc(doc(db, "usuarios", userId), {
            uid: userId,
            nombres: nombres,
            apellidos: apellidos,
            email: email,
            cedula: cedula,
            edad: edad,
            // sectorId es null por defecto y se asigna en la gestión de empleados/sectores
            sectorId: null, 
            rol: rol,
            role: rol, 
            fechaCreacion: new Date(),
        });

        // 2. Crea documentos espejo específicos por rol
        if (rol === 'proveedor') {
            await setDoc(doc(db, "proveedores", userId), {
                id: userId, 
                nombreEmpresa: nombres, 
                contacto: apellidos,  
                email: email,
                direccion: '', 
                telefono: '', 
                productos_suministrados: '', 
                fechaCreacion: new Date(),
            });
        }
        
        if (rol === 'empleado') {
            // Usa el nuevo servicio de empleados para crear el espejo
            await createEmpleado({ uid: userId, nombres, apellidos, email, cedula, edad, rol });
        }


        return { success: true };
    } catch (error) {
        console.error("Error al registrar usuario:", error.code, error.message);
        let message = 'No se pudo completar el registro.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'Este correo electrónico ya está en uso.';
        } else if (error.code === 'auth/weak-password') {
            message = 'La contraseña debe tener al menos 6 caracteres.';
        }
        return { success: false, error: message };
    }
};

/**
 * Obtiene todos los usuarios de la colección "usuarios", ordenados por nombre.
 */
export const getAllUsers = async () => {
    try {
        const q = query(usuariosCollection, orderBy("nombres", "asc"));
        const querySnapshot = await getDocs(q);

        const usersList = [];
        querySnapshot.forEach((doc) => {
            usersList.push({ id: doc.id, ...doc.data() });
        });
        return usersList;
    } catch (error) {
        console.error("Error al obtener usuarios: ", error);
        throw new Error("No se pudo cargar la lista de usuarios.");
    }
};

/**
 * Actualiza los datos de un usuario específico en Firestore.
 */
export const updateUser = async (userId, updatedData) => {
    if (!userId || !updatedData) {
        return { success: false, error: "ID de usuario y datos son requeridos." };
    }
    try {
        const userDocRef = doc(db, "usuarios", userId);
        
        delete updatedData.email;
        delete updatedData.uid;
        delete updatedData.id;
        delete updatedData.fechaCreacion;
        delete updatedData.sector; // Se elimina el campo antiguo 'sector'

        // Sincroniza 'rol' y 'role'
        if(updatedData.rol) updatedData.role = updatedData.rol;
        if(updatedData.role) updatedData.rol = updatedData.rol;

        await updateDoc(userDocRef, updatedData);
        
        // Si el rol cambia a 'empleado', crea el espejo (si no existe)
        if (updatedData.rol === 'empleado') {
             // Intenta obtener el documento de empleado; si no existe, lo crea.
             const empleadoDoc = await getDoc(doc(db, "empleados", userId));
             if (!empleadoDoc.exists()) {
                 const userData = (await getDoc(userDocRef)).data();
                 await createEmpleado({ uid: userId, ...userData });
             }
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return { success: false, error: "No se pudo actualizar el usuario." };
    }
};

/**
 * Elimina el documento de un usuario de 'usuarios', 'proveedores' y 'empleados' (si existe).
 * NO elimina la cuenta de Firebase Authentication.
 */
export const deleteUser = async (userId) => {
    if (!userId) {
        return { success: false, error: "ID de usuario es requerido." };
    }
    try {
        const userDocRef = doc(db, "usuarios", userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();

            // 1. Borrar el documento de 'usuarios'
            await deleteDoc(userDocRef);

            // 2. Si era proveedor, borramos también el de 'proveedores'
            if (userData && (userData.rol === 'proveedor' || userData.role === 'proveedor')) {
                const proveedorDocRef = doc(db, "proveedores", userId);
                await deleteDoc(proveedorDocRef);
            }
            
            // 3. Si era empleado, borramos el de 'empleados'
            if (userData && (userData.rol === 'empleado' || userData.role === 'empleado')) {
                const empleadoDocRef = doc(db, "empleados", userId);
                const empleadoSnap = await getDoc(empleadoDocRef);
                if (empleadoSnap.exists()) {
                     await deleteDoc(empleadoDocRef);
                }
            }
            
        } else {
            console.warn("Se intentó borrar un usuario que no existe en Firestore:", userId);
        }

        return { success: true };
    } catch (error) {
        console.error("Error al eliminar usuario de Firestore:", error);
        return { success: false, error: "No se pudo eliminar el usuario de la base de datos." };
    }
};