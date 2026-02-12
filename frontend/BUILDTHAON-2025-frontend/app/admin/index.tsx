import AdminDashboard from "../../src/screens/AdminDashboard";
import { useRouter } from "expo-router";
import { TouchableOpacity, Text, View } from "react-native";

export default function Admin() {
  const router = useRouter();
  
  const handleLogout = () => {
    // TODO: Clear auth tokens
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminDashboard />
      {/* Optional logout button */}
      
    </View>
  );
}