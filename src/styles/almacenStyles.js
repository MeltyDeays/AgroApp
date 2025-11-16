import { StyleSheet } from 'react-native';

const COLORES = {
  verde: '#10B981',
  verdeClaro: '#D1FAE5',
  rojo: '#EF4444',
  rojoClaro: '#FEE2E2',
  grisFondo: '#F9FAFB',
  grisBorde: '#E5E7EB',
  textoPrincipal: '#1F2937',
  textoSecundario: '#6B7280',
  blanco: '#FFFFFF',
  azul: '#2563EB',
};

export default StyleSheet.create({
  
  progressBarBackground: {
    height: 16,
    backgroundColor: COLORES.grisBorde,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 4,
  },

  
  modalContent: {
    width: '100%',
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 24, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORES.textoSecundario,
    textAlign: 'center',
    marginBottom: 24,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: COLORES.azul, 
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 28, 
    fontWeight: 'bold',
    backgroundColor: COLORES.grisFondo, 
    color: COLORES.textoPrincipal, 
    textAlign: 'center',
  },
  modalButtonRow: {
    marginTop: 24,
    width: '100%',
  },
  
  modalButtonAction: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonAdd: {
    backgroundColor: COLORES.verde,
  },
  modalButtonRemove: {
    backgroundColor: COLORES.rojo,
  },
  
  modalButtonClose: {
    backgroundColor: COLORES.blanco,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.grisBorde,
  },
  modalButtonText: {
    color: COLORES.textoSecundario,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtonConfirmText: {
    color: COLORES.blanco,
    fontWeight: 'bold',
    fontSize: 16,
  },

  
  actionButtonAdd: {
    backgroundColor: COLORES.verdeClaro, 
    borderColor: COLORES.verde,
  },
  actionButtonAddText: {
    color: '#047857',
  },
  actionButtonRemove: {
    backgroundColor: COLORES.rojoClaro, 
    borderColor: '#FCA5A5',
  },
  actionButtonRemoveText: {
    color: '#B91C1C',
  },
});