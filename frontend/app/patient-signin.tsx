import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import axios from "axios";
import asyncStorage from "@react-native-async-storage/async-storage";


export default function PatientSignin() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const isValidPhone = (phone:any) => {
        const regex = /^(\+91)?[6-9]\d{9}$/;
        return regex.test(phone);
    };
    const handleSignin = async () => {
        if (!isValidPhone(phone)) {
            alert("Please enter a valid Indian phone number (10 digits, starts with 6-9)");
            return;
        }

        if (!password.trim()) {
            alert("Password cannot be empty");
            return;
        }
        try {
            const res = await axios.post(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/patient/login`,
                {
                    phone,
                    password
                }
            );
            await asyncStorage.setItem("patientId", res.data.patientId);
            if (!res) {
                alert("Signin failed");
                return;
            }

            alert("Signin Successful");
            router.push("/(patient)/patient-dashboard");
        } catch (error) {
            console.log(error);
            alert("Network error");
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>Patient Login</ThemedText>

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
                style={styles.input}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSignin}>
                <ThemedText style={styles.buttonText}>Sign In</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/patient-signup")}>
                <ThemedText style={styles.link}>Don't have an account? Sign Up</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20
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
        marginBottom: 12
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
