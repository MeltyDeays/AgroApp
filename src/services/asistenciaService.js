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

import { db } from "../../firebaseConfig"; 

const asistenciaCollection = collection(db, "asistencia");

const usuariosCollection = collection(db, "usuarios");


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




export const obtenerRegistrosAsistencia = async () => {
  try {
    
    const usuariosSnapshot = await getDocs(usuariosCollection);
    const userMap = {};
    usuariosSnapshot.forEach((doc) => {
      const userData = doc.data();
      
      userMap[userData.uid] = `${userData.nombres || ''} ${userData.apellidos || ''}`.trim();
    });

    
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

    
    const registrosCombinados = asistenciaSnapshot.docs.map((doc) => {
      const asistenciaData = doc.data();
      const empleadoId = asistenciaData.id_empleado;
      
      const nombreEmpleado = userMap[empleadoId] || empleadoId; 
      
      return { 
        id: doc.id, 
        ...asistenciaData, 
        nombreEmpleado: nombreEmpleado 
      };
    });

    return registrosCombinados;

  } catch (error) {
      console.error("Error al obtener registros de asistencia:", error);
      throw new Error("No se pudo cargar la lista de asistencia."); 
  }
};