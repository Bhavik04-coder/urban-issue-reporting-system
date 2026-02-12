import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  login: (token: string, email: string, isAdmin: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
  try {
    const storedToken = await AsyncStorage.getItem("access_token");
    const storedEmail = await AsyncStorage.getItem("user_email");
    const storedIsAdmin = await AsyncStorage.getItem("is_admin");

    if (storedToken && storedEmail) {
      setToken(storedToken);
      setUserEmail(storedEmail);
      setIsAdmin(storedIsAdmin === "true");
    }
  } catch (error) {
    console.error("Failed to load auth data:", error);
  } finally {
    setIsLoading(false);
  }
};

const login = async (newToken: string, email: string, admin: boolean) => {
  try {
    await AsyncStorage.setItem("access_token", newToken);
    await AsyncStorage.setItem("user_email", email);
    await AsyncStorage.setItem("is_admin", admin.toString());

    setToken(newToken);
    setUserEmail(email);
    setIsAdmin(admin);
  } catch (error) {
    console.error("Failed to save auth data:", error);
  }
};


  const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      "access_token",
      "user_email",
      "is_admin",
    ]);

    setToken(null);
    setUserEmail(null);
    setIsAdmin(false);
  } catch (error) {
    console.error("Failed to clear auth data:", error);
  }
};


  return (
    <AuthContext.Provider value={{ token, userEmail, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};