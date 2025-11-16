import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, ScrollView, Image, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { LogOut, ShoppingCart, X, CreditCard, Home, Trash2, Plus, CheckCircle, ClipboardCheck } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store'; 
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import * as productoService from '../../services/productoService';
import * as almacenService from '../../services/almacenService';
import * as pedidoClienteService from '../../services/pedidoClienteService';
import styles from '../../styles/socioStyles';
import { useUsers } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';

// ... (Todos los Modales: QuantityModal, AddCardModal, CartModal, CheckoutModal... van aquí SIN CAMBIOS)
// ... (QuantityModal)
const QuantityModal = ({ visible, onClose, producto, onConfirm }) => {
  const [cantidad, setCantidad] = useState('1'); 
  useEffect(() => {
    if (visible) {
      setCantidad('1'); 
    }
  }, [visible]);
  if (!producto) return null;
  const handleConfirm = () => {
    const numCantidad = parseInt(cantidad, 10);
    if (isNaN(numCantidad) || numCantidad <= 0) {
      Alert.alert("Cantidad Inválida", "Por favor, ingresa un número positivo.");
      return;
    }
    onConfirm(numCantidad);
    onClose();
  };
  const handleClose = () => {
    onClose();
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.quantityModalOverlay}
      >
        <View style={styles.quantityModalContent}>
          <View style={styles.quantityModalHeader}>
            <Image 
              source={producto.imageUrl ? { uri: producto.imageUrl } : require('../../../assets/icon.png')}
              style={styles.quantityModalImage} 
            />
            <View style={styles.quantityModalInfo}>
              <Text style={styles.quantityModalName} numberOfLines={2}>{producto.nombre}</Text>
              <Text style={styles.quantityModalPackage}>Paquete: {producto.cantidadVenta} {producto.unidadVenta}</Text>
              <Text style={styles.quantityModalPrice}>C$ {producto.precio.toFixed(2)}</Text>
            </View>
          </View>
          <Text style={styles.quantityInputLabel}>Ingresa la cantidad de paquetes</Text>
          <TextInput
            style={styles.quantityInput}
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="numeric"
            autoFocus={true}
            selectTextOnFocus={true}
          />
          <View style={styles.quantityButtonRow}>
            <TouchableOpacity 
              style={[styles.quantityButton, styles.quantityButtonCancel]} 
              onPress={handleClose}
            >
              <Text style={styles.quantityButtonCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quantityButton, styles.quantityButtonConfirm]} 
              onPress={handleConfirm}
            >
              <Text style={styles.quantityButtonConfirmText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
// ... (AddCardModal)
const AddCardModal = ({ visible, onClose, onCardSaved }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const handleCardNumberChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, ''); 
    const formattedText = numericText
      .replace(/(\d{4})/g, '$1 ')
      .trim(); 
    setCardNumber(formattedText);
  };
  const handleExpiryDateChange = (text) => {
    let v = text.replace(/[^0-9]/g, ''); 
    if (v.length > 2) {
      v = v.slice(0, 2) + '/' + v.slice(2);
    }
    if (text.length === 2 && expiryDate.length === 3) {
      v = v.slice(0, 1);
    }
    setExpiryDate(v);
  };
  const handleSaveCard = async () => {
    const numericCardNumber = cardNumber.replace(/\s/g, '');
    if (numericCardNumber.length < 15 || expiryDate.length !== 5 || cvv.length < 3 || !cardHolderName) {
      Alert.alert("Datos Inválidos", "Por favor, completa todos los campos correctamente.");
      return;
    }
    setLoading(true);
    try {
      const newCard = {
        id: Date.now().toString(),
        last4: numericCardNumber.slice(-4), 
        expiryDate: expiryDate,
        cardHolderName: cardHolderName,
      };
      const existingCardsJson = await SecureStore.getItemAsync('savedCards');
      const existingCards = existingCardsJson ? JSON.parse(existingCardsJson) : [];
      const newCards = [...existingCards, newCard];
      await SecureStore.setItemAsync('savedCards', JSON.stringify(newCards));
      setLoading(false);
      Alert.alert("¡Éxito!", "Tarjeta guardada de forma segura.");
      onCardSaved(newCards); 
      onClose();
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardHolderName('');
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "No se pudo guardar la tarjeta.");
      console.error(error);
    }
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.quantityModalOverlay}
      >
        <ScrollView style={{width: '100%'}}>
          <View style={styles.cardFormContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva Tarjeta</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Titular</Text>
              <TextInput style={styles.cardInput} value={cardHolderName} onChangeText={setCardHolderName} placeholder="Ej: Juan Pérez" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Tarjeta</Text>
              <TextInput 
                style={styles.cardInput} 
                value={cardNumber} 
                onChangeText={handleCardNumberChange}
                placeholder="0000 0000 0000 0000" 
                keyboardType="numeric" 
                maxLength={19}
              />
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.inputGroup, styles.cardInputHalf]}>
                <Text style={styles.label}>Vencimiento</Text>
                <TextInput 
                  style={styles.cardInput} 
                  value={expiryDate} 
                  onChangeText={handleExpiryDateChange}
                  placeholder="MM/YY" 
                  keyboardType="numeric" 
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, styles.cardInputHalf]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput style={styles.cardInput} value={cvv} onChangeText={setCvv} placeholder="123" keyboardType="numeric" maxLength={4} secureTextEntry />
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, { marginTop: 16 }]} 
              onPress={handleSaveCard} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.checkoutButtonText}>Guardar Tarjeta</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
// ... (ProductCard)
const ProductCard = ({ item, onAddToCart, almacenes }) => {
  const almacenOrigen = useMemo(() => {
    return almacenes.find(a => a.id === item.almacenId);
  }, [almacenes, item.almacenId]);
  return (
    <View style={styles.cardContainer}>
      <Image 
        source={item.imageUrl ? { uri: item.imageUrl } : require('../../../assets/icon.png')}
        style={styles.cardImage} 
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.cardPrice}>C$ {item.precio.toFixed(2)}</Text>
        <Text style={styles.cardPackage}>
          Paquete: {item.cantidadVenta} {item.unidadVenta}
        </Text>
        <Text style={styles.cardStock}>
          Stock de: {almacenOrigen?.nombre || 'N/A'}
        </Text>
      </View>
      <TouchableOpacity style={styles.cardButton} onPress={() => onAddToCart(item)}> 
        <Text style={styles.cardButtonText}>Agregar al Carrito</Text>
      </TouchableOpacity>
    </View>
  );
};
// ... (CartModal)
const CartModal = ({ visible, onClose, cart, onRemove, onCheckout, total }) => {
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={item.imageUrl ? { uri: item.imageUrl } : require('../../../assets/icon.png')}
        style={styles.cartItemImage} 
      />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName}>{item.nombre}</Text>
        <Text style={styles.cartItemPackage}>{item.cantidadVenta} {item.unidadVenta}</Text>
        <Text style={styles.cartItemPrice}>C$ {item.precio.toFixed(2)} c/u</Text>
        <Text style={styles.cartItemQuantity}>Cantidad: {item.cantidad}</Text>
        <Text style={styles.cartItemSubtotal}>Subtotal: C$ {(item.precio * item.cantidad).toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemove(item.cartId)} style={{ padding: 8 }}>
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mi Carrito</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {cart.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <ShoppingCart size={48} color="#D1D5DB" />
              <Text style={styles.emptyCartText}>Tu carrito está vacío.</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.cartId.toString()}
              />
              <View style={styles.cartTotalContainer}>
                <View style={styles.cartTotalRow}>
                  <Text style={styles.cartTotalLabel}>Total</Text>
                  <Text style={styles.cartTotalValue}>C$ {total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
                  <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
// ... (CheckoutModal)
const CheckoutModal = ({ visible, onClose, total, onPlaceOrder, savedCards, onAddNewCard }) => {
  const [selectedPayment, setSelectedPayment] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handlePlaceOrder = async () => {
    if (!address) {
      Alert.alert("Error", "Por favor, ingresa una dirección de entrega.");
      return;
    }
    if (!selectedPayment) {
      Alert.alert("Error", "Por favor, selecciona un método de pago.");
      return;
    }
    setLoading(true);
    try {
      const paymentMethod = selectedPayment.type;
      const paymentDetails = paymentMethod === 'Tarjeta' ? { last4: selectedPayment.last4 } : null;
      
      await onPlaceOrder(paymentMethod, paymentDetails, address);
      
      Alert.alert("¡Pedido Realizado!", "Tu pedido ha sido enviado al administrador para su aprobación.");
      setSelectedPayment(null);
      setAddress(''); 
      onClose();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Finalizar Compra</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View style={styles.cartTotalRow}>
              <Text style={styles.cartTotalLabel}>Total a Pagar</Text>
              <Text style={styles.cartTotalValue}>C$ {total.toFixed(2)}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { marginTop: 16 }]}>Dirección de Entrega</Text>
              <TextInput 
                style={[styles.searchBar, { paddingVertical: 12 }]} 
                value={address} 
                onChangeText={setAddress} 
                placeholder="Ej: 50vrs al sur del parque, Juigalpa" 
              />
            </View>

            <View style={styles.paymentOptionsContainer}>
              <Text style={[styles.label, { marginBottom: 12 }]}>Selecciona un Método de Pago</Text>
              
              {savedCards.map(card => {
                const isSelected = selectedPayment?.type === 'Tarjeta' && selectedPayment?.id === card.id;
                return (
                  <TouchableOpacity 
                    key={card.id}
                    style={[styles.paymentCardItem, isSelected && styles.paymentCardItemSelected]}
                    onPress={() => setSelectedPayment({ type: 'Tarjeta', id: card.id, last4: card.last4 })}
                  >
                    <View style={styles.cardLogo}><CreditCard size={18} color="#6B7280" /></View>
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardText}>**** **** **** {card.last4}</Text>
                      <Text style={styles.cardTextSub}>{card.cardHolderName}</Text>
                    </View>
                    {isSelected && <CheckCircle size={24} color="#2563EB" />}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity 
                style={styles.paymentButton}
                onPress={onAddNewCard}
              >
                <Plus size={24} color={'#2563EB'} />
                <Text style={styles.paymentButtonText}>Agregar Nueva Tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.paymentButton, 
                  selectedPayment?.type === 'Físico' && styles.paymentButtonSelected
                ]}
                onPress={() => setSelectedPayment({ type: 'Físico' })}
              >
                <Home size={24} color={selectedPayment?.type === 'Físico' ? '#2563EB' : '#6B7280'} />
                <Text style={styles.paymentButtonText}>Pago en Físico (Efectivo)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.checkoutButton} 
              onPress={handlePlaceOrder} 
              disabled={loading || !selectedPayment}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.checkoutButtonText}>Realizar Pedido</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


// --- Componente Principal (InicioSocio) ---
export default function InicioSocio() {
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [cart, setCart] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);

  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [savedCards, setSavedCards] = useState([]);
  const [isAddCardModalVisible, setIsAddCardModalVisible] = useState(false);

  // --- (INICIO DE MODIFICACIÓN) ---
  const [unreadPedidos, setUnreadPedidos] = useState(0); // Estado para el badge
  // --- (FIN DE MODIFICACIÓN) ---

  const user = auth.currentUser;
  const { getUserFullName } = useUsers();
  const navigation = useNavigation();

  useEffect(() => {
    setLoading(true);
    const unsubProductos = productoService.streamProductos(setProductos);
    const unsubAlmacenes = almacenService.streamAlmacenes(setAlmacenes);
    
    const loadCards = async () => {
      try {
        const cardsJson = await SecureStore.getItemAsync('savedCards');
        if (cardsJson) {
          setSavedCards(JSON.parse(cardsJson));
        }
      } catch (e) {
        console.error("No se pudieron cargar las tarjetas guardadas.", e);
      }
    };
    
    loadCards();
    setTimeout(() => setLoading(false), 500); 

    // --- (INICIO DE MODIFICACIÓN) ---
    // Suscribirse a las notificaciones de pedidos
    let unsubNotis = () => {};
    if(user) {
      unsubNotis = pedidoClienteService.streamNuevasNotificacionesSocio(
        user.uid, 
        (pedidos) => {
          setUnreadPedidos(pedidos.length); // Actualizar el contador
        }
      );
    }
    // --- (FIN DE MODIFICACIÓN) ---

    return () => {
      unsubProductos();
      unsubAlmacenes();
      unsubNotis(); // Limpiar el listener de notificaciones
    };
  }, [user]);

  const filterCategories = useMemo(() => {
    const categories = almacenes.map(a => a.materiaPrima);
    return ['all', ...new Set(categories)]; 
  }, [almacenes]);

  const filteredProducts = useMemo(() => {
    return productos.filter(producto => {
      const searchMatch = producto.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      let categoryMatch = true;
      if (selectedCategory !== 'all') {
        const almacen = almacenes.find(a => a.id === producto.almacenId);
        categoryMatch = almacen?.materiaPrima === selectedCategory;
      }
      return searchMatch && categoryMatch;
    });
  }, [productos, almacenes, searchQuery, selectedCategory]);

  const handleOpenQuantityModal = (producto) => {
    setSelectedProduct(producto);
    setIsQuantityModalVisible(true);
  };

  const handleConfirmAddToCart = (cantidad) => {
    if (!selectedProduct || cantidad <= 0) return;
    setCart(prevCart => [
      ...prevCart, 
      { 
        ...selectedProduct, 
        cartId: Date.now(),
        cantidad: cantidad 
      }
    ]);
    Alert.alert("¡Agregado!", `${cantidad} x ${selectedProduct.nombre} se ha(n) añadido al carrito.`);
    setIsQuantityModalVisible(false);
    setSelectedProduct(null);
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }, [cart]);

  const handleOpenCheckout = () => {
    setIsCartVisible(false);
    setIsCheckoutVisible(true);
  };

  const handlePlaceOrder = async (paymentMethod, paymentDetails, address) => {
    if (!user) {
      throw new Error("No se ha podido identificar al usuario.");
    }
    const itemsToSave = cart.map(({ cartId, ...item }) => item);
    const socioName = getUserFullName(user.uid) || user.email;
    
    await pedidoClienteService.createPedidoCliente(
      user.uid,
      socioName, 
      itemsToSave,
      cartTotal,
      paymentMethod,
      paymentDetails,
      address 
    );
    
    setCart([]);
    setIsCheckoutVisible(false);
  };
  
  const handleCardSaved = (newCards) => {
    setSavedCards(newCards);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          
          {/* --- (INICIO DE MODIFICACIÓN) --- */}
          {/* Botón "Mis Pedidos" con Badge */}
          <TouchableOpacity onPress={() => navigation.navigate('MisPedidos')} style={styles.cartButton}>
            <ClipboardCheck size={24} color="#1F2937" />
            {unreadPedidos > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{unreadPedidos}</Text>
              </View>
            )}
          </TouchableOpacity>
          {/* --- (FIN DE MODIFICACIÓN) --- */}

          <TouchableOpacity onPress={() => setIsCartVisible(true)} style={styles.cartButton}>
            <ShoppingCart size={24} color="#1F2937" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={{ paddingLeft: 12 }}>
            <LogOut size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar producto por nombre..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          {filterCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === category && styles.filterButtonTextActive
              ]}>
                {category === 'all' ? 'Todos' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ProductCard 
              item={item} 
              onAddToCart={handleOpenQuantityModal} 
              almacenes={almacenes} 
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartText}>No se encontraron productos.</Text>
            </View>
          }
        />
      )}

      {/* --- Modales --- */}
      <CartModal
        visible={isCartVisible}
        onClose={() => setIsCartVisible(false)}
        cart={cart}
        onRemove={handleRemoveFromCart}
        onCheckout={handleOpenCheckout}
        total={cartTotal}
      />
      <CheckoutModal
        visible={isCheckoutVisible}
        onClose={() => setIsCheckoutVisible(false)}
        total={cartTotal}
        onPlaceOrder={handlePlaceOrder}
        savedCards={savedCards} 
        onAddNewCard={() => {
          setIsCheckoutVisible(false); 
          setIsAddCardModalVisible(true); 
        }}
      />
      <QuantityModal
        visible={isQuantityModalVisible}
        onClose={() => setIsQuantityModalVisible(false)}
        producto={selectedProduct}
        onConfirm={handleConfirmAddToCart}
      />
      <AddCardModal
        visible={isAddCardModalVisible}
        onClose={() => {
          setIsAddCardModalVisible(false);
          setIsCheckoutVisible(true); 
        }}
        onCardSaved={(newCards) => {
          setSavedCards(newCards);
          setIsAddCardModalVisible(false);
          setIsCheckoutVisible(true); 
        }}
      />

    </SafeAreaView>
  );
}