import UserProfilePage from "../../src/screens/adminprofile";
import { useAuth } from "../../src/contexts/AuthContext";
import { View, ActivityIndicator, Text } from "react-native";

export default function DeptAnalysis() {
  const { userEmail, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  // Safety guard
  if (!userEmail) {
    return <Text>User not logged in</Text>;
  }

  // Admin-only guard
  if (!isAdmin) {
    return <Text>Access denied: Admins only</Text>;
  }

  return <UserProfilePage userEmail={userEmail} />;
}
