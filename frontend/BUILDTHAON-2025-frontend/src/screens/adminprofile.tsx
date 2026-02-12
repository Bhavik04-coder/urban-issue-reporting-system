import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from "../../src/config/api";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon, { IconName } from '../components/icon';

const { width, height } = Dimensions.get('window');

interface UserProfilePageProps {
  userEmail: string; // coming from auth
}

interface AdminProfile {
  name: string;
  email: string;
  contact: string;
  admin_id: string;
}


interface StatItem {
  value: string;
  label: string;
}

interface InfoRow {
  title: string;
  value: string;
  icon: IconName;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ userEmail }) => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedContact, setEditedContact] = useState("");

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [slideAnim] = useState(new Animated.Value(50));
  const headerHeight = useRef(new Animated.Value(320)).current;

  const scrollY = useRef(new Animated.Value(0)).current;

  const stats: StatItem[] = [
    { value: "1.2K", label: "Reports" },
    { value: "239", label: "Resolved" },
    { value: "98%", label: "Rating" },
  ];

  const infoRows: InfoRow[] = [
    { title: "Name", value: editedName, icon: "person-outline" },
    { title: "Role", value: "System Administrator", icon: "work-outline" },
    { title: "Email", value: editedEmail, icon: "email" },
    { title: "Contact", value: editedContact, icon: "phone" },
    { title: "Admin ID", value: profile?.admin_id || "", icon: "badge" },
  ];



  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/admin/profile?email=${userEmail}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch admin profile");
        }

        const data: AdminProfile = await res.json();

        setProfile(data);
        setEditedName(data.name);
        setEditedEmail(data.email);
        setEditedContact(data.contact);
      } catch (err) {
        console.error("Failed to load admin profile", err);
      }
    };

    fetchAdminProfile();
  }, [userEmail]);



  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showPopupDialog = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
  };

  const handleSaveProfile = () => {
    Alert.alert(
      "Save Changes",
      "Are you sure you want to save these changes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: () => {
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully");
          },
        },
      ]
    );
  };

  const renderHeader = () => {
    const headerTranslateY = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -50],
      extrapolate: 'clamp',
    });

    const headerScale = scrollY.interpolate({
      inputRange: [-100, 0, 100],
      outputRange: [1.1, 1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [
              { translateY: headerTranslateY },
              { scale: headerScale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#4361EE', 'rgba(67, 97, 238, 0.9)', 'rgba(67, 97, 238, 0.7)', '#FFFFFF']}
          locations={[0, 0.6, 0.8, 1]}
          style={styles.headerGradient}
        >
          {/* Background pattern */}
          <View style={styles.backgroundCircle1} />
          <View style={styles.backgroundCircle2} />

          <View style={styles.headerContent}>
            {/* Profile Avatar */}
            <TouchableOpacity
              style={styles.profileAvatarContainer}
              onPress={() => showPopupDialog(
                "Profile Picture",
                "Tap to change your profile picture or view in full size."
              )}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.profileAvatar,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#E6E6E6']}
                  style={styles.avatarGradient}
                >
                  <Icon name="person" size={50} color="#667EEA" />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Animated.Text
                style={[
                  styles.profileName,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={editedName}
                    onChangeText={setEditedName}
                  />
                ) : (
                  profile?.name || ""
                )}

              </Animated.Text>

              <Animated.Text
                style={[
                  styles.profileRole,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                System Administrator
              </Animated.Text>

              {/* Stats Row */}
              <Animated.View
                style={[
                  styles.statsContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {stats.map((stat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.statItem}
                    onPress={() => showPopupDialog(
                      `${stat.label} Statistics`,
                      `Current Value: ${stat.value}\nThis shows your performance metrics for ${stat.label} in the system.`
                    )}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                      style={styles.statItemGradient}
                    >
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
          </View>
        </LinearGradient>

        {/* Header Bottom Curve */}
        <View style={styles.headerBottom}>
          <View style={styles.headerHandle} />
          <Text style={styles.headerTitle}>ADMIN PROFILE</Text>
        </View>
      </Animated.View>
    );
  };

  const renderAdminInfoCard = () => (
    <TouchableOpacity
      onPress={() => showPopupDialog(
        "Admin Information",
        "Complete administrative profile details including contact information, role, and system access credentials."
      )}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.adminInfoCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.adminInfoGradient}
        >
          <View style={styles.adminInfoHeader}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.adminIconContainer}
            >
              <Icon name="admin-panel-settings" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.adminInfoTitle}>Admin Information</Text>
          </View>

          <View style={styles.infoRowsContainer}>
            {infoRows.map((row, index) => (
              <TouchableOpacity
                key={index}
                style={styles.infoRow}
                onPress={() => showPopupDialog(
                  row.title,
                  `Current value: ${row.value}\nThis field contains your ${row.title} information.`
                )}
                activeOpacity={0.7}
              >
                <View style={styles.infoIconContainer}>
                  <Icon name={row.icon} size={20} color="#667EEA" />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{row.title}</Text>
                  {isEditing && (row.title === "Name" || row.title === "Email" || row.title === "Contact") ? (
                    <TextInput
                      style={styles.editInfoInput}
                      value={
                        row.title === "Name" ? editedName :
                          row.title === "Email" ? editedEmail :
                            editedContact
                      }
                      onChangeText={
                        row.title === "Name" ? setEditedName :
                          row.title === "Email" ? setEditedEmail :
                            setEditedContact
                      }
                      placeholder={`Enter ${row.title.toLowerCase()}`}
                    />
                  ) : (
                    <Text style={styles.infoValue}>{row.value}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderActionButtons = () => (
    <Animated.View
      style={[
        styles.actionButtonsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {isEditing ? (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {
              setIsEditing(false);
              if (profile) {
                setEditedName(profile.name);
                setEditedEmail(profile.email);
                setEditedContact(profile.contact);
              }
            }}

            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF4757']}
              style={styles.buttonGradient}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cancel</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveProfile}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00E5A0', '#00D9F5']}
              style={styles.buttonGradient}
            >
              <Icon name="check" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.8}
        >
          
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderSettingsOptions = () => (
    <Animated.View
      style={[
        styles.settingsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
    </Animated.View>
  );

  const renderPopupModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.modalGradient}
          >
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalContent}>{modalContent}</Text>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.modalCloseGradient}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4361EE" />

      {/* Header */}
      {renderHeader()}

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {/* Admin Information Card */}
          {renderAdminInfoCard()}

          {/* Action Buttons */}
          {renderActionButtons()}
          {/* Additional Info */}
          <Animated.View
            style={[
              styles.additionalInfo,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >

          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Popup Modal */}
      {renderPopupModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    height: 320,
    width: '100%',
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 40,
  },
  backgroundCircle1: {
    position: 'absolute',
    top: 50,
    right: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileAvatarContainer: {
    marginTop: 20,
  },
  profileAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  editInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
    minWidth: 200,
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 8,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  statItemGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerBottom: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerHandle: {
    width: 60,
    height: 4,
    backgroundColor: '#8F92A1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667EEA',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  adminInfoCard: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    overflow: 'hidden',
  },
  adminInfoGradient: {
    padding: 24,
  },
  adminInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  adminIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  adminInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 12,
  },
  infoRowsContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'transparent',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  editInfoInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667EEA',
  },
  actionButtonsContainer: {
    marginBottom: 24,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editButton: {
    shadowColor: '#667EEA',
  },
  cancelButton: {
    shadowColor: '#FF6B6B',
  },
  saveButton: {
    shadowColor: '#00E5A0',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsToggle: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsToggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  settingsToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  settingsContainer: {
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingsContent: {
    flex: 1,
  },
  settingsOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  settingsOptionDesc: {
    fontSize: 14,
    color: '#718096',
  },
  additionalInfo: {
    marginTop: 24,
  },
  additionalInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoGridItem: {
    flex: 1,
    minWidth: width / 3 - 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoGridTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#718096',
    marginTop: 8,
    marginBottom: 4,
  },
  infoGridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  modalGradient: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  modalContent: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalCloseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  modalCloseGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UserProfilePage;