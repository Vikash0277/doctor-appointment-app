import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function MainScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        
        <ThemedText style={styles.title}>
          Welcome to SAMSA
        </ThemedText>

        <ThemedView style={styles.buttonContainer}>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/doctor-signin")}
          >
            <ThemedText style={styles.buttonText}>
              Doctor
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/patient-signin")}
          >
            <ThemedText style={styles.buttonText}>
              Patient
            </ThemedText>
          </TouchableOpacity>

        </ThemedView>

      </ThemedView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    opacity: 0.8,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
