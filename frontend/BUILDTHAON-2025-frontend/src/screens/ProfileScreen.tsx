import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from "../config/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Color palette matching your Flutter app
const COLORS = {
  primary: '#4361ee',
  primaryDark: '#3a56d4',
  background: '#f8fafc',
  white: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  cardBackground: '#FFFFFF',
  gradientStart: '#4361ee',
  gradientEnd: '#3a56d4',
};



// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Create mock navigation object
const createMockNavigation = () => ({
  goBack: () => console.log('Go back pressed'),
  reset: (config: any) => console.log('Reset navigation:', config),
  navigate: (screen: string, params?: any) => console.log(`Navigate to ${screen}:`, params),
  push: (screen: string, params?: any) => console.log(`Push ${screen}:`, params),
  pop: () => console.log('Pop screen'),
  popToTop: () => console.log('Pop to top'),
  replace: (screen: string, params?: any) => console.log(`Replace with ${screen}:`, params),
  dispatch: (action: any) => console.log('Dispatch action:', action),
  canGoBack: () => true,
  isFocused: () => true,
  getId: () => 'mock-navigation-id',
  getState: () => ({
    routes: [{ name: 'Profile' }],
    index: 0,
    key: 'mock-state-key',
    routeNames: ['Profile'],
    type: 'stack'
  }),
});

// Create mock route object
const createMockRoute = () => ({
  key: 'mock-route-key',
  name: 'Profile',
  params: {},
  path: '/profile',
});

// Animated Components with TypeScript types
interface AnimatedViewProps {
  children: React.ReactNode;
  style?: any;
  delay?: number;
}

const AnimatedView: React.FC<AnimatedViewProps> = ({ children, style, delay = 0 }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 15,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Stats Cards Component


// Info Row Component
interface InfoRowProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  last?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: IconComponent, label, value, last = false }) => {
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateX] = useState(new Animated.Value(-20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        tension: 120,
        friction: 12,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedTouchable
      style={[
        styles.infoRow,
        last && { marginBottom: 0 },
        {
          opacity: fadeAnim,
          transform: [{ translateX }],
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.infoIconContainer}>
        <IconComponent size={20} color={COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </AnimatedTouchable>
  );
};

// Action Button Component
interface ActionButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: IconComponent, label, onPress, isDanger = false }) => {
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.actionButton,
        isDanger && styles.dangerButton,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.actionIconContainer, isDanger && styles.dangerIconContainer]}>
        <IconComponent size={20} color={isDanger ? COLORS.danger : COLORS.primary} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionLabel, isDanger && styles.dangerText]}>{label}</Text>
      </View>
      <ChevronRight size={16} color={isDanger ? COLORS.danger : COLORS.textMuted} />
    </AnimatedTouchable>
  );
};

// Main User Profile Component
interface UserProfilePageProps {
  navigation?: any;
  route?: any;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({
  navigation = createMockNavigation(),
  route = createMockRoute()
}) => {
  const nav = navigation;
  const rt = route;

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    mobileNumber: "",
  });

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadTokenAndProfile = async () => {
      const storedToken = await AsyncStorage.getItem("access_token");

      if (!storedToken) {
        Alert.alert("Session expired", "Please login again");
        nav.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }

      setToken(storedToken);
      loadUserProfile(storedToken);
    };

    loadTokenAndProfile();
  }, []);


  const loadUserProfile = async (jwtToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();

      setUser({
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        mobileNumber: data.mobile_number,
        createdAt: data.created_at,
      });

      setEditForm({
        fullName: data.full_name,
        mobileNumber: data.mobile_number,
      });

    } catch (err) {
      Alert.alert("Error", "Unable to load profile");
    }
  };




  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to select an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        showToast('Profile image updated!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const showToast = (message: string) => {
    Alert.alert('Success', message, [{ text: 'OK' }]);
  };

  const handleEditProfile = () => {
    setEditForm({
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
    });
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!token) return;

    setIsLoading(true);

    await fetch(`${API_BASE}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        full_name: editForm.fullName,
        mobile_number: editForm.mobileNumber,
      }),
    });


    setIsLoading(false);
    setModalVisible(false);
    showToast("Profile updated successfully!");
  };



  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            showToast('Logged out successfully!');
            // Use the navigation object (real or mock)
            nav.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const handleBack = () => {
    // Navigate to homepage instead of going back
    nav.navigate('HomeScreen');
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Profile</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <AnimatedView>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileContent}>
              {/* Profile Picture */}
              <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                  <View style={styles.profileImageWrapper}>
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                      <LinearGradient
                        colors={[COLORS.white, '#e6e6e6']}
                        style={styles.profileImagePlaceholder}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <User size={40} color={COLORS.primary} />
                      </LinearGradient>
                    )}
                    <View style={styles.cameraButton}>
                      <Camera size={16} color={COLORS.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>

              {/* Verified Badge */}
              <View style={styles.verifiedBadge}>
                <Shield size={14} color={COLORS.white} />
                <Text style={styles.verifiedText}>Verified User</Text>
              </View>
            </View>
          </LinearGradient>
        </AnimatedView>

        {/* Personal Information */}
        <AnimatedView delay={400}>
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <User size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>

            <View style={styles.infoList}>
              <InfoRow
                icon={Mail}
                label="Email"
                value={user.email}
              />
              <InfoRow
                icon={Phone}
                label="Mobile Number"
                value={user.mobileNumber}
              />
              <InfoRow
                icon={Calendar}
                label="Joined"
                value={formatDate(user.createdAt)}
                last
              />
            </View>
          </View>
        </AnimatedView>

        {/* Actions */}
        <AnimatedView delay={500}>
          <View style={styles.actionsCard}>
            <ActionButton
              icon={Edit}
              label="Edit Profile"
              onPress={handleEditProfile}
            />
            <View style={styles.divider} />
            <ActionButton
              icon={LogOut}
              label="Logout"
              onPress={handleLogout}
              isDanger
            />
          </View>
        </AnimatedView>

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.fullName}
                  onChangeText={(text) => setEditForm({ ...editForm, fullName: text })}
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.mobileNumber}
                  onChangeText={(text) => setEditForm({ ...editForm, mobileNumber: text })}
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  header: {
    paddingTop: Constants.statusBarHeight + 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  profileContent: {
    padding: 24,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 52) / 2 - 6,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  infoList: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  actionsCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  dangerButton: {
    borderColor: `${COLORS.danger}20`,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIconContainer: {
    backgroundColor: `${COLORS.danger}10`,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  dangerText: {
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  footerSpacing: {
    height: 30,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalClose: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
});

export default UserProfilePage;