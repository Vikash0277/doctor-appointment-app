import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function Reschedule() {
  const { appointmentId } = useLocalSearchParams();

  const [doctor, setDoctor] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const fetchAppointment = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/appointment/${appointmentId}`
      );

      setAppointment(res.data);

      // doctorId is populated object
      fetchDoctor(res.data.doctorId._id);
    } catch (err) {
      console.log("Error loading appointment:", err);
    }
  };

  const fetchDoctor = async (doctorId: string) => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/doctor/${doctorId}`
      );

      setDoctor(res.data);
    } catch (err) {
      console.log("Error loading doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, []);

  const updateAppointment = async () => {
    if (!selectedDay || !selectedSlot) {
      return alert("Select a day & slot first.");
    }

    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/appointments/${appointmentId}/reschedule`,
        {
          date: new Date().toISOString(),
          slotTime: selectedSlot,
        }
      );

      alert("Appointment rescheduled!");
      router.back();
    } catch (err) {
      console.log(err);
      alert("Failed to reschedule");
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 ,}}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.header}>Reschedule Appointment</ThemedText>

        <ThemedText style={styles.doctorName}>{doctor?.name ?? "Doctor"}</ThemedText>
        <ThemedText>Specialist: {doctor?.specialization}</ThemedText>

        <ThemedText style={styles.section}>Select Day</ThemedText>
        <ThemedView style={styles.row}>
          {doctor?.availableDays?.map((day: string) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDay === day && styles.selectedButton,
              ]}
              onPress={() => {
                setSelectedDay(day);
                setSelectedSlot(null);
              }}
            >
              <ThemedText
                style={[
                  styles.dayText,
                  selectedDay === day && styles.selectedText,
                ]}
              >
                {day}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {selectedDay && (
          <>
            <ThemedText style={styles.section}>Available Slots</ThemedText>

            <ThemedView style={styles.row}>
              {doctor?.availableTimeSlots?.[selectedDay]?.map(
                (slot: any, index: number) => {
                  const label = `${slot.start} - ${slot.end}`;
                  const isSelected = selectedSlot?.start === slot.start;

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedSlot(slot)}
                      style={[
                        styles.slotButton,
                        isSelected && styles.selectedButton,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.slotText,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                }
              )}
            </ThemedView>
          </>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={updateAppointment}>
          <ThemedText style={styles.saveText}>Save Changes</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,padding: 16,},
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  section: { fontSize: 17, fontWeight: "600", marginTop: 20 },
  doctorName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  row: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ddd",
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  dayText: { fontSize: 14 },
  slotButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ddd",
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  slotText: { fontSize: 13 },
  selectedButton: { backgroundColor: "#4CAF50" },
  selectedText: { color: "#fff", fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
