import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  scrollView: {
    backgroundColor: '#F9FAFB',
  },
  mainContainer: {
    padding: 20,
    
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14, 
    color: '#6B7280',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0 1px 10px rgba(0,0,0,0.05)', 
    elevation: 2, 
  },
  cardTitle: {
    fontSize: 16, 
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10, 
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14, 
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 10, 
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 14, 
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filtroBoton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  filtroBotonActivo: {
    backgroundColor: '#10B981',
  },
  filtroTexto: {
    color: '#374151',
    fontWeight: '500',
  },
  filtroTextoActivo: {
    color: '#FFFFFF',
  },
  historialItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historialFecha: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'capitalize',
  },
  historialTexto: {
    fontSize: 14,
    color: '#374151',
  },
  historialVacio: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12, 
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoInfo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#EF4444',
    padding: 15,
    borderRadius: 10,
  },
});