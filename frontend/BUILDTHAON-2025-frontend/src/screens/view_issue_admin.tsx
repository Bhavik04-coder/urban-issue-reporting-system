import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config/api';
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
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon, { IconName } from '../components/icon';

const { width, height } = Dimensions.get('window');

interface AdminIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  urgencyLevel: string;
  status: string;
  userName: string;
  userEmail: string;
  userMobile: string;
  locationAddress: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  assignedDepartment?: string;
}

interface StatCard {
  title: string;
  value: number;
  change: string;
  icon: IconName;
  color: readonly [string, string];
}

const IssueTrackingPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [issues, setIssues] = useState<AdminIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<AdminIssue | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvedBy, setResolvedBy] = useState('Admin');
  const [selectedStatus, setSelectedStatus] = useState<string>('Pending');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [slideAnim] = useState(new Animated.Value(50));
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const tabs = ['Pending', 'In Progress', 'Resolved'];
  const statusOptions = ['Pending', 'In Progress', 'Resolved'];

  const [adminStats, setAdminStats] = useState({
    total_issues: 0,
    resolved_issues: 0,
    pending_issues: 0,
    last_updated: '',
  });
  const stats: StatCard[] = [
    {
      title: "Total Issues",
      value: adminStats.total_issues,
      change: "",
      icon: "task-alt",
      color: ['#667EEA', '#764BA2'] as const,
    },
    {
      title: "Resolved",
      value: adminStats.resolved_issues,
      change: "",
      icon: "verified",
      color: ['#00E5A0', '#00D9F5'] as const,
    },
    {
      title: "Pending",
      value: adminStats.pending_issues,
      change: "",
      icon: "pending-actions",
      color: ['#FFB74D', '#FF9800'] as const,
    },
  ];


  useEffect(() => {
    loadIssues();
    startAnimations();

    // Auto-refresh every 15 seconds
    const interval = setInterval(loadIssues, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedIssue) {
      setSelectedStatus(selectedIssue.status);
      setResolutionNotes(selectedIssue.resolutionNotes || '');
      setResolvedBy(selectedIssue.resolvedBy || 'Admin');
      setShowResolveForm(selectedIssue.status === 'Resolved');
    }
  }, [selectedIssue]);

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

  const toggleDropdown = () => {
    if (showStatusDropdown) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setShowStatusDropdown(false));
    } else {
      setShowStatusDropdown(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const loadIssues = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE}/admin/issues`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();

      const mappedIssues: AdminIssue[] = apiData.issues.map((issue: any) => ({
        id: String(issue.id),
        title: issue.title,
        description: issue.description,
        category: issue.category || 'Other',
        urgencyLevel: issue.urgency_level || issue.urgencyLevel,
        status: issue.status,
        userName: issue.user_name || issue.userName,
        userEmail: issue.user_email || issue.userEmail,
        userMobile: issue.user_mobile || issue.userMobile,
        locationAddress: issue.location_address || issue.locationAddress,
        createdAt: issue.created_at || issue.createdAt,
        updatedAt: issue.updated_at || issue.updatedAt,
        resolutionNotes: issue.resolution_notes || issue.resolutionNotes,
        resolvedBy: issue.resolved_by || issue.resolvedBy,
        assignedDepartment: issue.assigned_department || issue.assignedDepartment,
      }));

      setIssues(mappedIssues);
    } catch (error: any) {
      console.error('Error loading issues:', error);
      setErrorMessage(`Error loading issues: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };


  const loadAdminDashboardStats = async () => {
    try {
      console.log("Calling stats API:", `${API_BASE}/admin/dashboard/stats`);

      const res = await fetch(`${API_BASE}/admin/dashboard/stats`);
      const data = await res.json();

      console.log("Stats response:", data);

      setAdminStats({
        total_issues: data.total_issues ?? 0,
        resolved_issues: data.resolved_issues ?? 0,
        pending_issues: data.pending_issues ?? 0,
        last_updated: data.last_updated ?? '',
      });
    } catch (err) {
      console.error("Stats API error:", err);
    }
  };

  useEffect(() => {
    loadIssues();
    loadAdminDashboardStats();

    const interval = setInterval(() => {
      loadIssues();
      loadAdminDashboardStats();
    }, 15000);

    return () => clearInterval(interval);
  }, []);


  const onRefresh = () => {
    setRefreshing(true);
    loadIssues();
  };
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[\s_-]/g, '');

  const getFilteredIssues = () => {
    const status = tabs[selectedTab].toLowerCase().replace(' ', '');
    return issues.filter(issue =>
      normalize(issue.status) === normalize(tabs[selectedTab])
    );
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/issues/${issueId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      // Update local state
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === issueId
            ? {
              ...issue,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              ...(newStatus === 'Resolved' && issue.status !== 'Resolved' ? {
                resolutionNotes: '',
                resolvedBy: 'Admin'
              } : {})
            }
            : issue
        )
      );

      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => prev ? {
          ...prev,
          status: newStatus,
          ...(newStatus === 'Resolved' && prev.status !== 'Resolved' ? {
            resolutionNotes: '',
            resolvedBy: 'Admin'
          } : {})
        } : null);
        setSelectedStatus(newStatus);
        if (newStatus === 'Resolved') {
          setShowResolveForm(true);
        } else {
          setShowResolveForm(false);
        }
      }

      Alert.alert('Success', `Status updated to ${newStatus}`, [
        { text: 'OK', onPress: () => { } }
      ]);
    } catch (error: any) {
      Alert.alert('Error', `Failed to update status: ${error.message || 'Unknown error'}`, [
        { text: 'OK', onPress: () => { } }
      ]);
    }
  };

  const resolveIssue = async (issueId: string, notes: string, resolvedBy: string) => {
    if (!notes.trim()) {
      Alert.alert('Error', 'Please enter resolution notes');
      return;
    }

    if (!resolvedBy.trim()) {
      Alert.alert('Error', 'Please enter who resolved this issue');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/admin/issues/${issueId}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolution_notes: notes,
            resolved_by: resolvedBy,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to resolve issue: ${response.status}`);
      }

      // Update local state
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === issueId
            ? {
              ...issue,
              status: 'Resolved',
              resolutionNotes: notes,
              resolvedBy: resolvedBy,
              updatedAt: new Date().toISOString()
            }
            : issue
        )
      );

      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => prev ? {
          ...prev,
          status: 'Resolved',
          resolutionNotes: notes,
          resolvedBy: resolvedBy
        } : null);
        setSelectedStatus('Resolved');
      }

      Alert.alert('Success', 'Issue resolved successfully', [
        {
          text: 'OK', onPress: () => {
            setModalVisible(false);
            setResolutionNotes('');
            setResolvedBy('Admin');
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', `Failed to resolve issue: ${error.message || 'Unknown error'}`);
    }
  };

  const deleteIssue = async (issueId: string) => {
    Alert.alert(
      'Delete Issue',
      'Are you sure you want to delete this issue? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE}/admin/issues/${issueId}`,
                { method: "DELETE" }
              );

              if (!response.ok) {
                throw new Error(`Failed to delete issue: ${response.status}`);
              }

              // Update local state
              setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));

              Alert.alert('Success', 'Issue deleted successfully');
              setModalVisible(false);
            } catch (error: any) {
              Alert.alert('Error', `Failed to delete issue: ${error.message || 'Unknown error'}`);
            }
          }
        },
      ]
    );
  };

  const getCategoryIcon = (category?: string): IconName => {
    if (!category) {
      return 'report-problem'; // default icon
    }

    switch (category.toLowerCase()) {
      case 'road maintenance':
        return 'road';
      case 'electricity':
        return 'flash-on';
      case 'sanitation':
        return 'delete';
      case 'water':
        return 'water-drop';
      default:
        return 'report-problem';
    }
  };


  const getUrgencyColor = (urgency?: string): string => {
  if (!urgency) return '#747D8C';

  switch (urgency.toLowerCase()) {
    case 'high':
    case 'urgent':
      return '#FF4757';
    case 'medium':
      return '#FFA502';
    case 'low':
      return '#2ED573';
    default:
      return '#747D8C';
  }
};


  const getStatusColor = (status?: string): string => {
  if (!status) return '#747D8C';

  switch (status.toLowerCase()) {
    case 'pending':
      return '#FFA502';
    case 'in progress':
      return '#1E90FF';
    case 'resolved':
      return '#2ED573';
    default:
      return '#747D8C';
  }
};


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStatCard = (stat: StatCard, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ],
        },
      ]}
    >
      <LinearGradient colors={stat.color} style={styles.statCardGradient}>
        <View style={styles.statHeader}>
          <Icon name={stat.icon} size={20} color="#FFFFFF" />
          <Text style={styles.statChange}>{stat.change}</Text>
        </View>
        <Text style={styles.statCardValue}>{stat.value}</Text>
        <Text style={styles.statCardTitle}>{stat.title}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderIssueCard = (issue: AdminIssue, index: number) => {
    const delay = index * 100;
    const animatedStyle = {
      opacity: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 20],
          })
        },
        {
          scale: scaleAnim.interpolate({
            inputRange: [0.95, 1],
            outputRange: [0.95, 1],
          })
        },
      ],
    };

    return (
      <Animated.View
        key={issue.id}
        style={[styles.issueCard, animatedStyle]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setSelectedIssue(issue);
            setModalVisible(true);
          }}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.issueCardGradient}
          >
            <View style={styles.issueHeader}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.categoryIcon}
              >
                <Icon
                  name={getCategoryIcon(issue.category)}
                  size={24}
                  color="#FFFFFF"
                />
              </LinearGradient>
              <View style={styles.issueInfo}>
                <Text style={styles.issueTitle} numberOfLines={1}>
                  {issue.title}
                </Text>
                <View style={styles.issueMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="location-on" size={14} color="#747D8C" />
                    <Text style={styles.metaText}>
                      {issue.locationAddress.split(',')[0]}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="schedule" size={14} color="#747D8C" />
                    <Text style={styles.metaText}>
                      {formatDate(issue.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(issue.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(issue.status) }]}>
                  {issue.status}
                </Text>
              </View>
            </View>

            <View style={styles.issueFooter}>
              <View style={styles.urgencyBadge}>
                <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(issue.urgencyLevel) }]} />
                <Text style={[styles.urgencyText, { color: getUrgencyColor(issue.urgencyLevel) }]}>
                  {issue.urgencyLevel}
                </Text>
              </View>
              <Text style={styles.issueId}>#{issue.id}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderStatusDropdown = () => {
    const dropdownHeight = dropdownAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, statusOptions.length * 50],
    });

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.statusSelector}
          onPress={toggleDropdown}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.statusSelectorGradient}
          >
            <Text style={styles.statusSelectorText}>
              Status: {selectedStatus}
            </Text>
            <Icon
              name={showStatusDropdown ? "expand-less" : "expand-more"}
              size={24}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        {showStatusDropdown && (
          <Animated.View
            style={[
              styles.dropdownMenu,
              { height: dropdownHeight }
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={styles.dropdownGradient}
            >
              {statusOptions.map((status, index) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.dropdownItem,
                    selectedStatus === status && styles.dropdownItemActive
                  ]}
                  onPress={() => {
                    if (selectedIssue) {
                      updateIssueStatus(selectedIssue.id, status);
                    }
                    setSelectedStatus(status);
                    if (status === 'Resolved') {
                      setShowResolveForm(true);
                    } else {
                      setShowResolveForm(false);
                    }
                    toggleDropdown();
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                    <Text style={[
                      styles.dropdownItemText,
                      selectedStatus === status && styles.dropdownItemTextActive
                    ]}>
                      {status}
                    </Text>
                  </View>
                  {selectedStatus === status && (
                    <Icon name="check" size={20} color="#667EEA" />
                  )}
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderResolveForm = () => (
    <View style={styles.resolveForm}>
      <Text style={styles.formTitle}>Resolution Details</Text>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Resolution Notes *</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Enter detailed resolution notes..."
          placeholderTextColor="#A0A0A0"
          value={resolutionNotes}
          onChangeText={setResolutionNotes}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Resolved By *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter name or department..."
          placeholderTextColor="#A0A0A0"
          value={resolvedBy}
          onChangeText={setResolvedBy}
        />
      </View>

      <TouchableOpacity
        style={styles.confirmResolveButton}
        onPress={() => {
          if (selectedIssue) {
            resolveIssue(selectedIssue.id, resolutionNotes, resolvedBy);
          }
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#00E5A0', '#00D9F5']}
          style={styles.confirmResolveGradient}
        >
          <Icon name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.confirmResolveText}>Confirm Resolution</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedIssue) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.modalHeader}
              >
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Icon name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {selectedIssue.title}
                  </Text>
                  <View style={styles.urgencyDisplay}>
                    <View style={[styles.urgencyDotLarge, { backgroundColor: getUrgencyColor(selectedIssue.urgencyLevel) }]} />
                    <Text style={[styles.urgencyTextLarge, { color: getUrgencyColor(selectedIssue.urgencyLevel) }]}>
                      {selectedIssue.urgencyLevel}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Status Update Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Update Status</Text>
                {renderStatusDropdown()}
              </View>

              {/* Reporter Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reporter Information</Text>
                <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Icon name="person" size={20} color="#667EEA" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Name</Text>
                      <Text style={styles.infoValue}>{selectedIssue.userName}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="phone" size={20} color="#667EEA" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Phone</Text>
                      <Text style={styles.infoValue}>{selectedIssue.userMobile}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="email" size={20} color="#667EEA" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{selectedIssue.userEmail}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Issue Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Issue Details</Text>
                <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Icon name="description" size={20} color="#FF6B6B" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Description</Text>
                      <Text style={styles.infoValue}>{selectedIssue.description}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="location-on" size={20} color="#4ECDC4" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Location</Text>
                      <Text style={styles.infoValue}>{selectedIssue.locationAddress}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="category" size={20} color="#FFD166" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Category</Text>
                      <Text style={styles.infoValue}>{selectedIssue.category}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="calendar-today" size={20} color="#A78BFA" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Reported On</Text>
                      <Text style={styles.infoValue}>{formatDate(selectedIssue.createdAt)}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Resolution Form (if status is Resolved) */}
              {showResolveForm && renderResolveForm()}

              {/* Existing Resolution Details (if already resolved) */}
              {selectedIssue.status === 'Resolved' && selectedIssue.resolutionNotes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Resolution Details</Text>
                  <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Icon name="notes" size={20} color="#00E5A0" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Resolution Notes</Text>
                        <Text style={styles.infoValue}>{selectedIssue.resolutionNotes}</Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="verified-user" size={20} color="#00E5A0" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Resolved By</Text>
                        <Text style={styles.infoValue}>{selectedIssue.resolvedBy}</Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="update" size={20} color="#00E5A0" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Last Updated</Text>
                        <Text style={styles.infoValue}>{formatDate(selectedIssue.updatedAt)}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    if (selectedIssue) {
                      deleteIssue(selectedIssue.id);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF4757']}
                    style={styles.buttonGradient}
                  >
                    <Icon name="delete" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Delete Issue</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.resolveButton]}
                  onPress={() => {
                    if (selectedIssue && selectedStatus === 'Resolved') {
                      if (showResolveForm) {
                        // Show validation for resolve form
                        if (!resolutionNotes.trim()) {
                          Alert.alert('Error', 'Please enter resolution notes');
                          return;
                        }
                        if (!resolvedBy.trim()) {
                          Alert.alert('Error', 'Please enter who resolved this issue');
                          return;
                        }
                        resolveIssue(selectedIssue.id, resolutionNotes, resolvedBy);
                      } else {
                        setShowResolveForm(true);
                      }
                    } else if (selectedIssue) {
                      updateIssueStatus(selectedIssue.id, 'Resolved');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={selectedStatus === 'Resolved' ? ['#00E5A0', '#00D9F5'] : ['#667EEA', '#764BA2']}
                    style={styles.buttonGradient}
                  >
                    <Icon name={selectedStatus === 'Resolved' ? "check-circle" : "done-all"} size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>
                      {selectedStatus === 'Resolved'
                        ? (showResolveForm ? 'Confirm Resolution' : 'Mark as Resolved')
                        : 'Mark as Resolved'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.modalSpacer} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667EEA" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Track Issue Progress</Text>
              <Text style={styles.headerSubtitle}>
                Monitor and update issues in real time
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <View style={styles.iconBackground}>
                <Icon name="track-changes" size={40} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stats Overview */}
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => renderStatCard(stat, index))}
        </View>
      </Animated.View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === index && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === index && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {selectedTab === index && (
              <View style={styles.tabIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Issues List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingSpinner,
              {
                transform: [
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="refresh" size={40} color="#667EEA" />
          </Animated.View>
          <Text style={styles.loadingText}>Loading issues...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#FF6B6B" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadIssues}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.retryButtonGradient}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getFilteredIssues()}
          renderItem={({ item, index }) => renderIssueCard(item, index)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.issuesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#667EEA']}
              tintColor="#667EEA"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={60} color="#D1D8E0" />
              <Text style={styles.emptyText}>No issues found</Text>
              <Text style={styles.emptySubtext}>
                No {tabs[selectedTab].toLowerCase()} issues at the moment
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fab,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={loadIssues}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.fabGradient}
          >
            <Icon name="refresh" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Detail Modal */}
      {renderDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    height: 180,
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    marginTop: -20,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  statCardGradient: {
    padding: 16,
    minHeight: 100,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#F5F7FB',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8F92A1',
  },
  activeTabText: {
    color: '#667EEA',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 3,
    backgroundColor: '#667EEA',
    borderRadius: 2,
  },
  issuesList: {
    padding: 20,
    paddingBottom: 100,
  },
  issueCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  issueCardGradient: {
    padding: 20,
    borderRadius: 20,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  issueInfo: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  issueMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#747D8C',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  issueId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F92A1',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 40,
  },
  retryButton: {
    marginTop: 24,
    borderRadius: 25,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 10,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 40,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  urgencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgencyDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  urgencyTextLarge: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  statusSelector: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusSelectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownGradient: {
    padding: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#667EEA',
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F92A1',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  resolveForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#2D3436',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmResolveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  confirmResolveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  confirmResolveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButton: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resolveButton: {
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
  modalSpacer: {
    height: 20,
  },
});

export default IssueTrackingPage;