import HomeScreen from "../../src/screens/HomeScreen";
import { useRouter } from "expo-router";
import { TouchableOpacity, Text, View } from "react-native";

export default function Dashboard() {
  const router = useRouter();
  
  const handleLogout = () => {
    // TODO: Clear auth tokens
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
      {/* Optional logout button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#EF4444",
          padding: 12,
          borderRadius: 8,
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}