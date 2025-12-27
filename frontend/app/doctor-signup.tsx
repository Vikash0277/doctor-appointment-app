import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import axios from "axios";
import asyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorSignup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [specialization, setSpecialization] = useState("");

  const handleSignup = async () => {
    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/doctor/register`,
        { 
          name,
          phone,
          password,
          experience,
          specialization
        }
      );
      console.log(res);
      await asyncStorage.setItem("doctorId", res.data.doctorId);
      if(!res){
        alert("Signup failed");
        return;
      }

      alert("Signup Successful");
      router.push("/(doctor)/doctor-dashboard");
    } catch (error) {
      alert("Network Error");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Doctor Registration</ThemedText>

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Experience (years)"
        value={experience}
        onChangeText={setExperience}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Specialization"
        value={specialization}
        onChangeText={setSpecialization}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/doctor-signin")}>
        <ThemedText style={styles.link}>Already have an account? Sign In</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16
  },
  link: {
    textAlign: "center",
    marginTop: 15,
    color: "#007aff"
  }
});