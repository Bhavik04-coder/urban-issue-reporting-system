import { Stack } from "expo-router";
import { AuthProvider } from "../src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Login",
            animation: "fade"
          }} 
        />
        <Stack.Screen 
          name="login/index" 
          options={{ 
            title: "Login",
            animation: "slide_from_right"
          }} 
        />
        <Stack.Screen 
          name="admin/index" 
          options={{ 
            title: "Admin Dashboard",
            animation: "slide_from_right"
          }} 
        />
        <Stack.Screen 
          name="dashboard/index" 
          options={{ 
            title: "User Dashboard",
            animation: "slide_from_right"
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}