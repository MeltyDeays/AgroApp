// src/views/InicioAdministrador.js
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, useWindowDimensions, SafeAreaView, ScrollView, Animated, Pressable, Alert
} from 'react-native';
import { LogOut, Menu, X, LayoutDashboard, Users, Package, Clock, Truck, ShoppingCart, Tractor } from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; 
import styles from '../styles/adminStyles'; 

// --- (1) IMPORTAR MÓDULOS Y CAMPANA ---
import GestionUsuarios from './admin_modules/GestionUsuarios';
import GestionProveedores from './admin_modules/GestionProveedores';
import GestionCompras from './admin_modules/GestionCompras';
import Dashboard from './admin_modules/Dashboard'; 
import Productos from './admin_modules/Productos'; 
import { VistaAsistencia } from './RegistroAsistencia'; 
import GestionMaquinaria from './admin_modules/GestionMaquinaria';
import NotificationBellAdmin from '../components/NotificationBellAdmin'; // <-- NUEVO


// --- Componente Sidebar (sin cambios) ---
const AppSidebar = ({ activeModule, setActiveModule, onComprasClick }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => setActiveModule('dashboard') },
    { id: 'usuarios', label: 'Usuarios', icon: Users, action: () => setActiveModule('usuarios') },
    { id: 'productos', label: 'Productos', icon: Package, action: () => setActiveModule('productos') },
    { id: 'asistencia', label: 'Asistencia', icon: Clock, action: () => setActiveModule('asistencia') },
    { id: 'proveedores', label: 'Proveedores', icon: Truck, action: () => setActiveModule('proveedores') },
    { id: 'compras', label: 'Compras', icon: ShoppingCart, action: onComprasClick },
    { id: 'maquinaria', label: 'Maquinaria', icon: Tractor, action: () => setActiveModule('maquinaria') },
  ];
  return (
    <View style={styles.sidebarContainer}>
      <Text style={styles.sidebarTitle}>Menú</Text>
      {menuItems.map(({ id, label, icon: Icon, action }) => (
        <TouchableOpacity key={id} onPress={action} style={[styles.sidebarItemWrapper, activeModule === id && styles.sidebarItemWrapperActive]}>
          <Icon color={activeModule === id ? '#2563eb' : '#4b5563'} size={20} />
          <Text style={[styles.sidebarItem, activeModule === id && styles.sidebarItemActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// --- Componente Principal ---
export default function InicioAdministrador({ navigation }) { 
  const user = auth.currentUser;
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const sidebarAnimation = useRef(new Animated.Value(-300)).current;
  const [pedidoProveedor, setPedidoProveedor] = useState(null); 
  
  // (NUEVO) Ref para el módulo de maquinaria
  const maquinariaRef = useRef(null);

  useEffect(() => {
    if (!isLargeScreen) {
      Animated.timing(sidebarAnimation, { toValue: sidebarOpen ? 0 : -300, duration: 300, useNativeDriver: true }).start();
    }
  }, [sidebarOpen, isLargeScreen, sidebarAnimation]);

  const handleNavigateToPedido = (proveedor) => {
    setPedidoProveedor(proveedor);
    setActiveModule('compras');
    if (!isLargeScreen) setSidebarOpen(false); 
  };

  const handleComprasClick = () => {
    setPedidoProveedor(null); 
    setActiveModule('compras');
    if (!isLargeScreen) setSidebarOpen(false); 
  };

  // --- (NUEVO) Handler para la campana ---
  const handleNotificationClick = () => {
    setActiveModule('maquinaria');
    // (Opcional) Si quisieras que vaya a la pestaña 0 (Solicitudes)
    // maquinariaRef.current?.irAPestaña(0); 
    if (!isLargeScreen) { setSidebarOpen(false); }
  };

  // --- renderModule ACTUALIZADO ---
  const renderModule = () => {
    switch (activeModule) {
      case 'usuarios':
        return <GestionUsuarios />;
      case 'productos':
        return <ScrollView contentContainerStyle={{ flexGrow: 1 }}><Productos /></ScrollView>;
      case 'asistencia':
        return <VistaAsistencia navigation={navigation} />;
      case 'proveedores':
        return <GestionProveedores onNavigateToPedido={handleNavigateToPedido} />;
      case 'compras':
        return <GestionCompras user={user} initialProveedor={pedidoProveedor} />;
      case 'maquinaria':
        // (NUEVO) Pasa la ref
        return <GestionMaquinaria ref={maquinariaRef} />;
      case 'dashboard':
      default:
        return <ScrollView contentContainerStyle={{ flexGrow: 1 }}><Dashboard /></ScrollView>;
    }
  };
  // ------------------------------------

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  };

  // Memoized Sidebar Content (sin cambios)
  const sidebarContent = useMemo(() => (
    <AppSidebar
      activeModule={activeModule}
      setActiveModule={(module) => {
        setPedidoProveedor(null); 
        setActiveModule(module);
        if (!isLargeScreen) { setSidebarOpen(false); }
      }}
      onComprasClick={() => {
        handleComprasClick();
      }}
    />
  ), [activeModule, isLargeScreen]); 

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {/* Sidebar (sin cambios) */}
        {isLargeScreen ? (
          <View style={styles.sidebarWrapper}>{sidebarContent}</View>
        ) : (
          <>
            {sidebarOpen && <Pressable style={styles.overlay} onPress={() => setSidebarOpen(false)} />}
            <Animated.View style={[styles.sidebarMobile, { transform: [{ translateX: sidebarAnimation }] }]}>
              {sidebarContent}
            </Animated.View>
          </>
        )}
        
        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* --- HEADER ACTUALIZADO --- */}
          <View style={styles.header}>
            <View style={!isLargeScreen && { marginLeft: 50, flex: 1 }}>
              <Text style={styles.headerTextSecondary}>Rol: Administrador</Text>
              <Text style={styles.headerTextPrimary} numberOfLines={1} ellipsizeMode="tail">
                {user?.email}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* --- (NUEVO) Añadir campana de Admin --- */}
              <NotificationBellAdmin onNotificationClick={handleNotificationClick} />

              <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <LogOut color="#374151" size={16} />
                {isLargeScreen && <Text style={styles.buttonText}>Cerrar Sesión</Text>}
              </TouchableOpacity>
            </View>
          </View>
          {/* --- FIN DEL HEADER --- */}

          {/* Renderiza el Módulo Activo */}
          {renderModule()}

        </View>
        {/* Botón de Menú Móvil (sin cambios) */}
        {!isLargeScreen && (
          <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X color="#374151" size={20} /> : <Menu color="#374151" size={20} />}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}