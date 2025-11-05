import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // updateDoc y deleteDoc son necesarios
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp, getApp } from 'firebase/app';
import { db, auth } from '../../firebaseConfig'; // 'auth' es nuestra instancia PRINCIPAL

const usuariosCollection = collection(db, "usuarios");

/**
 * Registra un nuevo empleado en Firebase Auth y crea su documento en Firestore.
 * Usa una instancia secundaria de Auth para no cambiar el estado de sesión del admin.
 */
export const registerEmployee = async (formData) => {
    const { email, password, nombres, apellidos, cedula, edad, sector, rol } = formData;

    // Validación simple
    if (!email || !password || !nombres || !apellidos || !rol || !cedula || !edad || !sector) {
        return { success: false, error: "Todos los campos son obligatorios." };
    }

    try {
        // Usa instancia secundaria para crear el usuario sin iniciar sesión
        const mainApp = auth.app;
        const config = mainApp.options;
        const secondaryAppName = 'user-creation-instance';
        let secondaryApp;
        try { secondaryApp = getApp(secondaryAppName); }
        catch (error) { secondaryApp = initializeApp(config, secondaryAppName); }
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        // Guarda la información detallada en Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            uid: user.uid,
            nombres: nombres,
            apellidos: apellidos,
            email: email,
            cedula: cedula,
            edad: edad,
            sector: sector,
            rol: rol,
            role: rol, // Mantenemos ambos por compatibilidad
            fechaCreacion: new Date(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error al registrar empleado:", error.code, error.message);
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
            // Incluye el ID del documento (UID) en los datos
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
        // Previene la actualización de campos sensibles/inmutables
        delete updatedData.email;
        delete updatedData.uid;
        delete updatedData.id;
        delete updatedData.fechaCreacion;

        // Mantiene 'rol' y 'role' sincronizados si uno cambia
        if(updatedData.rol) updatedData.role = updatedData.rol;
        if(updatedData.role) updatedData.rol = updatedData.role;


        await updateDoc(userDocRef, updatedData);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return { success: false, error: "No se pudo actualizar el usuario." };
    }
};

/**
 * Elimina el documento de un usuario de la colección "usuarios" en Firestore.
 * NO elimina la cuenta de Firebase Authentication.
 */
export const deleteUser = async (userId) => {
    if (!userId) {
        return { success: false, error: "ID de usuario es requerido." };
    }
    try {
        const userDocRef = doc(db, "usuarios", userId);
        await deleteDoc(userDocRef);
        // ¡Importante! La cuenta de Authentication sigue existiendo.
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar usuario de Firestore:", error);
        return { success: false, error: "No se pudo eliminar el usuario de la base de datos." };
    }
};