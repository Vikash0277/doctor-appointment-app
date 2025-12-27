import { useEffect, useState } from "react";
import { FlatList, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import DoctorCard from "@/components/doctorCard";


export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}/api/doctors`);
      setDoctors(res.data);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <SafeAreaView>
      <ThemedView style={{ padding: 16 }}>
        <ThemedText style={styles.title}>Doctors</ThemedText>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={doctors}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <DoctorCard doctor={item} />}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
