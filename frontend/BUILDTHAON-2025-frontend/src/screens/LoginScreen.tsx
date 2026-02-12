import React, { useState, useEffect, useRef } from 'react';
import type { IconName } from "../components/icon";
import { API_BASE } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import GlassCard from '../components/GlassCard';
import HoverButton from '../components/HoverButton';
import Icon from '../components/icon';

interface LoginSignupPageProps {
  onLoginSuccess?: (isAdmin: boolean) => void;
}

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  confirmPassword?: string;
}



const { width } = Dimensions.get('window');
const LoginSignupPage: React.FC<LoginSignupPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AuthFormData, string>>>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const primaryColor = '#FF8C42';
  const secondaryColor = '#4361EE';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AuthFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name?.trim()) {
        newErrors.name = 'Please enter your full name';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.phone?.trim()) {
        newErrors.phone = 'Please enter your phone number';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone must be 10 digits';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          mobile_number: formData.phone,
          is_admin: false
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');

      console.log('Registration successful:', data);
      await handleLogin();
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Server returned invalid JSON');
      }

      if (!response.ok) {
        throw new Error(data.detail || `Login failed (${response.status})`);
      }

      const { access_token, is_admin } = data;

      // 🔥 STORE AUTH DATA GLOBALLY
      await login(
        access_token,
        formData.email,   // ← THIS is what admin profile uses
        is_admin
      );

      if (onLoginSuccess) {
        onLoginSuccess(is_admin);
      }

      Alert.alert(
        'Login Successful',
        is_admin
          ? 'Admin login successful! Redirecting to admin dashboard...'
          : 'Welcome to UrbanSim AI! Redirecting to user dashboard...'
      );



      setFormData({ email: '', password: '', name: '', phone: '', confirmPassword: '' });
    } catch (error: any) {
      if (error.message.includes('Network request failed')) {
        Alert.alert('Connection Error', `Cannot connect to server.\n\nTrying to reach: ${API_BASE}\n\nPlease check:\n1. Backend is running\n2. Correct IP address\n3. Both devices on same WiFi`);
      } else {
        Alert.alert('Login Failed', error.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const updateFormData = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    // Clear form data when switching modes
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      confirmPassword: '',
    });
  };

  const renderFormField = (
    field: keyof AuthFormData,
    placeholder: string,
    iconName: IconName,
    options: {
      secureTextEntry?: boolean;
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      showOnlyInSignup?: boolean;
    } = {}
  ) => {
    const { secureTextEntry = false, keyboardType = 'default', showOnlyInSignup = false } = options;
    if (showOnlyInSignup && isLogin) return null;

    return (
      <View style={styles.formFieldContainer}>
        <View style={[styles.inputContainer, errors[field] && styles.inputError]}>
          <Icon name={iconName} size={20} color={errors[field] ? '#EF4444' : '#94A3B8'} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={formData[field] || ''}
            onChangeText={(text) => updateFormData(field, text)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            editable={!isLoading}
            autoCapitalize={field === 'email' ? 'none' : 'words'}
          />
        </View>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FAFAFA" barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered Logo Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Icon name="apartment" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>UrbanSim AI</Text>
          </View>

          <View style={styles.contentRow}>
            {/* Left Illustration - Hidden on small screens */}
            {width > 700 && (
              <View style={styles.illustrationContainer}>
                <View style={styles.illustration}>
                  <Text style={styles.illustrationEmoji}>🏙️</Text>
                </View>
              </View>
            )}

            {/* Form Card */}
            <Animated.View
              style={[
                styles.formContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <GlassCard style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {isLogin ? 'Welcome Back' : "Let's Get Started"}
                </Text>
                <Text style={styles.formSubtitle}>
                  {isLogin
                    ? 'Please login or sign up to continue'
                    : 'Create your account to access civic management'}
                </Text>

                {/* Form Fields */}
                <View style={styles.formFields}>
                  {renderFormField('name', 'Your Full Name', 'person-outline', { showOnlyInSignup: true })}
                  {renderFormField('phone', 'Your Phone Number', 'phone-outlined', { keyboardType: 'phone-pad', showOnlyInSignup: true })}
                  {renderFormField('email', 'Your Email', 'email-outlined', { keyboardType: 'email-address' })}
                  {renderFormField('password', 'Your Password', 'lock-outline', { secureTextEntry: true })}
                  {renderFormField('confirmPassword', 'Confirm Password', 'lock-person-outlined', { secureTextEntry: true, showOnlyInSignup: true })}
                </View>

                {/* Submit Button */}
                <HoverButton
                  title={isLogin ? 'Sign In' : 'Sign Up'}
                  onPress={handleAuth}
                  loading={isLoading}
                  style={styles.submitButton}
                  icon={isLoading ? undefined : (isLogin ? 'login' : 'person-add')}
                />

                {/* Toggle Auth Mode - FIXED TEXT */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isLogin ? "Don't have an account? " : 'Already Have An Account? '}
                  </Text>
                  <TouchableOpacity onPress={toggleAuthMode} disabled={isLoading}>
                    <Text style={styles.toggleLink}>
                      {isLogin ? 'Sign Up' : 'Login'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Admin Info */}
                {isLogin && (
                  <View style={styles.adminBadge}>
                    <Icon name="shield-checkmark" size={12} color="#4361EE" />
                    <Text style={styles.adminText}>Admin access restricted</Text>
                  </View>
                )}
              </GlassCard>
            </Animated.View>

            {/* Right Illustration - Hidden on small screens */}
            {width > 700 && (
              <View style={styles.illustrationContainer}>
                <View style={styles.illustration}>
                  <Text style={styles.illustrationEmoji}>🌆</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 200,
    height: 200,
    backgroundColor: '#FFF4E6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE4C4',
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  formContainer: {
    width: '100%',
    maxWidth: 440,
    minWidth: 320,
  },
  formCard: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 28,
    lineHeight: 22,
    textAlign: 'center',
  },
  formFields: {
    marginBottom: 20,
  },
  formFieldContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 16,
    height: 56,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleText: {
    fontSize: 14,
    color: '#64748B',
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF8C42',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  adminText: {
    fontSize: 11,
    color: '#4361EE',
    fontWeight: '600',
  },
});

const LoginScreen = LoginSignupPage;
export default LoginScreen;