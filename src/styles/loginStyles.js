import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0FDF4' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: 32, 
  },
  header: { alignItems: 'center', marginBottom: 32 },
  
  // --- 1. REEMPLAZAR 'logoContainer' CON 'logo' ---
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  // --- FIN DE LA MODIFICACIÓN ---

  title: { fontSize: 24, fontWeight: 'bold', color: '#166534' }, 
  subtitle: { fontSize: 14, color: '#52525b' }, 
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)', 
    elevation: 10, 
  },

  // --- 2. ELIMINAR ESTILOS DE PESTAÑAS NO USADOS ---
  // Se eliminaron 'tabsContainer', 'tabButton', 'tabButtonActive', 
  // 'tabLabel', y 'tabLabelActive' que estaban en tu archivo original 
  // pero no se usaban en el JSX que me pasaste.
  // --- FIN DE LA MODIFICACIÓN ---

  formHeader: { alignItems: 'center', marginBottom: 16 },
  formTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' }, 
  formSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },

  // --- 3. AÑADIR ESTILOS PARA EL CAMPO DE CONTRASEÑA ---
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    // Aseguramos que el color del texto sea el correcto
    color: '#1f2937', 
  },
  eyeIcon: {
    padding: 12,
  },
  // --- FIN DE LA MODIFICACIÓN ---

  loginButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12, 
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }, 
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 24 },
  demoButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: { color: '#374151', fontSize: 14, fontWeight: '500' },
  demoCredentials: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: '#6B7280',
  },
});