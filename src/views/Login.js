import React, { useState, useRef } from 'react'; 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Image // <-- 1. IMPORTAR Image
} from 'react-native';

// --- 2. IMPORTAR Eye y EyeOff, QUITAR Sprout ---
import { Eye, EyeOff } from 'lucide-react-native'; 
import { loginUser } from '../services/authService'; 
import styles from '../styles/loginStyles'; 

export default function Login() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 3. AÑADIR ESTADO PARA EL OJO ---
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    setLoading(true);
    const result = await loginUser(email, password);
    if (!result.success) {
      Alert.alert('Error de Inicio de Sesión', result.error);
    }
    
    setLoading(false);
  };

  
  const renderFormContent = () => {
    return (
      <>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            Iniciar Sesión
          </Text>
          <Text style={styles.formSubtitle}>
            Ingresa tus credenciales para acceder
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com" 
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next" 
            onSubmitEditing={() => passwordRef.current?.focus()} 
            blurOnSubmit={false} 
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* --- 4. CAMPO DE CONTRASEÑA MODIFICADO --- */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              ref={passwordRef} 
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={secureTextEntry} // Controlado por el estado
              returnKeyType="done" 
              onSubmitEditing={handleLogin} 
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              onPress={() => setSecureTextEntry(!secureTextEntry)}
              style={styles.eyeIcon}
            >
              {secureTextEntry ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss} style={{flex: 1}}>
          <View style={styles.container}>
            <View style={styles.header}>
              
              {/* --- 5. CAMBIO DE LOGO --- */}
              <Image
                source={require('../images/AgroApp.png')}
                style={styles.logo} // Usaremos un nuevo estilo 'logo'
              />
              {/* --- FIN DE LA MODIFICACIÓN --- */}

              <Text style={styles.title}>Bienvenido a AgroApp</Text>
              <Text style={styles.subtitle}>Sistema de Gestión de Granja</Text>
            </View>

            <View style={styles.card}>
              {renderFormContent()}
            </View>

            <Text style={styles.footerText}>© 2025 AgroApp. Todos los derechos reservados.</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}