import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from "../config/api";
import { useAuth } from '../contexts/AuthContext';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Home,
  User,
  Search,
  Clock,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  FileText,
  Tag,
  Building,
  ChevronRight,
  Fingerprint,
  Shield,
  FileCheck,
  Clock4,
  Users,
  CheckSquare,
  Circle,
} from 'lucide-react-native';
import Constants from 'expo-constants';



// Enhanced formal color palette for government website
const COLORS = {
  // Primary Government Blue Theme
  primary: '#1E3A8A',
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',
  primaryGradient: ['#1E3A8A', '#2563EB', '#3B82F6'] as const,

  // Background colors
  background: '#F8FAFC',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#0F172A',

  // Card colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',

  // Status colors
  success: '#059669',
  successLight: '#10B981',
  warning: '#D97706',
  warningLight: '#F59E0B',
  info: '#4F46E5',
  infoLight: '#6366F1',
  pending: '#6B7280',

  // Text colors
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textLight: '#F9FAFB',

  // UI Elements
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: 'rgba(17, 24, 39, 0.05)',
  shadowDark: 'rgba(17, 24, 39, 0.1)',

  // Government-specific colors
  govBlue: '#1E3A8A',
  govGold: '#B8860B',
  govGreen: '#059669',
  govRed: '#DC2626',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// Normalize status function
const normalizeStatus = (status: string) =>
  status.toLowerCase().replace(/\s/g, '_');

// Stats Component
const StatsOverview = ({ stats }: { stats: { total: number, resolved: number, inProgress: number, pending: number } }) => {
  const statsData = [
    { label: 'Total\nComplaints', value: stats.total, color: COLORS.primary, icon: FileText },
    { label: 'Resolved', value: stats.resolved, color: COLORS.success, icon: CheckSquare },
    { label: 'In Progress', value: stats.inProgress, color: COLORS.warning, icon: Clock4 },
    { label: 'Pending', value: stats.pending, color: COLORS.pending, icon: Users },
  ];

  return (
    <View style={styles.statsContainer}>
      {statsData.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
            <stat.icon size={20} color={stat.color} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

// Enhanced Header Component with government seal effect
const EnhancedHeader = ({ onProfile, onHome, searchQuery, onSearchChange }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        delay: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const titleScale = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1]
  });

  const titleOpacity = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        { opacity: fadeAnim }
      ]}
    >
      {/* Government Seal Background */}
      <View style={styles.govSealContainer}>
        <LinearGradient
          colors={['rgba(30, 58, 138, 0.9)', 'rgba(30, 64, 175, 0.95)']}
          style={styles.govSeal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.sealInner}>
            <FileCheck size={40} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.headerContent}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={onProfile}
            style={({ pressed }) => [
              styles.headerButton,
              { transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
          >
            <User size={22} color={COLORS.textLight} />
          </Pressable>

          <Pressable
            onPress={onHome}
            style={({ pressed }) => [
              styles.headerButton,
              { transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
          >
            <Home size={22} color={COLORS.textLight} />
          </Pressable>
        </View>

        <View style={styles.headerMain}>
          <Animated.View style={{
            transform: [{ scale: titleScale }],
            opacity: titleOpacity
          }}>
            <Text style={styles.headerTitle}>Track Issues Here !</Text>
            <Text style={styles.headerSubtitle}>Monitor Your Complaint Status</Text>
          </Animated.View>

          <View style={styles.govBadge}>
            <Shield size={16} color={COLORS.govGold} />
            <Text style={styles.govBadgeText}></Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search complaints by ID, location, or category..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// Enhanced Filter Chips Component
const FilterChips = ({ currentFilter, onFilterChange }: any) => {
  const filters = [
    { id: 'all', label: 'All Complaints', color: COLORS.primary },
    { id: 'active', label: 'Active', color: COLORS.warning },
    { id: 'resolved', label: 'Resolved', color: COLORS.success },
    { id: 'pending', label: 'Pending', color: COLORS.pending },
  ];

  return (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {filters.map((filter) => (
          <Pressable
            key={filter.id}
            onPress={() => onFilterChange(filter.id)}
            style={({ pressed }) => [
              styles.filterChip,
              currentFilter === filter.id && [
                styles.filterChipSelected,
                { backgroundColor: `${filter.color}10`, borderColor: filter.color }
              ],
              { transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
          >
            <View style={[
              styles.filterDot,
              { backgroundColor: currentFilter === filter.id ? filter.color : '#9CA3AF' }
            ]} />
            <Text style={[
              styles.filterChipText,
              currentFilter === filter.id && [
                styles.filterChipTextSelected,
                { color: filter.color }
              ]
            ]}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

// Enhanced Timeline Component matching the image
const TimelineComponent = ({ timeline, statusColor, showTimeline }: any) => {
  const timelineAnim = useRef(new Animated.Value(0)).current;
  const dotAnimations = useRef(timeline.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (showTimeline) {
      Animated.sequence([
        Animated.timing(timelineAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.stagger(150, dotAnimations.map((anim: Animated.Value) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 200,
            friction: 20,
            useNativeDriver: true,
          })
        ))
      ]).start();
    } else {
      Animated.timing(timelineAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      dotAnimations.forEach((anim: Animated.Value) => anim.setValue(0));
    }
  }, [showTimeline]);

  const timelineOpacity = timelineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const timelineTranslateY = timelineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0]
  });

  return (
    <AnimatedView style={[
      styles.timelineContainer,
      {
        opacity: timelineOpacity,
        transform: [{ translateY: timelineTranslateY }]
      }
    ]}>
      <Text style={styles.timelineTitle}>Complaint Timeline</Text>

      <View style={styles.timelineWrapper}>
        {timeline.map((item: any, index: number) => {
          const dotScale = dotAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          });

          const dotOpacity = dotAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          });

          return (
            <View key={item.step} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <AnimatedView style={[
                  styles.timelineDotWrapper,
                  {
                    transform: [{ scale: dotScale }],
                    opacity: dotOpacity
                  }
                ]}>
                  <View style={[
                    styles.timelineDot,
                    item.completed && { backgroundColor: statusColor }
                  ]}>
                    {item.completed ? (
                      <CheckCircle size={12} color="#FFFFFF" />
                    ) : (
                      <Circle size={8} color={item.completed ? '#FFFFFF' : '#D1D5DB'} />
                    )}
                  </View>
                </AnimatedView>

                {index < timeline.length - 1 && (
                  <View style={[
                    styles.timelineConnector,
                    item.completed && { backgroundColor: statusColor }
                  ]} />
                )}
              </View>

              <View style={styles.timelineRight}>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineStepText,
                    item.completed && { color: COLORS.textPrimary, fontWeight: '700' }
                  ]}>
                    {item.step === 'submitted' ? 'Submitted' :
                      item.step === 'assigned' ? 'Assigned' :
                        item.step === 'in_progress' ? 'In Progress' : 'Resolved'}
                  </Text>

                  <Text style={[
                    styles.timelineDateText,
                    item.completed ? { color: statusColor } : { color: '#9CA3AF' }
                  ]}>
                    {item.date}
                  </Text>

                  {item.description && (
                    <Text style={styles.timelineDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </AnimatedView>
  );
};

// Enhanced Complaint Card Component
const ComplaintCard = ({ report, onPress }: any) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const getStatusConfig = (status: string) => {
    const normalizedStatus = normalizeStatus(status);

    switch (normalizedStatus) {
      case 'submitted':
      case 'reported':
        return {
          text: 'Submitted',
          color: '#6B7280',
          icon: FileText,
          bgColor: '#F3F4F6'
        };
      case 'assigned':
        return {
          text: 'Assigned',
          color: '#2563EB',
          icon: Users,
          bgColor: '#DBEAFE'
        };
      case 'in_progress':
        return {
          text: 'In Progress',
          color: '#D97706',
          icon: Clock4,
          bgColor: '#FEF3C7'
        };
      case 'resolved':
      case 'closed':
        return {
          text: 'Resolved',
          color: '#059669',
          icon: CheckSquare,
          bgColor: '#D1FAE5'
        };
      default:
        return {
          text: 'Submitted',
          color: '#6B7280',
          icon: FileText,
          bgColor: '#F3F4F6'
        };
    }
  };

  const loadTimeline = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/${report.id}/timeline`);
      const data = await res.json();

      setTimeline(
        data.timeline.map((t: any) => ({
          step: t.event.toLowerCase().replace(/\s/g, '_'),
          date: new Date(t.timestamp).toLocaleString(),
          completed: t.status === "completed",
          description: t.description,
        }))
      );
    } catch (error) {
      console.error("Failed to load timeline:", error);
    }
  };

  useEffect(() => {
    if (showTimeline) {
      loadTimeline();
    }
  }, [showTimeline, timeline.length]);

  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case 'High':
        return { color: '#DC2626', bgColor: '#FEE2E2', icon: AlertCircle };
      case 'Medium':
        return { color: '#D97706', bgColor: '#FEF3C7', icon: AlertCircle };
      default:
        return { color: '#059669', bgColor: '#D1FAE5', icon: AlertCircle };
    }
  };

  const statusConfig = getStatusConfig(report.status);
  const urgencyConfig = getUrgencyConfig(report.urgency_level || 'Medium');

  const handlePress = () => {
    const toValue = showTimeline ? 0 : 1;
    setShowTimeline(!showTimeline);

    Animated.spring(cardAnim, {
      toValue,
      tension: 200,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const cardScale = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.01]
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.complaintCard,
        { transform: [{ scale: cardScale }] }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.complaintIdBadge}>
          <Fingerprint size={14} color={COLORS.primary} />
          <Text style={styles.complaintId}>{report.complaint_id}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <statusConfig.icon size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      <Text style={styles.complaintTitle} numberOfLines={2}>
        {report.title}
      </Text>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Tag size={16} color={COLORS.textMuted} />
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{report.category}</Text>
        </View>

        <View style={styles.detailItem}>
          <Calendar size={16} color={COLORS.textMuted} />
          <Text style={styles.detailLabel}>Submitted:</Text>
          <Text style={styles.detailValue}>{report.date || report.submitted_on}</Text>
        </View>

        <View style={styles.detailItem}>
          <Building size={16} color={COLORS.textMuted} />
          <Text style={styles.detailLabel}>Department:</Text>
          <Text style={styles.detailValue}>{report.department || 'Public Works Department'}</Text>
        </View>

        <View style={styles.detailItem}>
          <MapPin size={16} color={COLORS.textMuted} />
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={[styles.detailValue, { color: COLORS.primary }]}>
            {report.location_address}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.urgencyBadge, { backgroundColor: urgencyConfig.bgColor }]}>
          <urgencyConfig.icon size={14} color={urgencyConfig.color} />
          <Text style={[styles.urgencyText, { color: urgencyConfig.color }]}>
            {(report.urgency_level || 'Medium') + ' Priority'}
          </Text>
        </View>

        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.actionButton,
            { transform: [{ scale: pressed ? 0.95 : 1 }] }
          ]}
        >
          <Text style={styles.actionButtonText}>
            {showTimeline ? 'Hide Timeline' : 'View Timeline'}
          </Text>
          <ChevronRight size={16} color={COLORS.primary} style={{
            transform: [{ rotate: showTimeline ? '90deg' : '0deg' }],
            marginLeft: 4
          }} />
        </Pressable>
      </View>

      {/* Enhanced Timeline Component */}
      {showTimeline && timeline.length > 0 && (
        <TimelineComponent
          timeline={timeline}
          statusColor={statusConfig.color}
          showTimeline={showTimeline}
        />
      )}
    </AnimatedPressable>
  );
};

// Main Screen Component
export default function UserReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'active' | 'resolved' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, pending: 0 });



  const {
    token,
    userEmail,
    isLoading: authLoading
  } = useAuth();
  if (authLoading) {
    return null; // or a loading spinner
  }

  if (!userEmail) {
    return null; // or redirect to login
  }

  const USER_EMAIL = userEmail;

  const loadUserReports = async (filter = currentFilter) => {
    if (!token) return; // ✅ safety

    try {
      setIsLoading(true);

      const res = await fetch(
        `${API_BASE}/users/reports/filtered?status_filter=${filter}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Unauthorized or failed request");
        return;
      }

      const data = await res.json();

      const formattedReports = (data.complaints ?? []).map((report: any) => ({
        ...report,
        status: normalizeStatus(report.status),
        submitted_on: report.date || report.submitted_on,
      }));

      setReports(formattedReports);
      setFilteredReports(formattedReports);

      const total = formattedReports.length;
      const resolved = formattedReports.filter((r: any) =>
        ["resolved", "closed"].includes(normalizeStatus(r.status))
      ).length;

      const inProgress = formattedReports.filter((r: any) =>
        normalizeStatus(r.status) === "in_progress"
      ).length;

      const pending = formattedReports.filter((r: any) =>
        ["submitted", "reported", "assigned"].includes(normalizeStatus(r.status))
      ).length;

      setStats({ total, resolved, inProgress, pending });

    } catch (err) {
      console.error("Failed to load user reports", err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (token) {
      loadUserReports();
    }
  }, [token]);


  const handleFilterChange = (filter: 'all' | 'active' | 'resolved' | 'pending') => {
    setCurrentFilter(filter);
    loadUserReports(filter);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      loadUserReports(currentFilter);
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${API_BASE}/users/reports/search?query=${encodeURIComponent(query)}&user_email=${encodeURIComponent(USER_EMAIL)}`
      );

      const data = await res.json();

      const formattedReports = (data.complaints ?? []).map((report: any) => ({
        ...report,
        status: normalizeStatus(report.status),
        submitted_on: report.date || report.submitted_on,
      }));

      setFilteredReports(formattedReports);
    } catch (err) {
      console.error("Search failed", err);
      setFilteredReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportPress = (report: any) => {
    console.log('Navigate to report details:', report.id);
    // TODO: Implement navigation to report details
  };

  const handleHomePress = () => {
    console.log('Navigate to home');
    // TODO: Implement navigation to home
  };

  const handleProfilePress = () => {
    console.log('Navigate to profile');
    // TODO: Implement navigation to profile
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Header (now scrollable with content) */}
        <EnhancedHeader
          onHome={handleHomePress}
          onProfile={handleProfilePress}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Filter Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Complaints</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredReports.length} complaint{filteredReports.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        <FilterChips
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.spinner} />
            <Text style={styles.loadingText}>Loading complaints...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No complaints found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'No complaints match the selected filter'}
            </Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {filteredReports.map((report) => (
              <ComplaintCard
                key={report.id}
                report={report}
                onPress={() => handleReportPress(report)}
              />
            ))}
          </View>
        )}

        {/* Footer Information */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerTitle}>Need Help?</Text>
          <Text style={styles.footerText}>
            Contact our Public Grievance Department at grievance@government.gov
            or call 1800-XXX-XXXX during office hours (9 AM - 6 PM)
          </Text>
          <Text style={styles.footerNote}>
            Average resolution time: 3-5 working days
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Report Details Screen Component
export function ReportDetailsScreen({ route, navigation }: any) {
  const { reportId } = route.params || { reportId: 1 };
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReportDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/reports/${reportId}/timeline`);
        const data = await res.json();

        if (data.complaint_details) {
          setReport({
            ...data.complaint_details,
            status: normalizeStatus(data.complaint_details.status),
          });
        }
      } catch (error) {
        console.error("Failed to load report details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportDetails();
  }, [reportId]);

  const getStatusConfig = (status: string) => {
    const normalizedStatus = normalizeStatus(status);

    switch (normalizedStatus) {
      case 'submitted':
      case 'reported':
        return { text: 'Submitted', color: '#6B7280', bgColor: '#F3F4F6' };
      case 'assigned':
        return { text: 'Assigned', color: '#2563EB', bgColor: '#DBEAFE' };
      case 'in_progress':
        return { text: 'In Progress', color: '#D97706', bgColor: '#FEF3C7' };
      case 'resolved':
      case 'closed':
        return { text: 'Resolved', color: '#059669', bgColor: '#D1FAE5' };
      default:
        return { text: 'Submitted', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.loadingContainer}>
          <View style={styles.spinner} />
          <Text style={styles.loadingText}>Loading complaint details...</Text>
        </View>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.emptyContainer}>
          <FileText size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Report not found</Text>
          <Text style={styles.emptySubtitle}>
            The requested complaint could not be loaded
          </Text>
        </View>
      </View>
    );
  }

  const statusConfig = getStatusConfig(report.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.detailsHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            { transform: [{ scale: pressed ? 0.95 : 1 }] }
          ]}
        >
          <ArrowLeft size={24} color={COLORS.textLight} />
        </Pressable>
        <Text style={styles.detailsHeaderTitle}>Complaint Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.detailsScrollView}
        contentContainerStyle={styles.detailsScrollContent}
      >
        <View style={styles.detailsCard}>
          <View style={styles.detailsCardHeader}>
            <Text style={styles.detailsTitle}>{report.title}</Text>
            <View style={[styles.detailsStatusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={[styles.detailsStatusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>

          <View style={styles.detailsInfoGrid}>
            <View style={styles.detailInfoRow}>
              <Fingerprint size={18} color={COLORS.primary} />
              <Text style={styles.detailInfoLabel}>Complaint ID:</Text>
              <Text style={styles.detailInfoValue}>{report.complaint_id}</Text>
            </View>

            <View style={styles.detailInfoRow}>
              <Calendar size={18} color={COLORS.primary} />
              <Text style={styles.detailInfoLabel}>Submitted on:</Text>
              <Text style={styles.detailInfoValue}>{report.submitted_on}</Text>
            </View>

            <View style={styles.detailInfoRow}>
              <Tag size={18} color={COLORS.primary} />
              <Text style={styles.detailInfoLabel}>Category:</Text>
              <Text style={styles.detailInfoValue}>{report.category}</Text>
            </View>

            <View style={styles.detailInfoRow}>
              <Building size={18} color={COLORS.primary} />
              <Text style={styles.detailInfoLabel}>Department:</Text>
              <Text style={styles.detailInfoValue}>{report.department}</Text>
            </View>

            <View style={styles.detailInfoRow}>
              <MapPin size={18} color={COLORS.primary} />
              <Text style={styles.detailInfoLabel}>Location:</Text>
              <Text style={[styles.detailInfoValue, { color: COLORS.primary }]}>
                {report.location_address}
              </Text>
            </View>

            <View style={styles.detailInfoRow}>
              <AlertCircle size={18} color={COLORS.primary} />
              <Text style={styles.detailInfoLabel}>Urgency Level:</Text>
              <Text style={[
                styles.detailInfoValue,
                {
                  color: report.urgency_level === 'High' ? '#DC2626' :
                    report.urgency_level === 'Medium' ? '#D97706' : '#059669',
                  fontWeight: '600'
                }
              ]}>
                {report.urgency_level || 'Medium'}
              </Text>
            </View>

            {report.officer_assigned && report.officer_assigned !== 'Pending' && (
              <View style={styles.detailInfoRow}>
                <User size={18} color={COLORS.primary} />
                <Text style={styles.detailInfoLabel}>Officer Assigned:</Text>
                <Text style={styles.detailInfoValue}>{report.officer_assigned}</Text>
              </View>
            )}

            {report.estimated_resolution && (
              <View style={styles.detailInfoRow}>
                <Clock size={18} color={COLORS.primary} />
                <Text style={styles.detailInfoLabel}>Estimated Resolution:</Text>
                <Text style={styles.detailInfoValue}>{report.estimated_resolution}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header Styles
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: Constants.statusBarHeight + 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  govSealContainer: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    opacity: 0.1,
  },
  govSeal: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: -0.5,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  govBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 6,
  },
  govBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  searchContainer: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  // Filter Styles
  filterContainer: {
    marginBottom: 20,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 8,
  },
  filterChipSelected: {
    borderWidth: 1.5,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  filterChipTextSelected: {
    fontWeight: '600',
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Loading States
  loadingContainer: {
    padding: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  // Empty State
  emptyContainer: {
    padding: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Complaint Card
  reportsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  complaintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  complaintIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  complaintId: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    minWidth: 70,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Timeline Styles (Matching Image)
  timelineContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  timelineWrapper: {
    marginLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    minHeight: 60,
  },
  timelineLeft: {
    width: 32,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDotWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    zIndex: 2,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineConnector: {
    position: 'absolute',
    top: 28,
    left: 13,
    width: 2,
    height: '100%',
    backgroundColor: '#E5E7EB',
    zIndex: 1,
  },
  timelineRight: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  timelineDateText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  timelineDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  // Footer Info
  footerInfo: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  footerNote: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  // Details Screen
  detailsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsScrollContent: {
    padding: 16,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  detailsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 16,
    lineHeight: 28,
  },
  detailsStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  detailsStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsInfoGrid: {
    gap: 16,
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    width: 140,
  },
  detailInfoValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
});