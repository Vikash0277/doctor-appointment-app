import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, StyleSheet, View } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function DoctorAppointment() {
    const [appointments, setAppointments] = useState([]);
    const [doctorId, setDoctorId] = useState("");

    useEffect(() => {
        const loadDocId = async () => {
            const id = await AsyncStorage.getItem("doctorId");
            setDoctorId(id || "");
        };
        loadDocId();
    }, []);

    useEffect(() => {
        if (doctorId) fetchAppointments();
    }, [doctorId]);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/appointments/${doctorId}`
            );
            setAppointments(res.data);
        } catch (error) {
            console.log("Error fetching appointments:", error);
        }
    };

    const markCompleted = async (id: string) => {
        try {
            await axios.put(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/appointments/${id}/complete`
            );
            fetchAppointments();
        } catch (err) {
            console.log(err);
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

    const renderItem = ({ item }: any) => {
        const disabled = item.status === "completed" || item.status === "canceled";

        return (
            <ThemedView style={styles.card}>
                <ThemedText style={styles.patientName}>
                    {item.patientId?.name}
                </ThemedText>

                <ThemedText style={styles.subText}>
                    Phone: {item.patientId?.phone}
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
                            styles.completeButton,
                            disabled && { opacity: 0.5 }
                        ]}
                        onPress={() => markCompleted(item._id)}
                    >
                        <ThemedText style={styles.buttonText}>Mark Done</ThemedText>
                    </TouchableOpacity>

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
                </View>
            </ThemedView>
        );
    };


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.header}>Appointments</ThemedText>

                <FlatList
                    data={appointments}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 50 }}
                />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {  padding: 16 },

    header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },

    card: {
        padding: 16,
        backgroundColor: "#f3f3f3",
        borderRadius: 12,
        marginBottom: 16,
    },

    patientName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 6,
    },

    subText: {
        marginTop: 3,
        fontSize: 14,
    },

    statusText: {
        marginTop: 10,
        fontWeight: "600",
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

    completeButton: {
        backgroundColor: "#4CAF50",
        marginRight: 8,
    },

    cancelButton: {
        backgroundColor: "#ff4d4d",
        marginLeft: 8,
    },

    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },
});
