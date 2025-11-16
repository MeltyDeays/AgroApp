// src/views/admin_modules/GestionUsuarios.js
import React, { useState, useEffect, useMemo, useRef } from 'react'; 
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView
} from 'react-native'; 
import { UserPlus, ChevronLeft, ChevronDown, MoreVertical, Edit, Trash2, Search } from 'lucide-react-native';
import { registerEmployee, getAllUsers, updateUser, deleteUser } from '../../services/usuarioService'; //
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/adminStyles'; 

// --- Formulario de Usuarios ---
const UserForm = ({ onBackToList, initialData = null }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    nombres: initialData?.nombres || '',
    apellidos: initialData?.apellidos || '',
    email: initialData?.email || '',
    password: '',
    cedula: initialData?.cedula || '',
    edad: initialData?.edad || '',
    // Se elimina el campo 'sector' para el registro inicial de empleados
    sector: initialData?.sector || (initialData?.rol === 'empleado' ? '' : 'Bodega Principal'), // Usar valor por defecto si no es empleado
    rol: initialData?.rol || 'empleado',
  });
  const [loading, setLoading] = useState(false);

  const apellidosRef = useRef(null);
  const cedulaRef = useRef(null);
  const edadRef = useRef(null);
  const sectorRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    let result;
    if (isEditing) {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      delete updateData.email;
      
      // Si el rol es empleado, eliminamos el campo 'sector' para no guardarlo en 'usuarios'
      if (updateData.rol === 'empleado') delete updateData.sector;

      result = await updateUser(initialData.id, updateData); 
    } else {
      // Si el rol es empleado, el campo 'sector' no se usa para el registro inicial
      if (formData.rol === 'empleado') {
        const dataToRegister = { ...formData };
        delete dataToRegister.sector; 
        result = await registerEmployee(dataToRegister); 
      } else {
        result = await registerEmployee(formData); 
      }
    }
    setLoading(false);
    if (result.success) {
      Alert.alert("Éxito", isEditing ? "Usuario actualizado." : "Usuario registrado. Asigne el sector desde Gestión de Empleados si corresponde.");
      onBackToList(true);
    } else {
      Alert.alert("Error", result.error);
    }
  };
  
  // Condición para mostrar el campo 'Sector'
  const isSectorRequired = formData.rol !== 'empleado' && formData.rol !== 'proveedor';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => onBackToList(false)}>
        <ChevronLeft size={20} color="#2563eb" />
        <Text style={styles.backButtonText}>Volver a la lista</Text>
      </TouchableOpacity>
      <View style={styles.formHeader}>
        {isEditing ? <Edit size={24} color="#1F2937" /> : <UserPlus size={24} color="#1F2937" />}
        <Text style={styles.formTitle}>{isEditing ? "Editar Usuario" : "Registrar Nuevo Usuario"}</Text>
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Nombres</Text>
        <TextInput style={styles.input} onChangeText={(v) => handleChange('nombres', v)} value={formData.nombres} 
          returnKeyType="next" onSubmitEditing={() => apellidosRef.current?.focus()} blurOnSubmit={false} />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Apellidos</Text>
        <TextInput ref={apellidosRef} style={styles.input} onChangeText={(v) => handleChange('apellidos', v)} value={formData.apellidos} 
          returnKeyType="next" onSubmitEditing={() => cedulaRef.current?.focus()} blurOnSubmit={false} />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Cédula (ID)</Text>
        <TextInput ref={cedulaRef} style={styles.input} onChangeText={(v) => handleChange('cedula', v)} value={formData.cedula} 
          returnKeyType="next" onSubmitEditing={() => edadRef.current?.focus()} blurOnSubmit={false} />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Edad</Text>
        <TextInput ref={edadRef} style={styles.input} keyboardType="numeric" onChangeText={(v) => handleChange('edad', v)} value={formData.edad} 
          returnKeyType="next" onSubmitEditing={() => (isSectorRequired ? sectorRef.current?.focus() : emailRef.current?.focus())} blurOnSubmit={false} />
      </View>
      
      {/* Campo de Sector solo si NO es Empleado/Proveedor */}
      {isSectorRequired && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sector/Ubicación Principal</Text>
          <TextInput ref={sectorRef} style={styles.input} onChangeText={(v) => handleChange('sector', v)} value={formData.sector} 
            returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} blurOnSubmit={false} />
        </View>
      )}

      <View style={styles.inputGroup}><Text style={styles.label}>Correo Electrónico</Text>
        <TextInput 
          ref={emailRef} 
          style={[styles.input, isEditing && { backgroundColor: '#E5E7EB', color: '#6B7280' }]} 
          autoCapitalize="none" 
          keyboardType="email-address" 
          onChangeText={(v) => handleChange('email', v)} 
          value={formData.email} 
          editable={!isEditing} 
          returnKeyType="next" 
          onSubmitEditing={() => passwordRef.current?.focus()} 
          blurOnSubmit={false} 
        />
      </View>
      <View style={styles.inputGroup}><Text style={styles.label}>Contraseña {isEditing ? "(Opcional)" : ""}</Text>
        <TextInput 
          ref={passwordRef} 
          style={styles.input} 
          placeholder={isEditing ? "Nueva contraseña (si desea cambiar)" : "Mínimo 6 caracteres"} 
          secureTextEntry 
          onChangeText={(v) => handleChange('password', v)} 
          value={formData.password} 
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Rol de Usuario</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={formData.rol} onValueChange={(v) => handleChange('rol', v)} style={styles.picker}>
            <Picker.Item label="Empleado" value="empleado" />
            <Picker.Item label="Bodeguero" value="bodeguero" />
            <Picker.Item label="Socio" value="socio" />
            <Picker.Item label="Maquinaria" value="maquinaria" />
            <Picker.Item label="Administrador" value="admin" />
            <Picker.Item label="Proveedor" value="proveedor" /> 
          </Picker>
          <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
        </View>
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>{isEditing ? "Guardar Cambios" : "Registrar Usuario"}</Text>}
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ... (El componente UserList se mantiene igual para la gestión de usuarios NO-empleados)

const UserList = ({ onGoToAddForm, onEditUser, refreshKey }) => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try { const users = await getAllUsers(); setUserList(users); } 
    catch (error) { Alert.alert("Error", "No se pudo cargar la lista."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, [refreshKey]);

  const filteredAndSortedUsers = useMemo(() => {
    let tempUsers = userList.filter(user => {
      const roleMatch = filterRole === 'all' || user.rol === filterRole;
      if (!roleMatch) return false;
      if (!searchTerm) return true;
      const fullName = `${user.nombres || ''} ${user.apellidos || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
    tempUsers.sort((a, b) => {
      const nameA = `${a.nombres || ''} ${a.apellidos || ''}`.toLowerCase();
      const nameB = `${b.nombres || ''} ${b.apellidos || ''}`.toLowerCase();
      return (sortOrder === 'asc') ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return tempUsers;
  }, [userList, filterRole, sortOrder, searchTerm]);

  const renderUserItem = ({ item }) => {
    const isExpanded = expandedUserId === item.id;
    
    const getRoleStyle = (rol) => {
      switch (rol) {
        case 'admin': return styles.roleAdmin;
        case 'empleado': return styles.roleEmpleado;
        case 'bodeguero': return styles.roleBodeguero;
        case 'socio': return styles.roleSocio;
        case 'maquinaria': return styles.roleMaquinaria;
        case 'proveedor': return styles.roleProveedor; 
        default: return styles.roleEmpleado;
      }
    };

    const roleName = item.rol ? item.rol.charAt(0).toUpperCase() + item.rol.slice(1) : 'N/A';
    const toggleExpansion = () => setExpandedUserId(isExpanded ? null : item.id);
    
    const handleDelete = () => {
      Alert.alert( "Confirmar Eliminación", `¿Eliminar a ${item.nombres}?`, 
        [ { text: "Cancelar" },
          { 
            text: "Eliminar", 
            style: "destructive", 
            onPress: async () => {
              try {
                const result = await deleteUser(item.id); 
                
                if (result.success) {
                  Alert.alert("Éxito", "Usuario eliminado.");
                  fetchUsers(); 
                } else {
                  Alert.alert("Error", result.error); 
                }
              } catch (error) {
                console.error("Error fatal al eliminar (GestionUsuarios):", error);
                Alert.alert("Error Inesperado", "No se pudo ejecutar la acción. Revise la consola.");
              } finally {
                setExpandedUserId(null); 
              }
            }
          }
        ]
      );
    };

    return (
        <View style={styles.userItem}>
            <View style={styles.userItemHeader}>
                <View style={styles.userItemText}>
                    <Text style={styles.userName}>{item.nombres} {item.apellidos}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text style={styles.userEmail}>Cédula: {item.cedula}</Text>
                </View>
                <View style={styles.userItemRoleContainer}>
                    <Text style={[styles.userItemRole, getRoleStyle(item.rol)]}>{roleName}</Text>
                    <TouchableOpacity style={styles.ellipsisButton} onPress={toggleExpansion}>
                    <MoreVertical size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>
            {isExpanded && (
                <View style={styles.expandedDetailsContainer}>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Edad:</Text><Text style={styles.detailValue}>{item.edad}</Text></View>
                    {item.rol !== 'empleado' && item.rol !== 'proveedor' && (
                        <View style={styles.detailRow}><Text style={styles.detailLabel}>Sector:</Text><Text style={styles.detailValue}>{item.sector}</Text></View>
                    )}
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Creado:</Text><Text style={styles.detailValue}>{item.fechaCreacion?.toDate ? item.fechaCreacion.toDate().toLocaleDateString('es-ES') : 'N/A'}</Text></View>
                    <View style={styles.expandedActionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                        <Trash2 size={16} color="#B91C1C" />
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEditUser(item)}>
                        <Edit size={16} color="#1D4ED8" />
                        <Text style={[styles.actionButtonText, styles.editButtonText]}>Editar</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.formTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addUserButton} onPress={onGoToAddForm}>
          <UserPlus size={18} color="#FFFFFF" />
          <Text style={styles.addUserButtonText}>Agregar Usuario</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchInputIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre y apellido..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#6B7280"
        />
      </View>

      <View style={styles.filterBar}>
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Filtrar por Rol:</Text>
          <View style={[styles.pickerContainer, styles.filterPicker]}>
            <Picker selectedValue={filterRole} onValueChange={(v) => setFilterRole(v)} style={styles.picker}>
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Empleado" value="empleado" />
              <Picker.Item label="Bodeguero" value="bodeguero" />
              <Picker.Item label="Socio" value="socio" />
              <Picker.Item label="Maquinaria" value="maquinaria" />
              <Picker.Item label="Administrador" value="admin" />
              <Picker.Item label="Proveedor" value="proveedor" /> 
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.label}>Ordenar A-Z:</Text>
          <View style={[styles.pickerContainer, styles.filterPicker]}>
            <Picker selectedValue={sortOrder} onValueChange={(v) => setSortOrder(v)} style={styles.picker}>
              <Picker.Item label="A - Z" value="asc" />
              <Picker.Item label="Z - A" value="desc" />
            </Picker>
            <View style={styles.pickerIconContainer}><ChevronDown size={20} color="#6B7280" /></View>
          </View>
        </View>
      </View>
      {loading ? ( <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }}/> )
       : ( <FlatList data={filteredAndSortedUsers} renderItem={renderUserItem} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron usuarios.</Text>} removeClippedSubviews={false} /> )
      }
    </View>
  );
};

// --- Componente Principal del Módulo de Usuarios ---
export default function GestionUsuarios() {
  const [viewMode, setViewMode] = useState('list'); 
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingUser, setEditingUser] = useState(null);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setViewMode('edit');
  };

  const handleBackToList = (refresh) => {
    setViewMode('list');
    setEditingUser(null);
    if (refresh) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  if (viewMode === 'add') {
    return <UserForm onBackToList={handleBackToList} />;
  }
  if (viewMode === 'edit') {
    return <UserForm onBackToList={handleBackToList} initialData={editingUser} />;
  }
  return <UserList onGoToAddForm={() => setViewMode('add')} onEditUser={handleEditUser} refreshKey={refreshKey} />;
}