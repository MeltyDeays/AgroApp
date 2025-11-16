
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions, 
  StyleSheet,
  Alert,  
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Users, DollarSign, Package, Sprout, AlertCircle, TrendingUp, TrendingDown, CheckSquare, UserCheck, Download } from 'lucide-react-native';
import { BarChart, PieChart } from "react-native-chart-kit";


import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot'; 
import ExportModal from '../../components/ExportModal'; 


import { useUsers } from '../../context/UserContext';
import * as asistenciaService from '../../services/asistenciaService';
import * as pedidoClienteService from '../../services/pedidoClienteService';
import * as pedidoProveedorService from '../../services/pedidoProveedorService';
import * as mapaService from '../../services/mapaService';
import * as almacenService from '../../services/almacenService';
import * as maquinariaService from '../../services/maquinariaService';
import { auth } from '../../../firebaseConfig';

import styles from '../../styles/dashboardStyles';

const screenWidth = Dimensions.get('window').width - 32;


const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
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
  alertWarningBg: '#FEF9C3',
  alertWarningText: '#B45309',
  alertInfoBg: '#DBEAFE',
  alertInfoText: '#1E40AF',
  alertSuccessBg: '#D1FAE5',
  alertSuccessText: '#047857',
};

const INITIAL_STATS = [
  { label: 'Empleados Activos', value: '0', change: '+0%', icon: Users, color: styles.bgBlue },
  { label: 'Ganancias (Mes)', value: 'C$ 0', change: '+0%', icon: DollarSign, color: styles.bgGreen },
  { label: 'Pedidos (Mes)', value: '0', change: '+0%', icon: Package, color: styles.bgPurple },
  { label: 'Sectores Activos', value: '0', change: '+0%', icon: Sprout, color: styles.bgYellow },
];
const INITIAL_BAR_DATA = {
  labels: ["-", "-", "-", "-", "-"],
  datasets: [
    { data: [0, 0, 0, 0, 0], color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})` },
    { data: [0, 0, 0, 0, 0], color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})` }
  ],
  legend: ["Ganancias", "Gastos"]
};
const INITIAL_PIE_DATA = [
  { name: 'Sin datos', population: 1, color: '#E5E7EB', legendFontColor: '#6B7280', legendFontSize: 14 },
];

const calcularCambio = (nuevo, viejo) => {
  if (viejo === 0) return nuevo > 0 ? '+100%' : '+0%';
  const diff = ((nuevo - viejo) / viejo) * 100;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(0)}%`;
};

const StatCard = ({ label, value, change, icon: Icon, color }) => {
  const isPositive = !change.startsWith('-');
  return (
    <View style={styles.statCard}>
       <View style={styles.statCardRow}>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <View style={[styles.statIconContainer, color]}>
          <Icon size={24} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.statChangeContainer}>
        {isPositive ? <TrendingUp size={16} color={COLORS.green} /> : <TrendingDown size={16} color={COLORS.red} />}
        <Text style={[styles.statChangeText, isPositive ? styles.statChangePositive : styles.statChangeNegative]}>
          {change} vs mes anterior
        </Text>
      </View>
    </View>
  );
};
const AlertRow = ({ type, message, icon: Icon = AlertCircle }) => {
  const styleMap = {
    warning: { bg: styles.alertWarningBg, text: styles.alertWarningText, iconColor: COLORS.alertWarningText },
    info: { bg: styles.alertInfoBg, text: styles.alertInfoText, iconColor: COLORS.alertInfoText },
    success: { bg: styles.alertSuccessBg, text: styles.alertSuccessText, iconColor: COLORS.alertSuccessText },
  };
  const { bg, text, iconColor } = styleMap[type] || styleMap.info;
  return (
    <View style={[styles.alertRow, bg]}>
      <Icon size={20} color={iconColor} />
      <Text style={[styles.alertText, text]}>{message}</Text>
    </View>
  );
};
const ProductTableRow = ({ name, percent, earnings, color }) => {
  return (
    <View style={styles.tableRow}>
      <View style={styles.tableCellProduct}>
        <View style={[styles.colorSwatch, { backgroundColor: color }]} />
        <Text style={styles.tableCell}>{name}</Text>
      </View>
      <Text style={[styles.tableCell, styles.tableCellPercent]}>{percent}%</Text>
      <Text style={[styles.tableCell, styles.tableCellEarnings]}>C$ {earnings.toLocaleString()}</Text>
    </View>
  );
};



export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { users } = useUsers(); 
  
  const [stats, setStats] = useState(INITIAL_STATS);
  const [alerts, setAlerts] = useState([]);
  const [barData, setBarData] = useState(INITIAL_BAR_DATA);
  const [pieData, setPieData] = useState(INITIAL_PIE_DATA);

  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportContext, setExportContext] = useState({ ref: null, data: [], name: '' });

  
  useEffect(() => {
    
    setLoading(true);
    const adminId = auth.currentUser?.uid;
    if (!adminId) {
      setLoading(false);
      setAlerts(prev => [...prev, { type: 'error', message: 'No se pudo identificar al administrador.' }]);
      return;
    }
    let allPedidosSocios = [];
    let allPedidosProv = [];
    let allMaquinas = [];
    let allAlmacenes = [];
    const procesarGraficos = () => {
      const pedidosCompletados = allPedidosSocios.filter(p => p.estado === 'Completado' && p.fechaCompletado);
      const gastosCompletados = allPedidosProv.filter(p => p.estado === 'Recibido' && p.fechaCreacion);
      const ahora = new Date();
      const labels = [];
      const dataGanancias = [];
      const dataGastos = [];
      let totalGananciasMesActual = 0;
      let totalGananciasMesPasado = 0;
      let totalPedidosMesActual = 0;
      let totalPedidosMesPasado = 0;
      for (let i = 4; i >= 0; i--) {
        const mes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const inicio = mes;
        const fin = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 0, 23, 59, 59);
        labels.push(mes.toLocaleString('es-ES', { month: 'short' }));
        const pedidosDelMes = pedidosCompletados.filter(p => {
          const fecha = p.fechaCompletado.toDate();
          return fecha >= inicio && fecha <= fin;
        });
        const gananciaMes = pedidosDelMes.reduce((sum, p) => sum + p.totalPedido, 0);
        dataGanancias.push(gananciaMes);
        const gastosDelMes = gastosCompletados.filter(p => {
            const fecha = p.fechaCreacion.toDate(); 
            return fecha >= inicio && fecha <= fin;
        });
        const gastoMes = gastosDelMes.reduce((sum, p) => sum + (p.totalPedido || 0), 0); 
        dataGastos.push(gastoMes);
        if (i === 0) { 
          totalGananciasMesActual = gananciaMes;
          totalPedidosMesActual = pedidosDelMes.length;
        } else if (i === 1) { 
          totalGananciasMesPasado = gananciaMes;
          totalPedidosMesPasado = pedidosDelMes.length;
        }
      }
      setBarData({
        labels: labels,
        datasets: [
          { data: dataGanancias, color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})` },
          { data: dataGastos, color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})` }
        ],
        legend: ["Ganancias", "Gastos"]
      });
      let productoMap = new Map();
      const pedidosRecientes = pedidosCompletados.filter(p => p.fechaCompletado.toDate() >= new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)); 
      for (const pedido of pedidosRecientes) {
        for (const item of pedido.items) {
          const totalItem = item.precio * item.cantidad;
          productoMap.set(item.nombre, (productoMap.get(item.nombre) || 0) + totalItem);
        }
      }
      const gananciasPorProducto = Array.from(productoMap.entries()).map(([nombre, poblacion], index) => ({
        name: nombre,
        population: parseFloat(poblacion.toFixed(0)),
        color: PIE_COLORS[index % PIE_COLORS.length],
        legendFontColor: '#1F2937',
        legendFontSize: 14,
      })).sort((a, b) => b.population - a.population);
      if (gananciasPorProducto.length > 0) {
        setPieData(gananciasPorProducto);
      } else {
        setPieData(INITIAL_PIE_DATA);
      }
      setStats(prev => [
        prev[0], 
        { ...prev[1], value: `C$ ${totalGananciasMesActual.toLocaleString()}`, change: calcularCambio(totalGananciasMesActual, totalGananciasMesPasado) },
        { ...prev[2], value: totalPedidosMesActual.toString(), change: calcularCambio(totalPedidosMesActual, totalPedidosMesPasado) },
        prev[3] 
      ]);
    };
    const unsubPedidos = pedidoClienteService.streamPedidosAdmin((pedidos) => {
      allPedidosSocios = pedidos;
      procesarGraficos();
    });
    const unsubGastos = pedidoProveedorService.streamPedidosAdmin(adminId, (pedidos) => {
      allPedidosProv = pedidos;
      procesarGraficos();
    });
    const unsubAlmacenes = almacenService.streamAlmacenes(almacenes => {
      allAlmacenes = almacenes;
      const alertasStock = allAlmacenes.filter(a => 
        (a.cantidadActual / a.capacidadMaxima) < 0.2 
      ).map(a => ({
        type: 'warning',
        message: `Stock bajo en "${a.nombre}": ${(a.cantidadActual / a.capacidadMaxima * 100).toFixed(0)}% restante.`
      }));
      setAlerts(prev => [...prev.filter(a => !a.message.startsWith('Stock bajo')), ...alertasStock]);
    });
    const unsubMaquinaria = maquinariaService.streamMaquinas(maquinas => {
      allMaquinas = maquinas;
      const alertasMaq = allMaquinas.filter(m => 
        m.status === 'maintenance' || m.status === 'broken'
      ).map(m => ({
        type: 'info',
        message: `La máquina "${m.name}" requiere atención (${m.status}).`,
        icon: AlertCircle,
      }));
      setAlerts(prev => [...prev.filter(a => !a.message.startsWith('La máquina')), ...alertasMaq]);
    });
    mapaService.fetchTareas().then(tareas => {
      const hoy = new Date();
      const tareasVencidas = tareas.filter(t => t.estado === 'pendiente' && t.fechaFin.toDate() < hoy);
      if (tareasVencidas.length > 0) {
        setAlerts(prev => [...prev, {
          type: 'warning',
          message: `${tareasVencidas.length} tareas de cultivo están vencidas.`,
          icon: AlertCircle,
        }]);
      }
    });
    mapaService.fetchSectores().then(sectores => {
      setStats(prev => [
        prev[0], prev[1], prev[2],
        { ...prev[3], value: sectores.length.toString(), change: '+0%' } 
      ]);
    });
    setLoading(false);
    return () => {
      unsubPedidos();
      unsubGastos();
      unsubAlmacenes();
      unsubMaquinaria();
    };
  }, []); 

  useEffect(() => {
    if (users && users.length > 0) {
      const empleadosActivos = users.filter(u => u.rol === 'empleado').length;
      setStats(prev => [
        { ...prev[0], value: empleadosActivos.toString() }, 
        prev[1], prev[2], prev[3]
      ]);
      asistenciaService.obtenerRegistrosAsistencia().then(registrosHoy => {
        const presentes = registrosHoy.filter(r => r.estado === 'Presente' || r.estado === 'Completado').length;
        const alertAsistencia = { 
          type: 'success', 
          message: `Asistencia del día: ${presentes}/${empleadosActivos} empleados presentes.`,
          icon: UserCheck,
        };
        setAlerts(prev => [alertAsistencia, ...prev.filter(a => !a.message.startsWith('Asistencia'))]);
      });
    }
  }, [users]); 

  

  

  const openExportModal = (ref, data, name) => {
    setExportContext({ ref, data, name });
    setIsModalVisible(true);
  };

  const closeExportModal = () => {
    setIsModalVisible(false);
    if (!exportLoading) {
      setExportContext({ ref: null, data: [], name: '' });
    }
  };
  
  /**
   * Función central para llamar a la Lambda
   */
  const handleAPExport = async (exportType) => {
    
    const API_GATEWAY_URL = 'https://m93lnwukg4.execute-api.us-east-2.amazonaws.com/generarexcel';
    
    setExportLoading(true);
    closeExportModal(); 
    
    const { ref, data, name } = exportContext;
    let requestBody = { exportType };

    try {
      if (exportType === 'image') {
        if (!ref) throw new Error("Referencia de vista no encontrada.");
        const uri = await ref.current.capture();
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' }); 
        
        requestBody.filename = `${name}.png`;
        requestBody.imageBase64 = base64;

      } else if (exportType === 'json') {
        requestBody.filename = `${name}.json`;
        requestBody.data = data;
        
      } else if (exportType === 'excel') {
        let excelData;
        if (name === 'reporte_ganancias_producto') {
          excelData = data.map(p => ({ Producto: p.name, Ganancias: p.population }));
        } else if (name === 'reporte_ganancias_vs_gastos') {
          excelData = data.labels.map((label, index) => ({
            Mes: label,
            Ganancias: data.datasets[0].data[index],
            Gastos: data.datasets[1].data[index]
          }));
        } else {
          excelData = data; 
        }
        
        if (excelData.length === 0 || (excelData[0]?.Producto === 'Sin datos')) {
           throw new Error("No hay datos válidos para exportar a Excel.");
        }

        requestBody.filename = `${name}.xlsx`;
        requestBody.data = excelData;
      }
      
      
      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();

      if (!response.ok || !result.base64Body) {
        throw new Error(result.error || result.mensaje || "Error en la respuesta de la Lambda");
      }
      
      
      const { filename, contentType, base64Body } = result;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64Body, {
        encoding: 'base64', 
      });

      setExportLoading(false);
      await Sharing.shareAsync(fileUri, {
        mimeType: contentType,
        dialogTitle: `Exportar ${name}`,
      });

    } catch (error) {
      setExportLoading(false);
      console.error(`Error al exportar como ${exportType}:`, error);
      Alert.alert("Error de Exportación", `No se pudo completar la exportación: ${error.message}`);
    }
  };


  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };
  
  
  const ExportButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={exportButtonStyles.button} disabled={exportLoading}>
      <Download size={16} color="#2563EB" />
      <Text style={exportButtonStyles.text}>Exportar</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.bgLight}}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollView}>
        
        {/* Indicador de carga de exportación */}
        {exportLoading && (
          <View style={exportButtonStyles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.blue} />
            <Text style={exportButtonStyles.loadingText}>Generando exportación...</Text>
          </View>
        )}

        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Resumen general de tu granja</Text>

        {/* --- Rejilla de Estadísticas --- */}
        <View style={styles.grid}>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </View>

        {/* --- Alertas --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alertas y Notificaciones</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.blue} />
          ) : (
            alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <AlertRow key={index} type={alert.type} message={alert.message} icon={alert.icon} />
              ))
            ) : (
              <Text style={{ color: COLORS.textSecondary }}>No hay alertas por el momento.</Text>
            )
          )}
        </View>

        {/* --- Gráfico de Barras --- */}
        <View style={styles.card}>
          <ViewShot ref={barChartRef} options={{ format: 'png', quality: 0.9 }}>
            <View>
              <Text style={styles.cardTitle}>Ganancias vs Gastos (Últimos 5 meses)</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.green} />
                </View>
              ) : (
                <View style={styles.chartContainer}>
                  <BarChart
                    data={barData}
                    width={screenWidth - 32} 
                    height={220}
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    fromZero={true}
                    showValuesOnTopOfBars={false}
                    withHorizontalLabels={true}
                    withInnerLines={true}
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </View>
              )}
            </View>
          </ViewShot>
          <ExportButton onPress={() => openExportModal(barChartRef, barData, 'reporte_ganancias_vs_gastos')} />
        </View>


        {/* --- Gráfico de Pastel --- */}
        <View style={styles.card}>
          <ViewShot ref={pieChartRef} options={{ format: 'png', quality: 0.9 }}>
            <View>
              <Text style={styles.cardTitle}>Ganancias por Producto (Últimos 30 días)</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.purple} />
                </View>
              ) : (
                <View style={styles.chartContainer}>
                  <PieChart
                    data={pieData}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 0]}
                    absolute={false} 
                  />
                </View>
              )}
            </View>
          </ViewShot>
          <ExportButton onPress={() => openExportModal(pieChartRef, pieData, 'reporte_ganancias_producto')} />
        </View>
        
        
        {/* --- Tabla de Productos --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalles de Ganancias por Producto</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Producto</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Porcentaje</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Ganancias</Text>
          </View>
          {loading ? (
             <ActivityIndicator size="small" color={COLORS.textSecondary} />
          ) : (
            pieData.map((product, index) => {
              const total = pieData.reduce((sum, p) => sum + p.population, 0);
              if (total === 0 || product.population === 0) {
                return <ProductTableRow key={index} name={product.name} percent={"0"} earnings={0} color={product.color} />
              }
              const percent = ((product.population / total) * 100).toFixed(0);
              return (
                <ProductTableRow
                  key={index}
                  name={product.name}
                  percent={percent}
                  earnings={product.population}
                  color={PIE_COLORS[index % PIE_COLORS.length]}
                />
              )
            })
          )}
        </View>

        {/* --- Renderizar el Modal --- */}
        <ExportModal
          visible={isModalVisible}
          onClose={closeExportModal}
          onExportImage={() => handleAPExport('image')}
          onExportExcel={() => handleAPExport('excel')}
          onExportJSON={() => handleAPExport('json')}
        />

      </ScrollView>
    </SafeAreaView>
  );
}


const exportButtonStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  text: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, 
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  }
});