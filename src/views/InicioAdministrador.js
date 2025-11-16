import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, useWindowDimensions, SafeAreaView, ScrollView, Animated, Pressable, Alert
} from 'react-native';

import { LogOut, Menu, X, LayoutDashboard, Users, Package, Clock, Truck, ShoppingCart, Tractor, Map, MapPin, Archive } from 'lucide-react-native'; 

import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; 
import styles from '../styles/adminStyles'; 


import GestionUsuarios from './admin_modules/GestionUsuarios';
import GestionEmpleados from './admin_modules/GestionEmpleados'; 
import GestionProveedores from './admin_modules/GestionProveedores';
import GestionCompras from './admin_modules/GestionCompras';
import Dashboard from './admin_modules/Dashboard'; 
import Productos from './admin_modules/Productos'; 
import { VistaAsistencia } from './RegistroAsistencia'; 
import GestionMaquinaria from './admin_modules/GestionMaquinaria';
import NotificationBellAdmin from '../components/NotificationBellAdmin'; 
import MapaFinca from './admin_modules/MapaFinca'; 
import GestionSectores from './admin_modules/GestionSectores'; 

import GestionAlmacenes from './admin_modules/GestionAlmacenes'; 



const AppSidebar = ({ activeModule, setActiveModule, onComprasClick, navigation }) => { 
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => setActiveModule('dashboard') },
    { id: 'usuarios', label: 'Usuarios', icon: Users, action: () => setActiveModule('usuarios') },
    { id: 'empleados', label: 'Empleados', icon: Users, action: () => setActiveModule('empleados') }, 
    { id: 'productos', label: 'Productos', icon: Package, action: () => setActiveModule('productos') },
    
    { id: 'almacenes', label: 'Almacenes', icon: Archive, action: () => setActiveModule('almacenes') }, 
    
    { id: 'asistencia', label: 'Asistencia', icon: Clock, action: () => setActiveModule('asistencia') },
    { id: 'proveedores', label: 'Proveedores', icon: Truck, action: () => setActiveModule('proveedores') },
    { id: 'compras', label: 'Compras', icon: ShoppingCart, action: onComprasClick },
    { id: 'maquinaria', label: 'Maquinaria', icon: Tractor, action: () => setActiveModule('maquinaria') },
    { id: 'sectores', label: 'Gestionar Sectores', icon: MapPin, action: () => setActiveModule('sectores') }, 
    { id: 'mapa', label: 'Ver Mapa Finca', icon: Map, action: () => navigation.navigate('MapaFinca') },
  ];
  
  
  
  const getIcon = (id, Icon) => {
    if (id === 'empleados') return <Users color={activeModule === id ? '#2563eb' : '#4b5563'} size={20} />;
    return <Icon color={activeModule === id ? '#2563eb' : '#4b5563'} size={20} />;
  };

  
  return (
    <View style={styles.sidebarContainer}>
      <Text style={styles.sidebarTitle}>Menú</Text>
      {menuItems.map(({ id, label, icon: Icon, action }) => (
        <TouchableOpacity key={id} onPress={action} style={[styles.sidebarItemWrapper, activeModule === id && styles.sidebarItemWrapperActive]}>
          {getIcon(id, Icon)}
          <Text style={[styles.sidebarItem, activeModule === id && styles.sidebarItemActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};


export default function InicioAdministrador({ navigation }) { 
  
  const user = auth.currentUser;
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const sidebarAnimation = useRef(new Animated.Value(-300)).current;
  const [pedidoProveedor, setPedidoProveedor] = useState(null); 
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

  const handleNotificationClick = () => {
    setActiveModule('maquinaria');
    if (!isLargeScreen) { setSidebarOpen(false); }
  };
  
  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <ScrollView contentContainerStyle={{ flexGrow: 1 }}><Dashboard /></ScrollView>;
      case 'usuarios':
        return <GestionUsuarios />;
      case 'empleados': 
        return <GestionEmpleados />;
      case 'productos':
        return <ScrollView contentContainerStyle={{ flexGrow: 1 }}><Productos /></ScrollView>;
      
      case 'almacenes':
        return <GestionAlmacenes />; 
      
      case 'asistencia':
        return <VistaAsistencia navigation={navigation} />;
      case 'proveedores':
        return <GestionProveedores onNavigateToPedido={handleNavigateToPedido} />;
      case 'compras':
        return <GestionCompras user={user} initialProveedor={pedidoProveedor} />;
      case 'maquinaria':
        return <GestionMaquinaria ref={maquinariaRef} />;
      case 'sectores': 
        return <GestionSectores />;
      default:
        return <ScrollView contentContainerStyle={{ flexGrow: 1 }}><Dashboard /></ScrollView>;
    }
  };
  
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  };

  
  const sidebarContent = useMemo(() => (
    <AppSidebar
      activeModule={activeModule}
      setActiveModule={(module) => {
        if (module !== 'mapa') {
          setPedidoProveedor(null); 
          setActiveModule(module);
        }
        if (!isLargeScreen) { setSidebarOpen(false); }
      }}
      onComprasClick={() => {
        handleComprasClick();
      }}
      navigation={navigation} 
    />
  ), [activeModule, isLargeScreen, navigation]); 

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {/* Sidebar */}
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
          {/* Header */}
          <View style={styles.header}>
            <View style={!isLargeScreen && { marginLeft: 50, flex: 1 }}>
              <Text style={styles.headerTextSecondary}>Rol: Administrador</Text>
              <Text style={styles.headerTextPrimary} numberOfLines={1} ellipsizeMode="tail">
                {user?.email}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <NotificationBellAdmin onNotificationClick={handleNotificationClick} />

              <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <LogOut color="#374151" size={16} />
                {isLargeScreen && <Text style={styles.buttonText}>Cerrar Sesión</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Renderiza el Módulo Activo */}
          {renderModule()}

        </View>
        {/* Botón de Menú Móvil */}
        {!isLargeScreen && (
          <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X color="#374151" size={20} /> : <Menu color="#374151" size={20} />}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}