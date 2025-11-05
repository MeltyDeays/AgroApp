import { StyleSheet } from 'react-native';

// --- CAMBIO GALILEO AI: Tokens de color ---
const COLORS = { 
  primary: '#2563EB', 
  neutralBg: '#F9FAFB', 
  neutralBorder: '#E5E7EB', 
  textPrimary: '#111827', 
  textSecondary: '#6B7280', 
  availableBg: '#ECFDF5', 
  availableText: '#065F46', 
  availableBorder: '#A7F3D0', 
  inUseBg: '#EFF6FF', 
  inUseText: '#1D4ED8', 
  inUseBorder: '#BFDBFE', 
  maintenanceBg: '#FFFBEB', 
  maintenanceText: '#92400E', 
  maintenanceBorder: '#FDE68A', 
  brokenBg: '#FEF2F2', 
  brokenText: '#991B1B', 
  brokenBorder: '#FCA5A5', 
};

// --- Colores Antiguos (Se mantienen para estilos no reemplazados) ---
const COLORES = {
  primario: '#2563EB',
  fondo: '#F3F4F6',
  blanco: '#FFFFFF',
  texto: '#1F2937',
  gris: '#6B7280',
  grisClaro: '#E5E7EB',
  rojo: '#DC2626',
  verde: '#10B981',
  amarillo: '#F59E0B',
};

export default StyleSheet.create({
  // --- Estilos Antiguos Mantenidos ---
  container: {
    flex: 1, 
    backgroundColor: COLORES.fondo, 
  },
  tabSceneContainer: {
    flex: 1, 
  },
  scrollContainer: {
    flex: 1,
    padding: 16, 
  },
  cardSubtitle: {
    fontSize: 12, 
    color: COLORES.gris, 
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  actionRow: {
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 16, 
    gap: 10,
    paddingHorizontal: 12, // Añadido para alinear con el nuevo padding
    paddingBottom: 12, // Añadido para alinear
  },
  button: {
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    alignItems: 'center', 
  },
  buttonText: {
    fontSize: 14, 
    fontWeight: 'bold', 
  },
  buttonApprove: {
    backgroundColor: COLORES.verde, 
  },
  buttonApproveText: {
    color: COLORES.blanco, 
  },
  buttonReject: {
    backgroundColor: COLORES.fondo, 
    borderWidth: 1, 
    borderColor: COLORES.rojo, 
  },
  buttonRejectText: {
    color: COLORES.rojo, 
  },
  buttonUpdate: {
    backgroundColor: COLORES.fondo, 
    borderWidth: 1, 
    borderColor: COLORES.primario, 
  },
  buttonUpdateText: {
    color: COLORES.primario, 
  },
  buttonStart: {
    backgroundColor: COLORES.primario, 
  },
  buttonStartText: {
    color: COLORES.blanco, 
  },
  badgePending: { backgroundColor: COLORES.gris }, 
  badgeHigh: { backgroundColor: COLORES.rojo }, 
  badgeMedium: { backgroundColor: COLORES.amarillo }, 
  badgeLow: { backgroundColor: COLORES.verde }, 
  radioGroup: { // Mantenido por si se usa
    marginTop: 8, 
  },
  centered: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORES.fondo, 
  },
  emptyText: {
    textAlign: 'center', 
    marginTop: 40, 
    color: COLORES.gris, 
    fontSize: 14, 
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8, 
  },
  cardButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#DBEAFE', 
    borderColor: '#93C5FD', 
  },
  deleteButton: {
    backgroundColor: '#FEE2E2', 
    borderColor: '#FCA5A5', 
  },
  cardButtonText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  editButtonText: {
    color: '#1D4ED8', 
  },
  deleteButtonText: {
    color: '#B91C1C', 
  },
  imagePickerButton: { // Mantenido para el formulario de URL
    backgroundColor: COLORES.fondo,
    borderWidth: 1,
    borderColor: COLORES.primario,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerButtonText: {
    color: COLORES.primario,
    fontWeight: '600',
  },
  imagePreview: { // Mantenido para el formulario
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: COLORES.grisClaro,
  },
  maintButton: {
    backgroundColor: '#FEF9C3', 
    borderColor: '#FDE047', 
  },
  maintButtonText: {
    color: '#A16207', 
  },

  // --- CAMBIO GALILEO AI: Estilos Reemplazados/Añadidos ---
  tabBar: { 
    backgroundColor: '#FFFFFF', 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 4 
  },
  tabIndicator: { 
    height: 3, 
    backgroundColor: COLORS.primary, 
    borderRadius: 3 
  },
  tabLabel: { 
    fontWeight: '600', 
    color: COLORS.textSecondary 
  },
  card: { 
    borderRadius: 16, 
    backgroundColor: '#FFFFFF', 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 16, 
    shadowOffset: { width: 0, height: 8 }, 
    elevation: 6, 
    marginBottom: 16 
  },
  cardHeader: { 
    padding: 12, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.textPrimary 
  },
  cardImage: { 
    height: 160, 
    width: '100%' 
  },
  cardImagePlaceholder: { 
    height: 160, 
    backgroundColor: COLORS.neutralBg, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  ellipsisButton: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#F3F4F6', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginLeft: 'auto', // Asegura que se alinee a la derecha
  },
  expandedDetailsContainer: { 
    paddingHorizontal: 12, 
    paddingBottom: 12,
    borderTopWidth: 1, // Añadido para separar
    borderTopColor: COLORS.neutralBorder, // Añadido para separar
    marginTop: 8, // Añadido para separar
  },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8 
  },
  detailLabel: { 
    color: COLORS.textSecondary, 
    fontSize: 13 
  },
  detailValue: { 
    color: COLORS.textPrimary, 
    fontSize: 13,
    fontWeight: '500', // Añadido para más legibilidad
  },
  badge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 9999, 
    borderWidth: 1 
  },
  badgeAvailable: { 
    backgroundColor: COLORS.availableBg, 
    borderColor: COLORS.availableBorder 
  },
  badgeInUse: { 
    backgroundColor: COLORS.inUseBg, 
    borderColor: COLORS.inUseBorder 
  },
  badgeMaintenance: { 
    backgroundColor: COLORS.maintenanceBg, 
    borderColor: COLORS.maintenanceBorder 
  },
  badgeBroken: { 
    backgroundColor: COLORS.brokenBg, 
    borderColor: COLORS.brokenBorder 
  },
  badgeText: { 
    color: COLORS.textPrimary, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(17,24,39,0.45)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  modalContent: { 
    width: '90%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.textPrimary, 
    marginBottom: 12 
  },
  radioItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  radioLabel: { 
    color: COLORS.textPrimary 
  },
  modalButtonRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 16,
    gap: 8, // Añadido para espacio
  },
  modalButton: { 
    borderRadius: 12, 
    paddingVertical: 10, 
    paddingHorizontal: 14 
  },
  modalButtonCancel: { 
    backgroundColor: '#F3F4F6' 
  },
  modalButtonConfirm: { 
    backgroundColor: COLORS.primary 
  },
  modalButtonTextCancel: { 
    color: COLORS.textSecondary 
  },
  modalButtonTextConfirm: { 
    color: '#FFFFFF' 
  },
  imagePreviewPlaceholder: { 
    height: 160, 
    borderRadius: 12, 
    backgroundColor: COLORS.neutralBg, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  // ... (todos tus estilos existentes) ...

  // --- NUEVOS ESTILOS PARA FILTROS ---
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF', // Para que combine con la lista
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB', // COLORES.grisClaro
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB', // COLORES.fondo
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    overflow: 'hidden', // Para Android
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
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  sortButtonActive: {
    borderColor: '#2563EB', // COLORES.primario
    backgroundColor: '#EFF6FF', // Fondo azul claro
  },
  sortButtonText: {
    fontSize: 14,
    color: '#374151', // Texto gris oscuro
    marginLeft: 8,
  }
  
});