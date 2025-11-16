
import { db } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  setDoc, 
  Timestamp,
  deleteDoc, 
  orderBy,
  writeBatch, 
  onSnapshot 
} from 'firebase/firestore';

/**
 * Parsea un string de coordenadas (lng, lat) a un array de objetos.
 */
const parseCoordenadasString = (coordsString) => {
  const coordsMapa = [];
  const lineas = coordsString.split('\n'); 
  for (const linea of lineas) {
    const pares = linea.split(','); 
    if (pares.length === 2) {
      const lng = parseFloat(pares[0].trim());
      const lat = parseFloat(pares[1].trim());
      if (!isNaN(lng) && !isNaN(lat)) {
        coordsMapa.push({ longitude: lng, latitude: lat });
      }
    }
  }
  
  
  if (coordsMapa.length > 0) {
    const primero = coordsMapa[0];
    const ultimo = coordsMapa[coordsMapa.length - 1];
    if (coordsMapa.length > 1 && (primero.longitude !== ultimo.longitude || primero.latitude !== ultimo.latitude)) {
      coordsMapa.push(primero);
    }
  }
  return coordsMapa;
};

/**
 * (¡NUEVO!) Crea un nuevo sector en Firestore desde el formulario.
 */
export const crearSector = async (id, nombre, color, coordsString) => {
  try {
    const coordsMapa = parseCoordenadasString(coordsString);

    if (coordsMapa.length < 4) { 
      throw new Error("Se necesitan al menos 3 pares de coordenadas (lng, lat) para formar un polígono.");
    }
    
    const sectorRef = doc(db, "sectores", id);
    await setDoc(sectorRef, {
      id: id,
      nombre: nombre,
      color: color,
      coordsMapa: coordsMapa,
      supervisorId: null, 
      supervisorNombre: null, 
    });

    return { success: true };
  } catch (error) {
    console.error("Error al crear sector: ", error);
    throw new Error(error.message || "No se pudo crear el sector.");
  }
};

/**
 * Actualiza el nombre y color de un sector.
 */
export const updateSectorDetails = async (sectorId, nombre, color) => {
  try {
    const sectorRef = doc(db, "sectores", sectorId);
    await updateDoc(sectorRef, {
      nombre: nombre,
      color: color,
    });
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar detalles del sector: ", error);
    throw new Error(error.message || "No se pudo actualizar el sector.");
  }
};

/**
 * Elimina un sector.
 */
export const deleteSector = async (sectorId) => {
  try {
    
    await deleteDoc(doc(db, "sectores", sectorId));
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar sector: ", error);
    throw new Error(error.message || "No se pudo eliminar el sector.");
  }
};


/**
 * Obtiene todos los documentos de la colección 'sectores'.
 */
export const fetchSectores = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "sectores"));
    const sectoresData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });
    return sectoresData;
  } catch (error) {
    console.error("Error al cargar sectores: ", error);
    throw new Error("No se pudieron cargar los sectores.");
  }
};

/**
 * Actualiza la forma de un polígono (sus coordenadas) en Firestore.
 */
export const updateSectorCoordenadas = async (sectorId, nuevasCoordenadas) => {
  try {
    const sectorRef = doc(db, "sectores", sectorId);
    
    if (nuevasCoordenadas.length > 0) {
        const primero = nuevasCoordenadas[0];
        const ultimo = nuevasCoordenadas[nuevasCoordenadas.length - 1];
        if (nuevasCoordenadas.length > 1 && (primero.longitude !== ultimo.longitude || primero.latitude !== ultimo.latitude)) {
            nuevasCoordenadas.push(primero);
        }
    }

    await updateDoc(sectorRef, {
      coordsMapa: nuevasCoordenadas 
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar coordenadas del sector: ", error);
    throw new Error("No se pudo guardar el sector.");
  }
};

/**
 * Busca todos los usuarios (empleados) que pertenecen a un sectorId específico.
 */
export const getEmpleadosPorSector = async (sectorId) => {
  try {
    const q = query(
      collection(db, "usuarios"), 
      where("sectorId", "==", sectorId), 
      where("rol", "==", "empleado")
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error al obtener empleados por sector: ", error);
    throw new Error("No se pudieron cargar los empleados.");
  }
};

/**
 * Crea un nuevo documento en la colección 'tareas'.
 * (MODIFICADO: Acepta fechas de inicio y fin)
 */
export const crearTarea = async (titulo, detalles, sectorId, fechaInicio, fechaFin) => {
  try {
    
    const inicioTimestamp = fechaInicio ? Timestamp.fromDate(new Date(fechaInicio)) : null;
    const finTimestamp = fechaFin ? Timestamp.fromDate(new Date(fechaFin)) : null;
    
    await addDoc(collection(db, "tareas"), {
      sectorId: sectorId,
      titulo: titulo,
      detalles: detalles,
      fechaCreacion: Timestamp.now(),
      fechaInicio: inicioTimestamp, 
      fechaFin: finTimestamp,     
      estado: "pendiente"
    });
    return { success: true };
  } catch (error) {
    console.error("Error al crear la tarea: ", error);
    throw new Error("No se pudo crear la tarea.");
  }
};

/**
 * Obtiene todas las tareas, ordenadas por fecha de inicio.
 */
export const fetchTareas = async () => {
  try {
    const q = query(
      collection(db, "tareas"),
      orderBy("fechaInicio", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al cargar tareas: ", error);
    throw new Error("No se pudieron cargar las tareas. Revisa los permisos de Firestore.");
  }
};


/**
 * Marca una tarea como completada.
 */
export const marcarTareaCompletada = async (tareaId) => {
  try {
    const tareaRef = doc(db, "tareas", tareaId);
    await updateDoc(tareaRef, {
      estado: "completada",
      fechaCompletada: Timestamp.now(), 
    });
    return { success: true };
  } catch (error) {
    console.error("Error al marcar tarea como completada: ", error);
    throw new Error("No se pudo completar la tarea.");
  }
};




/**
 * Crea una solicitud para designar a un empleado como supervisor de un sector.
 */
export const designarSupervisor = async (sector, empleado, adminId) => {
  try {
    
    const qPendiente = query(
      collection(db, "supervisorRequests"),
      where("empleadoId", "==", empleado.uid),
      where("sectorId", "==", sector.id),
      where("estado", "==", "pendiente")
    );
    const FgPendiente = await getDocs(qPendiente);
    if (!FgPendiente.empty) {
      throw new Error("Ya existe una solicitud pendiente para este empleado en este sector.");
    }
    
    
    if (sector.supervisorId) {
       throw new Error(`El sector "${sector.nombre}" ya tiene a ${sector.supervisorNombre} como supervisor.`);
    }

    
    await addDoc(collection(db, "supervisorRequests"), {
      adminId: adminId,
      empleadoId: empleado.uid,
      empleadoNombre: `${empleado.nombres} ${empleado.apellidos}`,
      sectorId: sector.id,
      sectorNombre: sector.nombre,
      estado: "pendiente",
      fechaCreacion: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error al designar supervisor: ", error);
    throw new Error(error.message || "No se pudo enviar la solicitud.");
  }
};

/**
 * (Para Empleado) Escucha las solicitudes de supervisor pendientes.
 */
export const streamSupervisorRequests = (empleadoId, callback) => {
  if (!empleadoId) return () => {};

  const q = query(
    collection(db, "supervisorRequests"),
    where("empleadoId", "==", empleadoId),
    where("estado", "==", "pendiente"),
    orderBy("fechaCreacion", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const solicitudes = [];
    querySnapshot.forEach((doc) => {
      solicitudes.push({ 
        id: doc.id, 
        ...doc.data(), 
        notificationType: 'supervisorRequest' 
      });
    });
    callback(solicitudes);
  }, (error) => {
    console.error("Error al obtener solicitudes de supervisor: ", error);
    callback([]);
  });
};

/**
 * (Para Empleado) Responde a una solicitud de supervisor (Aceptar o Rechazar).
 */
export const responderSolicitudSupervisor = async (solicitud, aceptar) => {
  const batch = writeBatch(db);
  
  try {
    
    const requestRef = doc(db, "supervisorRequests", solicitud.id);
    
    if (aceptar) {
      
      
      
      const sectorRef = doc(db, "sectores", solicitud.sectorId);
      batch.update(sectorRef, {
        supervisorId: solicitud.empleadoId,
        supervisorNombre: solicitud.empleadoNombre
      });
      
      
      const empleadoRef = doc(db, "empleados", solicitud.empleadoId);
      batch.update(empleadoRef, {
        esSupervisorDe: solicitud.sectorId
      });

      
      const usuarioRef = doc(db, "usuarios", solicitud.empleadoId);
      batch.update(usuarioRef, {
        esSupervisorDe: solicitud.sectorId
      });
      
      
      batch.update(requestRef, {
        estado: "aceptada"
      });
      
    } else {
      
      
      batch.update(requestRef, {
        estado: "rechazada"
      });
    }
    
    
    await batch.commit();
    return { success: true };
    
  } catch (error) {
    console.error("Error al responder solicitud: ", error);
    throw new Error(error.message || "No se pudo responder a la solicitud.");
  }
};
