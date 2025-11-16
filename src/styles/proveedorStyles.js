
import { StyleSheet } from 'react-native';

const COLORES = {
  primario: '#059669', 
  fondo: '#F9FAFB',
  blanco: '#FFFFFF',
  texto: '#1F2937',
  gris: '#6B7280',
  grisClaro: '#E5E7EB',
  aceptar: '#10B981',
  rechazar: '#EF4444',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  header: {
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 20,
    paddingTop: 40, 
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORES.grisClaro,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORES.texto,
  },
  subtitle: {
    fontSize: 14,
    color: COLORES.gris,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.grisClaro,
  },
  logoutButtonText: {
    color: COLORES.texto,
    marginLeft: 8,
    fontWeight: '500',
  },
  
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, 
  },
  loadingIndicator: {
    
    
  },
  loadingText: {
    marginTop: 10,
    color: COLORES.gris, 
    fontSize: 14,
  },
  

  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: COLORES.gris,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORES.texto,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORES.gris,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 14,
    color: COLORES.texto,
    fontWeight: '600',
    textAlign: 'right',
  },
  cardValueDate: {
    fontSize: 14,
    color: COLORES.primario, 
    fontWeight: 'bold',
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORES.grisClaro,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: COLORES.aceptar,
  },
  rejectButton: {
    backgroundColor: COLORES.rechazar,
  },
  actionButtonText: {
    color: COLORES.blanco,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
});