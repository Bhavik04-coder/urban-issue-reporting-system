import LoginScreen from "../../src/screens/LoginScreen";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  
  // Function to handle successful login
  const handleLoginSuccess = (isAdmin: boolean) => {
    if (isAdmin) {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}