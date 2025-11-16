// src/services/mapaService.js
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
  orderBy 
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
  
  // Asegurarse que el polígono esté cerrado
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
      coordsMapa: coordsMapa 
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
    // Convertir strings de fecha (YYYY-MM-DD) a Timestamps
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