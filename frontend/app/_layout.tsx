import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppointmentRefreshProvider } from '@/contexts/appointmentRefreshContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppointmentRefreshProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName='main'>
        <Stack.Screen name="main" options={{ headerShown: false }} />
        <Stack.Screen name="doctor-signin" options={{ headerShown: false }} />
        <Stack.Screen name="doctor-signup" options={{ headerShown: false }} />
        <Stack.Screen name="patient-signin" options={{ headerShown: false }} />
        <Stack.Screen name="patient-signup" options={{ headerShown: false }} />
        <Stack.Screen name="(doctor)" options={{headerShown: false}}/>
        <Stack.Screen name="(patient)" options={{headerShown: false}} />
        <Stack.Screen name='reschedule' options={{headerShown: false}} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </AppointmentRefreshProvider>
  );
}
