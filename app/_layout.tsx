import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Menyembunyikan header default agar area game full screen
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="Game"  />
    </Stack>
  );
}
