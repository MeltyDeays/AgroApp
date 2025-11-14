// src/context/UserContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { getAllUsers } from '../services/usuarioService';

// 1. Crear el Contexto
const UserContext = createContext();

// 2. Crear el Proveedor del Contexto
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch users for context:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Usamos useMemo para optimizar y no recalcular en cada render
  const value = useMemo(() => ({
    users,
    loading,
    // Función para obtener un usuario por su ID
    getUserById: (userId) => {
      if (!userId) return null;
      return users.find(u => u.id === userId);
    },
    // Función para obtener el nombre completo de un usuario
    getUserFullName: (userId) => {
      const user = users.find(u => u.id === userId);
      if (!user) return userId; // Devuelve el ID si no se encuentra
      return `${user.nombres || ''} ${user.apellidos || ''}`.trim();
    }
  }), [users, loading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 3. Crear un Hook personalizado para usar el contexto
export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
