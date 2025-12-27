import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StyleSheet, ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

export default function DoctorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const id = await AsyncStorage.getItem("doctorId");
    if (!id) return;

    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/doctor/${id}/stats`
      );
      setStats(res.data);
    } catch (err) {
      console.log("Stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView >
      <ThemedView style={styles.container}>
        <ThemedText style={styles.header}>Dashboard</ThemedText>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.label}>This Week</ThemedText>
          <ThemedText style={styles.value}>{stats.weeklyTotal}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.label}>This Month</ThemedText>
          <ThemedText style={styles.value}>{stats.monthlyTotal}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.label}>Completed</ThemedText>
          <ThemedText style={[styles.value, styles.green]}>
            {stats.completed}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.label}>Cancelled</ThemedText>
          <ThemedText style={[styles.value, styles.red]}>
            {stats.cancelled}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.label}>Most Booked Day</ThemedText>
          <ThemedText style={styles.value}>{stats.mostBookedDay}</ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {  padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    marginBottom: 14,
  },
  label: { fontSize: 16 },
  value: { fontSize: 20, fontWeight: "bold", marginTop: 6 },
  green: { color: "#2ecc71" },
  red: { color: "#e74c3c" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
