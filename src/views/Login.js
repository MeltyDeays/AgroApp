import React, { useState, useRef } from 'react'; // --- AÑADIDO: useRef ---
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
} from 'react-native';
// --- CORRECCIÓN: Se eliminan Shield y User ---
import { Sprout } from 'lucide-react-native'; 
import { loginUser } from '../services/authService'; 
import styles from '../styles/loginStyles'; 

// --- CORRECCIÓN: Se elimina el componente TabButton ---

export default function Login() {
  // --- CORRECCIÓN: Se elimina el estado activeTab ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- AÑADIDO: Ref para el campo de contraseña ---
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    setLoading(true);
    const result = await loginUser(email, password);
    if (!result.success) {
      Alert.alert('Error de Inicio de Sesión', result.error);
    }
    // Si tiene éxito, el listener en App.js se encarga de todo.
    setLoading(false);
  };

  // --- CORRECCIÓN: Se simplifica el contenido del formulario ---
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
            placeholder="correo@ejemplo.com" // Placeholder genérico
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next" // --- AÑADIDO ---
            onSubmitEditing={() => passwordRef.current?.focus()} // --- AÑADIDO ---
            blurOnSubmit={false} // --- AÑADIDO ---
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            ref={passwordRef} // --- AÑADIDO ---
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            returnKeyType="done" // --- AÑADIDO ---
            onSubmitEditing={handleLogin} // --- AÑADIDO ---
            placeholderTextColor="#9CA3AF"
          />
        </View>

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
              <View style={styles.logoContainer}>
                <Sprout size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Bienvenido a AgroApp</Text>
              <Text style={styles.subtitle}>Sistema de Gestión de Granja</Text>
            </View>

            <View style={styles.card}>
              {/* --- CORRECCIÓN: Se elimina el contenedor de pestañas --- */}
              {renderFormContent()}
            </View>

            <Text style={styles.footerText}>© 2025 AgroApp. Todos los derechos reservados.</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}