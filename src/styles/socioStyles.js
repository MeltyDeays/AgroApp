import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardMargin = 8;
const cardWidth = (width / 2) - (cardMargin * 2) - (10); // 10 de padding del contenedor

export default StyleSheet.create({
  // --- Contenedor Principal ---
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingTop: 48,       
    paddingBottom: 16,    
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cartButton: {
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // --- Búsqueda y Filtros ---
  controlsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  filterScrollView: {
    marginTop: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },

  // --- Cuadrícula de Productos ---
  gridContainer: {
    paddingHorizontal: (16 - cardMargin),
  },
  cardContainer: {
    flex: 1,
    maxWidth: cardWidth,
    margin: cardMargin,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  cardInfo: {
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  cardPackage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  cardStock: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  cardButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // --- Estilos de Modales (Carrito y Pago) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // --- Carrito ---
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cartItemPackage: {
    fontSize: 14,
    color: '#6B7280',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 4,
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 4,
  },
  cartItemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 8,
  },
  cartTotalContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cartTotalLabel: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  cartTotalValue: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },

  // --- Modal de Pago ---
  paymentOptionsContainer: {
    marginVertical: 16,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  paymentCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentCardItemSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  cardLogo: {
    width: 40,
    height: 26,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardTextSub: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // --- Modal de Cantidad ---
  quantityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  quantityModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24, 
    elevation: 10,
  },
  quantityModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityModalImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  quantityModalInfo: {
    flex: 1,
  },
  quantityModalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  quantityModalPackage: {
    fontSize: 14,
    color: '#6B7280',
  },
  quantityModalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 4,
  },
  quantityInputLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 28,
    fontWeight: 'bold',
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
    textAlign: 'center',
  },
  quantityButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  quantityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quantityButtonCancel: {
    backgroundColor: '#E5E7EB',
  },
  quantityButtonCancelText: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityButtonConfirm: {
    backgroundColor: '#2563EB',
  },
  quantityButtonConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- Formulario de Tarjeta ---
  cardFormContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24, 
    elevation: 10,
  },
  cardInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardInputHalf: {
    flex: 1,
  },
  
  // --- Estilos para Mis Pedidos ---
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  orderStatusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // --- (ESTILOS DE ESTADO ACTUALIZADOS) ---
  statusPendiente: {
    backgroundColor: '#FEF9C3', // Amarillo claro
    color: '#A16207', // Amarillo oscuro
  },
  statusAprobado: { // Ahora es Azul (En Camino)
    backgroundColor: '#DBEAFE', // Azul claro
    color: '#1D4ED8', // Azul oscuro
  },
  statusCompletado: { // Nuevo (Verde)
    backgroundColor: '#D1FAE5', 
    color: '#047857', 
  },
  statusRechazado: {
    backgroundColor: '#FEE2E2', // Rojo claro
    color: '#B91C1C', // Rojo oscuro
  },
  // --- (FIN DE ESTILOS DE ESTADO) ---
  orderBody: {
    paddingVertical: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderItemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  orderItemSubtotal: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderTotalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  orderTotalValue: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  orderReasonContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  orderReasonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 4,
  },
  orderReasonText: {
    fontSize: 14,
    color: '#B91C1C',
    fontStyle: 'italic',
  },
  // --- (NUEVO) Botón Confirmar Entrega ---
  orderConfirmButton: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  orderConfirmButtonText: {
    color: '#047857',
    fontWeight: 'bold',
    fontSize: 14,
  },
});