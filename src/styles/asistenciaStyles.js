import { StyleSheet } from "react-native";

export default StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#f9fafb" },
  contentContainer: { 
    paddingTop: 20, // <-- CAMBIO: 10 -> 20 (Para la barra de notificaciones)
    paddingHorizontal: 10, // <-- AÑADIDO
    paddingBottom: 50 
  },
  listaContenedor: {
    marginHorizontal: 10,
    marginBottom: 20,
  },
  center: { justifyContent: "center", alignItems: "center" },
  cargandoText: { marginTop: 10, color: "#64748b", fontSize: 16 },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  scannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scannerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  scannerButton: {
    backgroundColor: "#ef4444", 
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  scannerButtonText: { color: "#fff", fontWeight: "500" },
  errorText: {
    textAlign: "center",
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#ef4444", 
  },
  encabezado: { marginBottom: 20, alignItems: "center" },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#047857" }, // <-- CAMBIO: 24 -> 22
  subtitulo: { fontSize: 14, color: "#64748b", textAlign: "center" }, 
  fecha: { fontSize: 14, color: "#475569", marginTop: 5 }, 

  // --- ESTILOS PARA ESTADÍSTICAS ---
  grillaEstadisticas: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 20,
    flexWrap: "wrap", 
    paddingHorizontal: 5,
  },
  tarjetaEstadistica: {
    backgroundColor: "#fff", 
    padding: 15,
    borderRadius: 8, 
    alignItems: "center", 
    width: "48%", 
    marginVertical: 5, 
    elevation: 2, 
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
    borderWidth: 2, 
    borderColor: 'transparent', 
  },
  tarjetaEstadisticaActiva: {
    borderColor: '#2563eb', 
    backgroundColor: '#eff6ff', 
  },
  etiquetaEstadistica: {
    fontSize: 12,
    color: "#64748b", 
    marginTop: 8,
    textAlign: "center",
  },
  valorEstadistica: {
    fontSize: 22, // <-- CAMBIO: 24 -> 22
    fontWeight: "bold",
    color: "#1e293b", 
    marginTop: 4,
  },
  // ---------------------------------------------

  contenidoPrincipal: {}, 
  tarjeta: {
    backgroundColor: "#fff", 
    borderRadius: 8, 
    padding: 15,
    marginBottom: 20, 
    elevation: 2, 
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
  },
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b", 
    marginBottom: 10,
  },
  headerTabla: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 10,
  },
  botonRefrescar: {
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#d1fae5", 
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4, 
  },
  textoRefrescar: {
    color: "#047857", 
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "500", 
  },
  seccion: { marginBottom: 15 }, 
  tituloSeccion: {
    fontSize: 14,
    fontWeight: "600", 
    color: "#1e293b", 
    marginBottom: 10,
  },
  filaBotones: { flexDirection: "row", gap: 10 }, 
  botonPrimario: {
    flex: 1, 
    backgroundColor: "#047857", 
    padding: 10, // <-- CAMBIO: 12 -> 10
    borderRadius: 6,
    alignItems: "center", 
    elevation: 1, 
  },
  botonSecundario: {
    flex: 1, 
    borderWidth: 1,
    borderColor: "#d1d5db", 
    padding: 10, // <-- CAMBIO: 12 -> 10
    borderRadius: 6,
    alignItems: "center", 
    backgroundColor: "#fff", 
  },
  textoBoton: { color: "#fff", fontWeight: "500", fontSize: 14 }, 
  entrada: { 
    borderWidth: 1,
    borderColor: "#d1d5db", 
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 16,
  },
  filaTabla: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1, 
    borderBottomColor: "#e5e7eb", 
    alignItems: "center", 
    backgroundColor: "#fff", 
  },
  celdaTabla: { 
    flex: 1, 
    textAlign: "center", 
    color: "#1e293b", 
    fontSize: 12,
    paddingHorizontal: 2, 
  },
  celdaEstado: { 
    width: 95, 
    justifyContent: "center",
    alignItems: "center",
  },
  insignia: { 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: "center", 
    minWidth: 80, 
    alignItems: "center", 
    flexShrink: 0, 
  },
  emptyContainer: { 
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff", 
    borderBottomLeftRadius: 8, 
    borderBottomRightRadius: 8,
  },
  emptyText: { marginTop: 10, color: "#9ca3af", fontSize: 14 }, 
  botonLogout: { 
    backgroundColor: "#ef4444", 
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 10,
  },
  resetFiltroTexto: {
      fontSize: 12,
      fontWeight: 'normal',
      color: '#2563eb', 
  },
});