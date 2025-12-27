import { useEffect, useState, useCallback, useContext } from "react";
import { FlatList, TouchableOpacity, StyleSheet, View } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { AppointmentRefreshContext } from "@/contexts/appointmentRefreshContext";

export default function PatientAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [patientId, setPatientId] = useState("");

  const { refreshAppointments } = useContext(AppointmentRefreshContext);

  useEffect(() => {
    const loadPatientId = async () => {
      const id = await AsyncStorage.getItem("patientId");
      setPatientId(id || "");
    };
    loadPatientId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (patientId) fetchAppointments();
    }, [patientId])
  );

  useEffect(() => {
    if (patientId) fetchAppointments();
  }, [refreshAppointments]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/${patientId}/appointments`
      );
      setAppointments(res.data);
    } catch (error) {
      console.log("Error fetching appointments:", error);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/appointments/${id}/cancel`
      );
      fetchAppointments();
    } catch (err) {
      console.log(err);
    }
  };

  const rescheduleAppointment = (appointment: any) => {
    router.push({
      pathname: "/reschedule",
      params: { appointmentId: appointment._id },
    });
  };

  const renderItem = ({ item }: any) => {
    const disabled = item.status === "completed" || item.status === "canceled";

    return (
      <ThemedView style={styles.card}>
        <ThemedText style={styles.doctorName}>
          {item.doctorId?.name || "Unknown Doctor"}
        </ThemedText>

        <ThemedText style={styles.subText}>
          Specialist: {item.doctorId?.specialization}
        </ThemedText>

        <ThemedText style={styles.subText}>
          Date: {new Date(item.date).toDateString()}
        </ThemedText>

        <ThemedText style={styles.subText}>
          Time: {item.slotTime?.start} - {item.slotTime?.end}
        </ThemedText>

        <ThemedText style={styles.statusText}>
          Status: {item.status}
        </ThemedText>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            disabled={disabled}
            style={[
              styles.button,
              styles.cancelButton,
              disabled && { opacity: 0.5 }
            ]}
            onPress={() => cancelAppointment(item._id)}
          >
            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={disabled}
            style={[
              styles.button,
              styles.rescheduleButton,
              disabled && { opacity: 0.5 }
            ]}
            onPress={() => rescheduleAppointment(item)}
          >
            <ThemedText style={styles.buttonText}>Reschedule</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };


  return (
    <SafeAreaView >
      <ThemedView style={styles.container}>
        <ThemedText style={styles.header}>Your Appointments</ThemedText>

        {appointments.length === 0 ? (
          <ThemedText>No appointments found</ThemedText>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f3f3",
    marginBottom: 16,
  },

  doctorName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },

  subText: {
    fontSize: 14,
    marginTop: 2,
  },

  statusText: {
    fontWeight: "600",
    marginTop: 10,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "space-between",
  },

  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
  },

  cancelButton: {
    backgroundColor: "#ff4d4d",
    marginRight: 8,
  },

  rescheduleButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
