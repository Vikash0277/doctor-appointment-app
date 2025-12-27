import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity,} from "react-native";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import asyncStorage from "@react-native-async-storage/async-storage";



export default function PatientSignup() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        try {
            const res = await axios.post(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/patient/register`,
                {
                    name,
                    phone,
                    password
                }
            );
            await asyncStorage.setItem("patientId", res.data.patientId);
            if (!res) {
                alert("Signup failed");
                return;
            }


            alert("Signup Successful");
            router.push("/(patient)/patient-dashboard");

        } catch (error: any) {
            if (error.response) {
                alert(error.response.data.message);
            } else {

                alert("Network error");
            }
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.title}>Patient Registration</ThemedText>

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

                <TouchableOpacity style={styles.button} onPress={handleSignup}>
                    <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/patient-signin")}>
                    <ThemedText style={styles.link}>Already have an account? Sign In</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: 20,
    },
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
