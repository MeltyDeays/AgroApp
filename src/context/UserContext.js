
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { getAllUsers } from '../services/usuarioService';


const UserContext = createContext();


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

  
  const value = useMemo(() => ({
    users,
    loading,
    
    getUserById: (userId) => {
      if (!userId) return null;
      return users.find(u => u.id === userId);
    },
    
    getUserFullName: (userId) => {
      const user = users.find(u => u.id === userId);
      if (!user) return userId; 
      return `${user.nombres || ''} ${user.apellidos || ''}`.trim();
    }
  }), [users, loading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};


export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
