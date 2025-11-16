// src/styles/dashboardStyles.js
import { StyleSheet } from 'react-native';

const COLORS = {
  white: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  borderLight: '#E5E7EB',
  borderFaint: '#F3F4F6',
  bgLight: '#F9FAFB',
  blue: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  
  // Fondos de Alerta
  alertWarningBg: '#FEF9C3',
  alertWarningText: '#B45309',
  alertInfoBg: '#DBEAFE',
  alertInfoText: '#1E40AF',
  alertSuccessBg: '#D1FAE5',
  alertSuccessText: '#047857',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  // --- Contenedor de Tarjeta Genérico ---
  card: {
    backgroundColor: COLORS.white,
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
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  // --- Rejilla de Estadísticas ---
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48.5%', // Para 2 columnas con espacio
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statChangeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statChangePositive: {
    color: COLORS.green,
  },
  statChangeNegative: {
    color: COLORS.red,
  },
  // --- Colores de Iconos ---
  bgBlue: { backgroundColor: COLORS.blue },
  bgGreen: { backgroundColor: COLORS.green },
  bgPurple: { backgroundColor: COLORS.purple },
  bgYellow: { backgroundColor: COLORS.yellow },

  // --- Alertas ---
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  alertWarningBg: { backgroundColor: COLORS.alertWarningBg },
  alertWarningText: { color: COLORS.alertWarningText },
  alertInfoBg: { backgroundColor: COLORS.alertInfoBg },
  alertInfoText: { color: COLORS.alertInfoText },
  alertSuccessBg: { backgroundColor: COLORS.alertSuccessBg },
  alertSuccessText: { color: COLORS.alertSuccessText },

  // --- Tabla ---
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.borderFaint,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  tableCellProduct: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableCellPercent: {
    flex: 2,
    textAlign: 'right',
  },
  tableCellEarnings: {
    flex: 2,
    textAlign: 'right',
    color: COLORS.green,
    fontWeight: '600',
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  // --- Contenedor de Gráfico ---
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  }
});