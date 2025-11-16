import { StyleSheet } from 'react-native';


const COLORES = {
  verde: '#10B981',
  azul: '#2563EB',
  rojo: '#EF4444',
  amarillo: '#F59E0B',
  gris: '#6B7280',
  grisClaro: '#D1D5DB',
  fondo: '#F9FAFB',
  blanco: '#FFFFFF',
  texto: '#1F2937',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  scrollView: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORES.texto,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORES.gris,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORES.gris,
    marginTop: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORES.texto,
  },
  machineCard: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  cardImage: {
    height: 150,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  machineName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORES.texto,
    flex: 1,
    marginRight: 8,
  },
  machineId: {
    fontSize: 12,
    color: COLORES.gris,
    marginBottom: 12,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden', 
  },
  badgeText: {
    color: COLORES.blanco,
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeAvailable: { backgroundColor: COLORES.verde },
  badgeInUse: { backgroundColor: COLORES.azul },
  badgeMaintenance: { backgroundColor: COLORES.amarillo },
  badgeBroken: { backgroundColor: COLORES.rojo },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORES.gris,
  },
  detailValue: {
    fontSize: 14,
    color: COLORES.texto,
    fontWeight: '500',
  },
  buttonReserve: {
    backgroundColor: COLORES.verde,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: COLORES.grisClaro,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: COLORES.blanco,
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORES.texto,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORES.grisClaro,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORES.fondo,
    marginBottom: 12,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    backgroundColor: COLORES.verde,
  },
  modalButtonCancel: {
    backgroundColor: COLORES.grisClaro,
  },
  modalButtonTextConfirm: {
    color: COLORES.blanco,
    fontWeight: 'bold',
  },
  modalButtonTextCancel: {
    color: COLORES.texto,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.fondo,
  },

  

  buttonReport: {
    backgroundColor: COLORES.blanco,
    borderColor: COLORES.rojo,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8, 
  },
  buttonReportText: {
    color: COLORES.rojo,
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputMultiline: {
    borderWidth: 1,
    borderColor: COLORES.grisClaro,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORES.fondo,
    marginBottom: 12,
    height: 100, 
    textAlignVertical: 'top', 
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    color: COLORES.texto,
    fontSize: 16,
    marginLeft: 8,
  },
  priorityLabel: {
    fontSize: 14,
    color: COLORES.gris,
    marginBottom: 8,
  },

  
  modalImagePreview: {
    height: 100,
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORES.fondo,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalImagePreviewPlaceholder: {
    height: 100,
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORES.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  

  
  filterContainer: {
    paddingVertical: 16,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORES.grisClaro,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: COLORES.blanco, 
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORES.grisClaro,
    borderRadius: 8,
    backgroundColor: COLORES.blanco,
    marginBottom: 12,
    overflow: 'hidden', 
  },
  picker: {
    height: 44,
    width: '100%',
    backgroundColor: 'transparent',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12, 
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: COLORES.grisClaro,
    backgroundColor: COLORES.blanco,
    borderRadius: 8,
  },
  sortButtonActive: {
    borderColor: COLORES.verde, 
    backgroundColor: '#F0FDF4', 
  },
  sortButtonText: {
    fontSize: 14,
    color: COLORES.texto,
    marginLeft: 8,
  },

  
  assignedContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#E0F2FE', 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  assignedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369A1', 
    marginBottom: 16,
  },
  assignedCard: {
    backgroundColor: COLORES.blanco,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  assignedCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  assignedCardContent: {
    flex: 1,
  },
  assignedMachineName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORES.texto,
  },
  assignedMachineId: {
    fontSize: 12,
    color: COLORES.gris,
    marginBottom: 8,
  },
  buttonComplete: {
    backgroundColor: '#3B82F6', 
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});