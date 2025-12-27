import { useEffect, useState,useContext, use } from "react";
import { TouchableOpacity, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppointmentRefreshContext} from "@/contexts/appointmentRefreshContext";

const toYMD = (date) => {
    const d = new Date(date);
    return d.getFullYear() + "-" + (d.getMonth() + 1).toString().padStart(2, "0") + "-" +
        d.getDate().toString().padStart(2, "0");
};

export default function DoctorCard({ doctor }) {
    const { appointmentsRefreshKey , refreshAppointments } = useContext(AppointmentRefreshContext);

    const [patientId, setPatientId] = useState(null);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDayLabel, setSelectedDayLabel] = useState(null);

    const [selectedSlot, setSelectedSlot] = useState(null);

    const [bookedSlots, setBookedSlots] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);

    const [showDatePicker, setShowDatePicker] = useState(false);


    useEffect(() => {
        const load = async () => {
            const id = await AsyncStorage.getItem("patientId");
            setPatientId(id);
            await fetchMyAppointments(id);  
        };
        load();
    }, []);

    const fetchMyAppointments = async (id) => {
        if (!id) return;
        try {
            const res = await axios.get(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/${id}/appointments`
            );

            setMyAppointments(res.data || []);
        } catch (error) {
            console.log("Failed to fetch my appointments", error);
        }
    };

    useEffect(() => {
        fetchMyAppointments(patientId);
    }, [appointmentsRefreshKey]);   

    const onDateChange = (event, date) => {
        setShowDatePicker(false);
        if (!date) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);

        if (selected < today) {
            Alert.alert("Invalid", "Select future date only.");
            return;
        }

        const weekday = selected.toLocaleString("en-US", { weekday: "short" });

        if (!doctor.availableDays.includes(weekday)) {
            Alert.alert("Unavailable", `Doctor is not available on ${weekday}`);
            return;
        }

        setSelectedDate(selected);
        setSelectedDayLabel(weekday);
        fetchBookedSlots(weekday);

        setSelectedSlot(null);
    };

    const fetchBookedSlots = async (day) => {
        try {
            const res = await axios.get(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/doctor/${doctor._id}/booked-slots`,
                { params: { day } }
            );
            setBookedSlots(res.data);
        } catch (err) {
            console.log("Error fetching booked slots:", err);
        }
    };

    const selectSlot = (slotLabel, slot) => {
        if (!selectedDate) {
            Alert.alert("Select Date", "Please pick a date first.");
            return;
        }

        const isBookedSlot = bookedSlots.some(
            (b) => b.slotTime.start === slot.start
        );

        if (isBookedSlot) {
            Alert.alert("Unavailable", "This slot is already booked.");
            return;
        }

        const conflict = myAppointments.some((a) => {
            if (a.status === "cancelled") return false;

            const bookedDate = new Date(a.date);
            bookedDate.setHours(0, 0, 0, 0);

            const chosen = new Date(selectedDate);
            chosen.setHours(0, 0, 0, 0);

            return (
                bookedDate.getTime() === chosen.getTime() &&
                a.slotTime.start === slot.start
            );
        });

        if (conflict) {
            Alert.alert(
                "Conflict",
                "You already have another appointment at this time."
            );
            return;
        }

        setSelectedSlot(slotLabel);
    };

    const handleBooking = async () => {
        if (!selectedDate) return Alert.alert("Select date first");
        if (!selectedSlot) return Alert.alert("Select slot");

        const [start, end] = selectedSlot.split(" - ");

        const appointmentData = {
            doctorId: doctor._id,
            patientId,
            date: selectedDate,
            slotTime: { start, end },
            day: selectedDayLabel,
        };

        try {
            await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/api/book`, appointmentData);

            Alert.alert("Success", "Appointment booked successfully!");

            refreshAppointments();
            fetchMyAppointments(patientId);
            fetchBookedSlots(selectedDayLabel);

            setSelectedSlot(null);
            setSelectedDate(null);

        } catch (err) {
            const msg = err.response?.data?.message || "Booking failed";
            Alert.alert("Conflict", msg);
        }
    };

    return (
        <ThemedView style={styles.card}>
            <ThemedText style={styles.name}>{doctor.name}</ThemedText>

            <ThemedText style={styles.sectionTitle}>
                Available Days: {doctor.availableDays.join(", ")}
            </ThemedText>

            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <ThemedText>
                    {selectedDate ? selectedDate.toDateString() : "Select Date"}
                </ThemedText>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    minimumDate={new Date()}
                    onChange={onDateChange}
                />
            )}

            {selectedDayLabel && (
                <>
                    <ThemedText style={styles.sectionTitle}>Available Slots</ThemedText>

                    <ThemedView style={styles.row}>
                        {doctor.availableTimeSlots?.[selectedDayLabel]?.map((slot, index) => {
                            const slotLabel = `${slot.start} - ${slot.end}`;
                            const isBooked = bookedSlots.some(b => b.slotTime.start === slot.start);

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => selectSlot(slotLabel, slot)}
                                    style={[
                                        styles.slotButton,
                                        selectedSlot === slotLabel && styles.selectedButton,
                                        isBooked && { backgroundColor: "#aaa" },
                                    ]}
                                    disabled={isBooked}
                                >
                                    <ThemedText
                                        style={[
                                            styles.slotText,
                                            selectedSlot === slotLabel && styles.selectedText,
                                        ]}
                                    >
                                        {slotLabel}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ThemedView>
                </>
            )}

            <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
                <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                    Book Appointment
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: { padding: 16, marginBottom: 14, borderRadius: 10, backgroundColor: "#f0f0f0" },
    name: { fontSize: 18, fontWeight: "bold" },
    sectionTitle: { marginTop: 14, fontSize: 15, fontWeight: "600" },
    row: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, backgroundColor: "#f0f0f0" },
    slotButton: {
        padding: 6,
        paddingHorizontal: 12,
        backgroundColor: "#ddd",
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedButton: { backgroundColor: "#4CAF50" },
    selectedText: { color: "#fff", fontWeight: "bold" },
    slotText: { fontSize: 13 },
    dateButton: {
        backgroundColor: "#ddd",
        padding: 10,
        marginTop: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    bookButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: "#50d16e",
        borderRadius: 6,
    },
});
