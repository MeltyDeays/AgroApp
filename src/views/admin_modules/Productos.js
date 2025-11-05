// src/views/admin_modules/Productos.js
import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/adminStyles'; // Ajusta la ruta

// Placeholder simple
const PlaceholderComponent = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 }}>{name}</Text>
    <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
      Este módulo se implementará en futuras versiones.
    </Text>
  </View>
);

export default function Productos() {
    // Envuelto en ScrollView por si acaso el contenido crece
    return <PlaceholderComponent name="Gestión de Productos" />;
}
