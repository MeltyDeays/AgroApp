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
  setDoc, // <-- AÑADIDO
  Timestamp,
} from 'firebase/firestore';

/**
 * Parsea un string de coordenadas (lng, lat) a un array de objetos.
 * INPUT: "-85.370, 12.170\n-85.365, 12.170\n-85.365, 12.165"
 * OUTPUT: [ { longitude: -85.370, latitude: 12.170 }, ... ]
 */
const parseCoordenadasString = (coordsString) => {
  const coordsMapa = [];
  const lineas = coordsString.split('\n'); // Separa por saltos de línea
  for (const linea of lineas) {
    const pares = linea.split(','); // Separa "lng, lat"
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
    if (primero.longitude !== ultimo.longitude || primero.latitude !== ultimo.latitude) {
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
    // Parsea el string del formulario al formato de array de objetos
    const coordsMapa = parseCoordenadasString(coordsString);

    if (coordsMapa.length < 4) { // 3 puntos + cierre
      throw new Error("Se necesitan al menos 3 pares de coordenadas (lng, lat) para formar un polígono.");
    }
    
    // Usamos setDoc para poner un ID personalizado (ej: 'sector_a')
    const sectorRef = doc(db, "sectores", id);
    await setDoc(sectorRef, {
      id: id,
      nombre: nombre,
      color: color,
      coordsMapa: coordsMapa // <-- Guarda el formato simple
    });

    return { success: true };
  } catch (error) {
    console.error("Error al crear sector: ", error);
    throw new Error(error.message || "No se pudo crear el sector.");
  }
};


/**
 * Obtiene todos los documentos de la colección 'sectores'.
 * (MODIFICADO: Ya no necesita convertir coordenadas)
 */
export const fetchSectores = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "sectores"));
    const sectoresData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // 'coordsMapa' ya está en el formato correcto
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
 * (MODIFICADO: Guarda directamente el nuevo formato)
 */
export const updateSectorCoordenadas = async (sectorId, nuevasCoordenadas) => {
  try {
    const sectorRef = doc(db, "sectores", sectorId);
    
    // El polígono de 'react-native-maps' ya está en el formato correcto
    // [{ latitude: Y, longitude: X }]
    // Solo necesitamos asegurarnos de que esté cerrado.
    if (nuevasCoordenadas.length > 0) {
        const primero = nuevasCoordenadas[0];
        const ultimo = nuevasCoordenadas[nuevasCoordenadas.length - 1];
        if (primero.longitude !== ultimo.longitude || primero.latitude !== ultimo.latitude) {
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
 * (Sin cambios)
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
 * (Sin cambios)
 */
export const crearTarea = async (titulo, detalles, sectorId) => {
  try {
    await addDoc(collection(db, "tareas"), {
      sectorId: sectorId,
      titulo: titulo,
      detalles: detalles,
      fechaCreacion: Timestamp.now(),
      estado: "pendiente"
    });
    return { success: true };
  } catch (error) {
    console.error("Error al crear la tarea: ", error);
    throw new Error("No se pudo crear la tarea.");
  }
};