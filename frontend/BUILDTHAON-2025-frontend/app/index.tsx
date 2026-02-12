import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    // You can check AsyncStorage or SecureStore here
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    // Simulate auth check
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Replace with actual auth check
    const hasToken = false; // Check your token storage
    
    setIsAuthenticated(hasToken);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4361EE" />
      </View>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // If authenticated, you need to check if admin or user
  // For now, redirect to login to let user choose
  return <Redirect href="/login" />;
}