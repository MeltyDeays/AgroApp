import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
// --- AÑADIDO: Importar 'doc' para la búsqueda de usuarios ---
import { db } from "../../firebaseConfig"; // Asegúrate que db se exporta correctamente

const asistenciaCollection = collection(db, "asistencia");
// --- AÑADIDO: Referencia a la colección de usuarios ---
const usuariosCollection = collection(db, "usuarios");

// registrarEntradaSalida (sin cambios)
export const registrarEntradaSalida = async (codigoEmpleado, esEntrada) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const q = query(
    asistenciaCollection,
    where("id_empleado", "==", codigoEmpleado),
    where("fecha", ">=", hoy),
    where("fecha", "<", manana)
  );

  const querySnapshot = await getDocs(q);
  const ahora = new Date();
  const horaActual = ahora.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (querySnapshot.empty) {
    if (esEntrada) {
      await addDoc(asistenciaCollection, {
        id_empleado: codigoEmpleado,
        fecha: Timestamp.fromDate(ahora),
        entrada: horaActual,
        salida: null,
        estado: "Presente",
      });
      return { success: true, message: "Entrada registrada con éxito." };
    } else {
      return { success: false, message: "Debe registrar una entrada primero." };
    }
  } else {
    const registro = querySnapshot.docs[0];
    if (esEntrada) {
      return { success: false, message: "Ya se registró una entrada hoy." };
    } else {
      if (registro.data().salida) {
        return { success: false, message: "Ya se registró una salida hoy." };
      }
      await updateDoc(registro.ref, { salida: horaActual, estado: "Completado" });
      return { success: true, message: "Salida registrada con éxito." };
    }
  }
};

// obtenerHistorialEmpleado (sin cambios)
export const obtenerHistorialEmpleado = async (idEmpleado, fechaInicio, fechaFin) => {
  const q = query(
    asistenciaCollection,
    where("id_empleado", "==", idEmpleado),
    where("fecha", ">=", fechaInicio),
    where("fecha", "<=", fechaFin),
    orderBy("fecha", "desc") 
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};


// --- FUNCIÓN ACTUALIZADA ---
// Ahora cruza datos con la colección 'usuarios'
export const obtenerRegistrosAsistencia = async () => {
  try {
    // 1. Obtener todos los usuarios y crear un mapa UID -> Nombre
    const usuariosSnapshot = await getDocs(usuariosCollection);
    const userMap = {};
    usuariosSnapshot.forEach((doc) => {
      const userData = doc.data();
      // Usamos UID como clave y combinamos nombres y apellidos
      userMap[userData.uid] = `${userData.nombres || ''} ${userData.apellidos || ''}`.trim();
    });

    // 2. Obtener los registros de asistencia de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const q = query(
      asistenciaCollection,
      where("fecha", ">=", hoy),
      where("fecha", "<", manana),
      orderBy("fecha", "desc")
    );

    const asistenciaSnapshot = await getDocs(q);

    // 3. Combinar los datos
    const registrosCombinados = asistenciaSnapshot.docs.map((doc) => {
      const asistenciaData = doc.data();
      const empleadoId = asistenciaData.id_empleado;
      // Busca el nombre en el mapa, si no existe, usa el ID
      const nombreEmpleado = userMap[empleadoId] || empleadoId; 
      
      return { 
        id: doc.id, 
        ...asistenciaData, 
        nombreEmpleado: nombreEmpleado // <-- Nuevo campo añadido
      };
    });

    return registrosCombinados;

  } catch (error) {
      console.error("Error al obtener registros de asistencia:", error);
      throw new Error("No se pudo cargar la lista de asistencia."); // Lanza error para manejo en UI
  }
};