import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { router } from "expo-router";
import axios from "axios";
import asyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorSignin() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const handleSignin = async () => {
        try {
            const res = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/api/doctor/login`,
                {
                    phone,
                    password
                }
            );
            await asyncStorage.setItem("doctorId", res.data.doctorId);
            if (!res) {
                alert("Signin failed");
                return;
            }

            alert("Login Successful");
            router.replace("/(doctor)/doctor-dashboard");
        } catch (error) {
            alert("Network Error");
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>Doctor Login</ThemedText>

            <TextInput
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
            />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleSignin}>
                <ThemedText style={styles.buttonText}>Sign In</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/doctor-signup")}>
                <ThemedText style={styles.link}>Don't have an account? Sign Up</ThemedText>
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
