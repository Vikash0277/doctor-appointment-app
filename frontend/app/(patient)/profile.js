import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function ProfileScreen() {

  const logout = async () => {
    await AsyncStorage.multiRemove(["userId", "userRole", "doctorId", "patientId"]);
    router.replace("/main"); 
  };

  return (
    <SafeAreaView>
      <ThemedView style={styles.container}>

        <ThemedText style={styles.title}>Profile</ThemedText>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "700",
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
