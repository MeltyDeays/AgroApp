// src/views/empleado/GestionMaquinariaEmpleado.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Cog,
  CheckCircle,
  AlertCircle,
  Calendar,
  Wrench,
  Tractor,
  ArrowDownAZ,
  ArrowUpZA,
  Check,
} from "lucide-react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { RadioButton } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import styles from "../../styles/maquinariaEmpleadoStyles";
import * as MaquinariaService from "../../services/maquinariaService";
import { auth } from "../../../firebaseConfig";
import { useUsers } from "../../context/UserContext"; // <-- IMPORTADO
import {
  FILTRO_TIPOS_MAQUINARIA,
  FILTRO_ESTADOS_MAQUINARIA,
} from "../../constants/maquinariaConstants";

const MaquinariaAsignada = ({ assignedMachines, onMarkComplete }) => {
  if (assignedMachines.length === 0) {
    return null;
  }
  return (
    <View style={styles.assignedContainer}>
      <Text style={styles.assignedTitle}>Mi Maquinaria Asignada</Text>
      {assignedMachines.map((machine) => (
        <View key={machine.id} style={styles.assignedCard}>
          <Image
            style={styles.assignedCardImage}
            source={{
              uri:
                machine.imageUrl ||
                "https://images.unsplash.com/photo-1551406815-a3a8069f1a23?w=500",
            }}
          />
          <View style={styles.assignedCardContent}>
            <Text style={styles.assignedMachineName}>{machine.name}</Text>
            <Text style={styles.assignedMachineId}>{machine.id}</Text>
            <TouchableOpacity
              style={styles.buttonComplete}
              onPress={() => onMarkComplete(machine)}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Marcar como Tarea Completada</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

export default function GestionMaquinariaEmpleado() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const { getUserFullName } = useUsers(); // <-- USANDO EL HOOK
  const [machines, setMachines] = useState([]);
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [formState, setFormState] = useState({
    startDate: "",
    endDate: "",
    sector: "",
  });
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintFormState, setMaintFormState] = useState({
    description: "",
    priority: "low",
  });

  useEffect(() => {
    const unsubscribeAll = MaquinariaService.streamMaquinas((machinesData) => {
      setMachines(machinesData);
      if (loading) setLoading(false);
    });
    let unsubscribeAssigned;
    if (user?.uid) {
      unsubscribeAssigned = MaquinariaService.streamMaquinasAsignadas(
        user.uid,
        (assignedData) => {
          setAssignedMachines(assignedData);
        }
      );
    }
    return () => {
      unsubscribeAll();
      if (unsubscribeAssigned) unsubscribeAssigned();
    };
  }, [user, loading]);

  const handleMarkComplete = async (machine) => {
    Alert.alert(
      "Confirmar Devolución",
      `¿Estás seguro de que quieres devolver la máquina "${machine.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const fullName = user.displayName || `${getUserFullName(user.uid)}`;
              await MaquinariaService.marcarTareaCompletada(
                machine,
                user.uid,
                fullName
              );
              Alert.alert("Éxito", "La máquina ha sido devuelta y está disponible.");
            } catch (error) {
              console.error("Error al marcar como completada: ", error);
              Alert.alert("Error", "No se pudo completar la acción.");
            }
          },
        },
      ]
    );
  };

  const filteredMachines = useMemo(() => {
    let machinesToShow = [...machines];
    if (searchQuery) {
      machinesToShow = machinesToShow.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedType !== "todos") {
      machinesToShow = machinesToShow.filter((m) => m.type === selectedType);
    }
    if (selectedStatus !== "todos") {
      machinesToShow = machinesToShow.filter(
        (m) => m.status === selectedStatus
      );
    }
    machinesToShow.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
    return machinesToShow;
  }, [machines, searchQuery, selectedType, selectedStatus, sortOrder]);

  const stats = useMemo(
    () => ({
      total: filteredMachines.length,
      available: filteredMachines.filter((m) => m.status === "available")
        .length,
      inUse: filteredMachines.filter((m) => m.status === "in-use").length,
      needsMaintenance: filteredMachines.filter(
        (m) => m.status === "maintenance" || m.status === "broken"
      ).length,
    }),
    [filteredMachines]
  );

  const handleConfirmReservation = async () => {
    const { startDate, endDate, sector } = formState;
    if (!startDate || !endDate || !sector) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    const parts = startDate.split('-').map(Number);
    const start = new Date(parts[0], parts[1] - 1, parts[2]); // Month is 0-indexed

    const end = new Date(endDate);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (end < start) {
      Alert.alert("Error", "La fecha de devolución no puede ser anterior a la de inicio.");
      return;
    }
    if (start < today) {
      Alert.alert("Error", "La fecha de inicio no puede ser en el pasado.");
      return;
    }
    if (!selectedMachine || !user) {
      Alert.alert("Error", "No hay máquina o usuario seleccionado.");
      return;
    }
    const reservaData = {
      machineId: selectedMachine.id,
      machineName: selectedMachine.name,
      requestedById: user?.uid, // <-- SOLO EL ID
      sector: formState.sector,
      startDate: formState.startDate,
      endDate: formState.endDate,
    };
    try {
      await MaquinariaService.crearSolicitudReserva(reservaData);
      Alert.alert("Éxito", "Solicitud de reserva enviada.");
      closeReserveDialog();
    } catch (error) {
      console.error("Error al crear reserva: ", error);
      Alert.alert("Error", "Hubo un error al enviar la solicitud.");
    }
  };
  
  const openReserveDialog = (machine) => {
    setSelectedMachine(machine);
    setIsReserveDialogOpen(true);
  };
  const closeReserveDialog = () => {
    setIsReserveDialogOpen(false);
    setSelectedMachine(null);
    setFormState({ startDate: "", endDate: "", sector: "" });
  };
  const handleConfirmStartDate = (date) => {
    setFormState((s) => ({ ...s, startDate: date.toISOString().split("T")[0] }));
    setStartDatePickerVisible(false);
  };
  const handleConfirmEndDate = (date) => {
    setFormState((s) => ({ ...s, endDate: date.toISOString().split("T")[0] }));
    setEndDatePickerVisible(false);
  };
  const openMaintModal = (machine) => {
    setSelectedMachine(machine);
    setIsMaintModalOpen(true);
  };
  const closeMaintModal = () => {
    setIsMaintModalOpen(false);
    setSelectedMachine(null);
    setMaintFormState({ description: "", priority: "low" });
  };

  const handleConfirmMaintRequest = async () => {
    const { description, priority } = maintFormState;
    if (!description) {
      Alert.alert("Error", "Por favor describe el problema.");
      return;
    }
    if (!selectedMachine || !user) {
      Alert.alert("Error", "No hay máquina o usuario seleccionado.");
      return;
    }
    const mantenimientoData = {
      machineId: selectedMachine.id,
      machineName: selectedMachine.name,
      requestedById: user?.uid,
      description: description,
      priority: priority,
    };
    try {
      await MaquinariaService.crearSolicitudMantenimiento(mantenimientoData);
      Alert.alert("Éxito", "Solicitud de mantenimiento enviada.");
      closeMaintModal();
    } catch (error) {
      console.error("Error al crear solicitud de mantenimiento: ", error);
      Alert.alert("Error", "Hubo un error al enviar la solicitud.");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { style: styles.badgeAvailable, text: "Disponible" },
      "in-use": { style: styles.badgeInUse, text: "En Uso" },
      maintenance: { style: styles.badgeMaintenance, text: "Mantenimiento" },
      broken: { style: styles.badgeBroken, text: "Averiada" },
    };
    const { style, text } = statusMap[status] || statusMap.broken;
    return (
      <View style={[styles.badge, style]}>
        <Text style={[styles.badgeText, { color: style.color }]}>{text}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
        >
          <ArrowLeft size={20} color="#6B7280" />
          <Text style={{ color: "#6B7280", marginLeft: 4 }}>Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Gestión de Maquinaria</Text>
        <Text style={styles.headerSubtitle}>Administra y reserva maquinaria</Text>

        <MaquinariaAsignada
          assignedMachines={assignedMachines}
          onMarkComplete={handleMarkComplete}
        />

        <View style={styles.filterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedType}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
            >
              {FILTRO_TIPOS_MAQUINARIA.map((tipo) => (
                <Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedStatus(itemValue)}
            >
              {FILTRO_ESTADOS_MAQUINARIA.map((estado) => (
                <Picker.Item key={estado.value} label={estado.label} value={estado.value} />
              ))}
            </Picker>
          </View>
          <View style={styles.sortRow}>
            <TouchableOpacity
              style={[styles.sortButton, { marginRight: 8 }, sortOrder === "asc" && styles.sortButtonActive]}
              onPress={() => setSortOrder("asc")}
            >
              <ArrowDownAZ size={18} color={sortOrder === "asc" ? "#10B981" : "#6B7280"} />
              <Text style={styles.sortButtonText}>A-Z</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, { marginLeft: 8 }, sortOrder === "desc" && styles.sortButtonActive]}
              onPress={() => setSortOrder("desc")}
            >
              <ArrowUpZA size={18} color={sortOrder === "desc" ? "#10B981" : "#6B7280"} />
              <Text style={styles.sortButtonText}>Z-A</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { marginRight: 8 }]}><Cog size={28} color="#6B7280" /><Text style={styles.statLabel}>Total</Text><Text style={styles.statValue}>{stats.total}</Text></View>
          <View style={[styles.statCard, { marginLeft: 8 }]}><CheckCircle size={28} color="#10B981" /><Text style={styles.statLabel}>Disponible</Text><Text style={[styles.statValue, { color: "#10B981" }]}>{stats.available}</Text></View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { marginRight: 8 }]}><Calendar size={28} color="#2563EB" /><Text style={styles.statLabel}>En Uso</Text><Text style={[styles.statValue, { color: "#2563EB" }]}>{stats.inUse}</Text></View>
          <View style={[styles.statCard, { marginLeft: 8 }]}><AlertCircle size={28} color="#EF4444" /><Text style={styles.statLabel}>Mantenimiento</Text><Text style={[styles.statValue, { color: "#EF4444" }]}>{stats.needsMaintenance}</Text></View>
        </View>

        {filteredMachines.length > 0 ? (
          filteredMachines.map((machine) => (
            <View key={machine.id} style={styles.machineCard}>
              <Image style={styles.cardImage} source={{ uri: machine.imageUrl || "https://images.unsplash.com/photo-1551406815-a3a8069f1a23?w=500" }} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}><Text style={styles.machineName}>{machine.name}</Text>{getStatusBadge(machine.status)}</View>
                <Text style={styles.machineId}>{machine.id}</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Tipo:</Text><Text style={styles.detailValue}>{machine.type}</Text></View>
                {machine.assignedToId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Asignado a:</Text>
                    <Text style={styles.detailValue}>{getUserFullName(machine.assignedToId)}</Text>
                  </View>
                )}
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}><Text style={styles.detailLabel}>Próx. Mant.:</Text><Text style={styles.detailValue}>{machine.nextMaintenance || "N/A"}</Text></View>
                <TouchableOpacity style={machine.status === "available" ? styles.buttonReserve : styles.buttonDisabled} onPress={() => openReserveDialog(machine)} disabled={machine.status !== "available"}>
                  <Text style={styles.buttonText}>{machine.status === "available" ? "Reservar" : "No Disponible"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonReport} onPress={() => openMaintModal(machine)}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}><Wrench size={16} color="#EF4444" style={{ marginRight: 8 }} /><Text style={styles.buttonReportText}>Reportar Falla</Text></View>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", color: "#6B7280", marginVertical: 40 }}>No se encontraron máquinas.</Text>
        )}
      </ScrollView>

      <Modal visible={isReserveDialogOpen} transparent={true} animationType="fade" onRequestClose={closeReserveDialog}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Reservar: {selectedMachine?.name}</Text>{selectedMachine?.imageUrl ? <Image source={{ uri: selectedMachine.imageUrl }} style={styles.modalImagePreview} resizeMode="cover" /> : <View style={styles.modalImagePreviewPlaceholder}><Tractor size={24} color="#9CA3AF" /></View>}<TextInput style={styles.input} placeholder="Sector de Trabajo (Ej: Lote 5)" value={formState.sector} onChangeText={(text) => setFormState((s) => ({ ...s, sector: text }))} /><TouchableOpacity style={styles.input} onPress={() => setStartDatePickerVisible(true)}><Text style={formState.startDate ? {} : { color: "#9CA3AF" }}>{formState.startDate || "Fecha de Inicio (YYYY-MM-DD)"}</Text></TouchableOpacity><TouchableOpacity style={styles.input} onPress={() => setEndDatePickerVisible(true)}><Text style={formState.endDate ? {} : { color: "#9CA3AF" }}>{formState.endDate || "Fecha de Devolución (YYYY-MM-DD)"}</Text></TouchableOpacity><View style={styles.modalButtonRow}><TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeReserveDialog}><Text style={styles.modalButtonTextCancel}>Cancelar</Text></TouchableOpacity><TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleConfirmReservation}><Text style={styles.modalButtonTextConfirm}>Confirmar</Text></TouchableOpacity></View></View></View>
      </Modal>

      <Modal visible={isMaintModalOpen} transparent={true} animationType="fade" onRequestClose={closeMaintModal}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Reportar Falla: {selectedMachine?.name}</Text>{selectedMachine?.imageUrl ? <Image source={{ uri: selectedMachine.imageUrl }} style={styles.modalImagePreview} resizeMode="cover" /> : <View style={styles.modalImagePreviewPlaceholder}><Tractor size={24} color="#9CA3AF" /></View>}<Text style={styles.priorityLabel}>Descripción del Problema</Text><TextInput style={styles.inputMultiline} placeholder="Describe el problema..." value={maintFormState.description} onChangeText={(text) => setMaintFormState((s) => ({ ...s, description: text }))} multiline={true} numberOfLines={4} /><Text style={styles.priorityLabel}>Nivel de Prioridad</Text><RadioButton.Group onValueChange={(newValue) => setMaintFormState((s) => ({ ...s, priority: newValue }))} value={maintFormState.priority}><TouchableOpacity style={styles.radioItem} onPress={() => setMaintFormState((s) => ({ ...s, priority: "low" }))}><RadioButton value="low" color="#10B981" /><Text style={styles.radioLabel}>Baja (Puede operar)</Text></TouchableOpacity><TouchableOpacity style={styles.radioItem} onPress={() => setMaintFormState((s) => ({ ...s, priority: "medium" }))}><RadioButton value="medium" color="#F59E0B" /><Text style={styles.radioLabel}>Media (Precaución)</Text></TouchableOpacity><TouchableOpacity style={styles.radioItem} onPress={() => setMaintFormState((s) => ({ ...s, priority: "high" }))}><RadioButton value="high" color="#EF4444" /><Text style={styles.radioLabel}>Alta (No usar)</Text></TouchableOpacity></RadioButton.Group><View style={styles.modalButtonRow}><TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeMaintModal}><Text style={styles.modalButtonTextCancel}>Cancelar</Text></TouchableOpacity><TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleConfirmMaintRequest}><Text style={styles.modalButtonTextConfirm}>Enviar Reporte</Text></TouchableOpacity></View></View></View>
      </Modal>

      <DateTimePickerModal isVisible={isStartDatePickerVisible} mode="date" onConfirm={handleConfirmStartDate} onCancel={() => setStartDatePickerVisible(false)} />
      <DateTimePickerModal isVisible={isEndDatePickerVisible} mode="date" onConfirm={handleConfirmEndDate} onCancel={() => setEndDatePickerVisible(false)} />
    </SafeAreaView>
  );
}
