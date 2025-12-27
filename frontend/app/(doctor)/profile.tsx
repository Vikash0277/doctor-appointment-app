import { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, TextInput, Platform } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DoctorProfileScreen() {
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<any>({});
  const [tempSlots, setTempSlots] = useState<any>({});   
  const [fee, setFee] = useState("");

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<"start" | "end">("start");
  const [currentDay, setCurrentDay] = useState("");

  useEffect(() => {
    const loadId = async () => {
      const id = await AsyncStorage.getItem("doctorId");
      setDoctorId(id);
    };
    loadId();
  }, []);

  useEffect(() => {
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/api/doctor/${doctorId}`);

      setAvailableDays(res.data.availableDays || []);
      setTimeSlots(res.data.availableTimeSlots || {});

      const temp: any = {};
      (res.data.availableDays || []).forEach((d: string) => {
        temp[d] = { start: "", end: "" };
      });
      setTempSlots(temp);

      setFee(res.data.fee ? String(res.data.fee) : "");
    } catch (err) {
      console.log(err);
    }
  };

  const toggleDay = (day: string) => {
    const newDays = [...availableDays];
    const slots = { ...timeSlots };
    const temp = { ...tempSlots };

    if (newDays.includes(day)) {
      newDays.splice(newDays.indexOf(day), 1);
      delete slots[day];
      delete temp[day];
    } else {
      newDays.push(day);
      slots[day] = slots[day] || [];
      temp[day] = { start: "", end: "" }; 
    }

    setAvailableDays(newDays);
    setTimeSlots(slots);
    setTempSlots(temp);
  };

  const openPicker = (day: string, type: "start" | "end") => {
    setCurrentDay(day);
    setPickerType(type);
    setPickerVisible(true);
  };

  const onTimeSelected = (_, selectedDate) => {
    if (!selectedDate) return setPickerVisible(false);

    const timeStr = selectedDate.toTimeString().slice(0, 5);
    const temp = { ...tempSlots };

    if (pickerType === "start") temp[currentDay].start = timeStr;
    else temp[currentDay].end = timeStr;

    setTempSlots(temp);
    setPickerVisible(false);
  };

  const addSlot = () => {
    const { start, end } = tempSlots[currentDay];

    if (!start || !end) return alert("Select both start and end time");

    const slots = { ...timeSlots };

    const isDuplicate = slots[currentDay].some((s) => s.start === start && s.end === end);
    if (isDuplicate) return alert("This slot already exists.");

    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const startM = toMin(start);
    const endM = toMin(end);

    const overlapping = slots[currentDay].some((s) => {
      const sStart = toMin(s.start);
      const sEnd = toMin(s.end);
      return startM < sEnd && endM > sStart;
    });

    if (overlapping) return alert("Slot overlaps with an existing one.");

    slots[currentDay].push({ start, end });
    setTimeSlots(slots);

    const temp = { ...tempSlots };
    temp[currentDay] = { start: "", end: "" };
    setTempSlots(temp);
  };

  const removeSlot = (day: string, index: number) => {
    const slots = { ...timeSlots };
    slots[day] = slots[day].filter((_, i) => i !== index);
    setTimeSlots(slots);
  };

  const updateProfile = async () => {
    await axios.put(`${process.env.EXPO_PUBLIC_BASE_URL}/api/doctor/${doctorId}`, {
      availableDays,
      availableTimeSlots: timeSlots,
      fee: Number(fee),
    });

    alert("Profile updated!");
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["doctorId", "userId", "userRole"]);
    router.replace("/main");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.header}>Doctor Profile</ThemedText>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.section}>Consultation Fee</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter fee"
          value={fee}
          onChangeText={setFee}
          keyboardType="numeric"
        />

        <ThemedText style={styles.section}>Available Days</ThemedText>

        <View style={styles.daysContainer}>
          {WEEK_DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => toggleDay(day)}
              style={[styles.dayButton, availableDays.includes(day) && styles.daySelected]}
            >
              <ThemedText
                style={[styles.dayText, availableDays.includes(day) && styles.dayTextSelected]}
              >
                {day}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {availableDays.map((day) => (
          <View key={day} style={styles.daySlotContainer}>
            <ThemedText style={styles.dayTitle}>{day} Slots</ThemedText>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={styles.timeButton} onPress={() => openPicker(day, "start")}>
                <ThemedText>{tempSlots[day]?.start || "Start"}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.timeButton} onPress={() => openPicker(day, "end")}>
                <ThemedText>{tempSlots[day]?.end || "End"}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={addSlot} style={styles.addSlotButton}>
                <ThemedText>+ Add</ThemedText>
              </TouchableOpacity>
            </View>

            {timeSlots[day]?.map((slot, index) => (
              <View key={index} style={styles.slotItem}>
                <ThemedText>{slot.start} - {slot.end}</ThemedText>

                <TouchableOpacity onPress={() => removeSlot(day, index)}>
                  <ThemedText style={{ color: "red" }}>Remove</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.updateButton} onPress={updateProfile}>
          <ThemedText style={styles.updateButtonText}>Save Profile</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {pickerVisible && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeSelected}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  header: { fontSize: 26, fontWeight: "bold" },
  logoutButton: { backgroundColor: "red", padding: 10, borderRadius: 8, marginVertical: 15, width: 120 },
  logoutText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  section: { marginTop: 20, fontSize: 18, fontWeight: "600" },
  input: { borderWidth: 1, padding: 10, borderRadius: 6, marginTop: 10 },
  daysContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  dayButton: { padding: 8, borderRadius: 20, margin: 6, backgroundColor: "#ccc" },
  daySelected: { backgroundColor: "#4CAF50" },
  dayText: { color: "#000" },
  dayTextSelected: { color: "#fff", fontWeight: "600" },
  daySlotContainer: { marginTop: 20 },
  dayTitle: { fontSize: 17, fontWeight: "600" },
  timeButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 8, marginRight: 8 },
  addSlotButton: { padding: 10, backgroundColor: "#007aff", borderRadius: 8 },
  slotItem: { padding: 10, backgroundColor: "#eee", marginVertical: 4, borderRadius: 6, flexDirection: "row", justifyContent: "space-between" },
  updateButton: { backgroundColor: "#4CAF50", padding: 14, marginTop: 30, borderRadius: 10 },
  updateButtonText: { textAlign: "center", color: "#fff", fontWeight: "600" }
});
