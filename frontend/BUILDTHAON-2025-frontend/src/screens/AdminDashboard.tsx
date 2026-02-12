import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "expo-router";
import { API_BASE } from "../config/api";
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
  Platform,
  LayoutAnimation,
  UIManager,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon, { IconName } from '../components/icon';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

interface StatCard {
  title: string;
  value: number;
  change: string;
  icon: IconName;
  color: readonly [string, string];
}

interface MonthlyTrend {
  month: string;
  issues: number;
}

interface DepartmentPerformance {
  department: string;
  progress: number;
  icon: IconName;
}

interface RecentReport {
  id: string;
  title: string;
  location: string;
  time: string;
  status: string;
  icon: string;
}

// Enhanced Government Color Palette
const COLORS = {
  // Primary Government Colors
  primary: '#1A365D', // Deep Navy Blue
  primaryLight: '#2D4A8C',
  primaryDark: '#0F2545',
  secondary: '#2B6CB0', // Official Blue
  secondaryLight: '#4299E1',
  secondaryDark: '#2C5282',

  // Accent Colors
  accentBlue: '#3182CE',
  accentTeal: '#319795',
  accentGreen: '#38A169',
  accentOrange: '#DD6B20',
  accentRed: '#E53E3E',
  accentPurple: '#805AD5',

  // Neutral Colors
  background: '#F7FAFC', // Light Gray-Blue
  surface: '#FFFFFF',
  surfaceLight: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',

  // Text Colors
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  textLight: '#FFFFFF',

  // Status Colors
  success: '#38A169',
  successLight: '#9AE6B4',
  successDark: '#2F855A',
  warning: '#D69E2E',
  warningLight: '#FBD38D',
  warningDark: '#B7791F',
  danger: '#E53E3E',
  dangerLight: '#FEB2B2',
  dangerDark: '#C53030',
  info: '#3182CE',
  infoLight: '#90CDF4',
  infoDark: '#2C5282',

  // Gradient Colors
  gradientPrimary: ['#1A365D', '#2D4A8C'] as const,
  gradientSecondary: ['#2B6CB0', '#4299E1'] as const,
  gradientSuccess: ['#38A169', '#48BB78'] as const,
  gradientWarning: ['#D69E2E', '#ECC94B'] as const,
  gradientDanger: ['#E53E3E', '#FC8181'] as const,
  gradientTeal: ['#319795', '#38B2AC'] as const,
  gradientPurple: ['#805AD5', '#9F7AEA'] as const,
};

// Counter animation component
const AnimatedCounter = ({ value, duration = 1000, style }: { value: number; duration?: number; style: any }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listenerId = animatedValue.addListener(({ value: val }) => {
      setDisplayValue(Math.floor(val));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, duration]);

  return <Text style={style}>{displayValue.toLocaleString()}</Text>;
};

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [slideAnim] = useState(new Animated.Value(50));

  // Animation refs for icon press feedback
  const iconScaleAnims = useRef<Animated.Value[]>([]);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [totalIssues, setTotalIssues] = useState(0);
  const [resolvedIssues, setResolvedIssues] = useState(0);
  const [pendingIssues, setPendingIssues] = useState(0);

  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/dashboard/monthly-trends`)
      .then(res => res.json())
      .then(data => setMonthlyTrends(data.monthly_trends))
      .catch(console.error);
  }, []);

  const departmentIconMap: Record<string, IconName> = {
    "Water Dept": "water",
    "Road Dept": "road",
    "Sanitation Dept": "cleaning-services",
    "Electricity Dept": "bolt",
    "Public Works": "construction",
    "Other": "more-horiz"
  };

  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/dashboard/department-performance`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.departments.map((d: any) => ({
          department: d.department,
          progress: d.progress,
          icon: departmentIconMap[d.department] || "more-horiz",
        }));
        setDepartmentPerformance(formatted);
      })
      .catch(console.error);
  }, []);

  const statusIconMap: Record<string, string> = {
    Pending: "🕒",
    Resolved: "✅",
    New: "🆕",
    "In Progress": "🚧"
  };

  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/dashboard/recent-reports?limit=4`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.recent_reports.map((r: any) => ({
          id: r.id.toString(),
          title: r.title,
          location: r.location,
          time: r.time_ago,
          status: r.status,
          icon: r.status === "Resolved" ? "✅" :
            r.status === "Pending" ? "🕒" : "🆕",
        }));
        setRecentReports(formatted);
      });
  }, []);

  useEffect(() => {
    console.log("Calling stats API:", `${API_BASE}/admin/dashboard/stats`);

    fetch(`${API_BASE}/admin/dashboard/stats`)
      .then(res => res.json())
      .then(data => {
        console.log("Stats response:", data);

        setTotalIssues(data.total_issues ?? 0);
        setResolvedIssues(data.resolved_issues ?? 0);
        setPendingIssues(data.pending_issues ?? 0);
      })
      .catch(err => {
        console.error("Stats API error:", err);
      });
  }, []);

  // Initialize icon animations
  useEffect(() => {
    const numIcons = 6; // Footer icons count
    for (let i = 0; i < numIcons; i++) {
      iconScaleAnims.current[i] = new Animated.Value(1);
    }
  }, []);

  // Start progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
      delay: 500,
    }).start();
  }, []);

  useEffect(() => {
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
  }, []);

  // Icon press animation
  const handleIconPress = (iconIndex: number) => {
    const iconAnim = iconScaleAnims.current[iconIndex];

    Animated.sequence([
      Animated.timing(iconAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(iconAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderFooter = () => (
    <Animated.View
      style={[
        styles.footer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.footerContainer}>
        {/* Dept Analysis */}
        <TouchableWithoutFeedback
          onPressIn={() => handleIconPress(0)}
          onPress={() => {
            setSelectedIndex(0);
            router.push("/admin/dept-analysis");
          }}
        >
          <Animated.View
            style={[
              styles.footerButton,
              selectedIndex === 0 && styles.footerButtonActive,
            ]}
          >
            <Animated.View
              style={[
                styles.footerIconWrapper,
                selectedIndex === 0 && styles.footerIconWrapperActive,
                {
                  transform: [{ scale: iconScaleAnims.current[0] || 1 }],
                }
              ]}
            >
              <Icon
                name="analytics"
                size={22}
                color={selectedIndex === 0 ? COLORS.textLight : COLORS.textMuted}
              />
            </Animated.View>
            <Text style={[
              styles.footerLabel,
              selectedIndex === 0 && styles.footerLabelActive,
            ]} numberOfLines={1}>
              Analysis
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* Issue Reports */}
        <TouchableWithoutFeedback
          onPressIn={() => handleIconPress(1)}
          onPress={() => {
            setSelectedIndex(1);
            router.push("/admin/issues");
          }}
        >
          <Animated.View
            style={[
              styles.footerButton,
              selectedIndex === 1 && styles.footerButtonActive,
            ]}
          >
            <Animated.View
              style={[
                styles.footerIconWrapper,
                selectedIndex === 1 && styles.footerIconWrapperActive,
                {
                  transform: [{ scale: iconScaleAnims.current[1] || 1 }],
                }
              ]}
            >
              <Icon
                name="description"
                size={22}
                color={selectedIndex === 1 ? COLORS.textLight : COLORS.textMuted}
              />
            </Animated.View>
            <Text style={[
              styles.footerLabel,
              selectedIndex === 1 && styles.footerLabelActive,
            ]} numberOfLines={1}>
              Issues
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* Map View */}
        <TouchableWithoutFeedback
          onPressIn={() => handleIconPress(2)}
          onPress={() => {
            setSelectedIndex(2);
            router.push("/admin/map-view");
          }}
        >
          <Animated.View
            style={[
              styles.footerButton,
              selectedIndex === 2 && styles.footerButtonActive,
            ]}
          >
            <Animated.View
              style={[
                styles.footerIconWrapper,
                selectedIndex === 2 && styles.footerIconWrapperActive,
                {
                  transform: [{ scale: iconScaleAnims.current[2] || 1 }],
                }
              ]}
            >
              <Icon
                name="map"
                size={22}
                color={selectedIndex === 2 ? COLORS.textLight : COLORS.textMuted}
              />
            </Animated.View>
            <Text style={[
              styles.footerLabel,
              selectedIndex === 2 && styles.footerLabelActive,
            ]} numberOfLines={1}>
              Map
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </Animated.View>
  );

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
      <LinearGradient
        colors={stat.color}
        style={styles.statCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardContent}>
          <View style={styles.statHeader}>
            <View style={styles.statIconContainer}>
              <Icon name={stat.icon} size={22} color={COLORS.textLight} />
            </View>
            {stat.change && (
              <View style={[
                styles.changeBadge,
                { backgroundColor: stat.change.includes('+') ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)' }
              ]}>
                <Icon
                  name={stat.change.includes('+') ? "trending-up" : "trending-down"}
                  size={12}
                  color={COLORS.textLight}
                />
                <Text style={styles.statChange} numberOfLines={1}>
                  {stat.change}
                </Text>
              </View>
            )}
          </View>
          <AnimatedCounter
            value={stat.value}
            style={styles.statCardValue}
            duration={1500}
          />
          <Text style={styles.statCardTitle} numberOfLines={2}>
            {stat.title}
          </Text>

          {/* Animated Background Pattern */}
          <View style={styles.statCardPattern}>
            <View style={[styles.patternCircle, { backgroundColor: 'rgba(255, 255, 255, 0.1)', right: 10, top: 10 }]} />
            <View style={[styles.patternCircle, { backgroundColor: 'rgba(255, 255, 255, 0.05)', right: 30, top: 30 }]} />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderMonthlyGraph = () => {
    const maxIssues = Math.max(...monthlyTrends.map(t => t.issues));

    return (
      <View style={styles.graphContainer}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>Monthly Resolution Trends</Text>
          {/* <Text style={styles.graphSubtitle}>Last 6 months overview</Text> */}
        </View>
        <View style={styles.monthLabels}>
          {monthlyTrends.map((trend, index) => (
            <Text key={index} style={styles.monthLabel} numberOfLines={1}>
              {trend.month}
            </Text>
          ))}
        </View>
        <View style={styles.graphBars}>
          {monthlyTrends.map((trend, index) => {
            const barHeight = (trend.issues / maxIssues) * 80;
            return (
              <View key={index} style={styles.graphBar}>
                <View style={[styles.bar, { height: barHeight }]}>
                  <LinearGradient
                    colors={COLORS.gradientSecondary}
                    style={styles.barGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </View>
                <Text style={styles.barValue} numberOfLines={1}>
                  {trend.issues}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.graphFooter}>
          <View style={styles.graphLegend}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.legendText} numberOfLines={1}>Issues Resolved</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDepartmentCard = (dept: DepartmentPerformance, index: number) => {
    const progressPercent = Math.round(dept.progress * 100);

    return (
      <Animated.View
        key={index}
        style={[
          styles.deptCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim }
            ],
          }
        ]}
      >
        <View style={styles.deptIconContainer}>
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.deptIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name={dept.icon} size={20} color={COLORS.textLight} />
          </LinearGradient>
        </View>
        <View style={styles.deptInfo}>
          <Text style={styles.deptName} numberOfLines={1}>
            {dept.department}
          </Text>
          <View style={styles.deptProgressContainer}>
            <View style={styles.deptProgressBar}>
              <Animated.View
                style={[
                  styles.deptProgress,
                  {
                    transform: [
                      {
                        scaleX: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, progressPercent / 100],
                        }),
                      },
                    ],
                    opacity: fadeAnim,
                    transformOrigin: 'left',
                  },
                ]}
              >
                <LinearGradient
                  colors={COLORS.gradientSecondary}
                  style={styles.deptProgressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>


            </View>
            <Text style={styles.deptPercent} numberOfLines={1}>
              {progressPercent}%
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
      </Animated.View>
    );
  };

  const renderRecentReport = (report: RecentReport, index: number) => {
    let statusColor = COLORS.warning;
    let statusBg = COLORS.warningLight;
    if (report.status === 'Resolved') {
      statusColor = COLORS.success;
      statusBg = COLORS.successLight;
    }
    if (report.status === 'New') {
      statusColor = COLORS.info;
      statusBg = COLORS.infoLight;
    }
    if (report.status === 'Pending') {
      statusColor = COLORS.danger;
      statusBg = COLORS.dangerLight;
    }

    return (
      <Animated.View
        key={report.id}
        style={[
          styles.reportCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateX: slideAnim },
              {
                scale: scaleAnim.interpolate({
                  inputRange: [0.95, 1],
                  outputRange: [0.98, 1]
                })
              }
            ],
          }
        ]}
      >
        <View style={[styles.reportIcon, { backgroundColor: statusBg }]}>
          <Text style={styles.reportIconText}>{report.icon}</Text>
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle} numberOfLines={2}>
            {report.title}
          </Text>
          <View style={styles.reportMeta}>
            <Icon name="place" size={12} color={COLORS.textMuted} />
            <Text style={styles.reportLocation} numberOfLines={1}>
              {report.location}
            </Text>
            <View style={styles.reportTimeContainer}>
              <Icon name="access-time" size={12} color={COLORS.textMuted} />
              <Text style={styles.reportTime} numberOfLines={1}>
                {report.time}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]} numberOfLines={1}>
            {report.status}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // Updated stats with better colors
  const stats: StatCard[] = [
    {
      title: "Total Issues",
      value: totalIssues,
      change: "+15%",
      icon: "assignment",
      color: COLORS.gradientPrimary
    },
    {
      title: "Resolved",
      value: resolvedIssues,
      change: "+20%",
      icon: "check-circle",
      color: COLORS.gradientSuccess
    },
    {
      title: "Pending",
      value: pendingIssues,
      change: "",
      icon: "schedule",
      color: COLORS.gradientWarning
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Enhanced Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Icon name="account-balance" size={24} color={COLORS.textLight} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  UrbanSim AI
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Government Administration Dashboard
                </Text>
              </View>
            </View>
            <TouchableWithoutFeedback
              onPressIn={() => handleIconPress(3)}
              onPress={() => router.push("/admin/profile")}
            >
              <Animated.View
                style={[
                  styles.profileButton,
                  {
                    transform: [{ scale: iconScaleAnims.current[3] || 1 }],
                  }
                ]}
              >
                <LinearGradient
                  colors={COLORS.gradientSecondary}
                  style={styles.profileGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="person" size={20} color={COLORS.textLight} />
                </LinearGradient>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Enhanced Greeting Card */}
          <Animated.View
            style={[
              styles.greetingCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.greetingGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.greetingContent}>
                <View style={styles.greetingTextContainer}>
                  <Text style={styles.greetingText} numberOfLines={1}>
                    Welcome Back,
                  </Text>
                  <Text style={styles.greetingName} numberOfLines={1}>
                    Administrator
                  </Text>
                  <Text style={styles.greetingSubtext} numberOfLines={1}>
                    City-wide issue management overview
                  </Text>
                </View>
                <TouchableWithoutFeedback
                  onPressIn={() => handleIconPress(4)}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: iconScaleAnims.current[4] || 1 }],
                    }}
                  >
                    <Icon name="admin-panel-settings" size={48} color="rgba(255, 255, 255, 0.9)" />
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => renderStatCard(stat, index))}
          </View>

          {/* Resolution Trends */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, 20],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="trending-up" size={22} color={COLORS.primary} />
                <Text style={styles.sectionTitle} numberOfLines={1}>
                  Resolution Trends
                </Text>
              </View>
              <TouchableWithoutFeedback
                onPressIn={() => handleIconPress(5)}
              >
                <Animated.View
                  style={[
                    styles.viewAllButton,
                    {
                      transform: [{ scale: iconScaleAnims.current[5] || 1 }],
                    }
                  ]}
                >
                  {/* <Text style={styles.viewAllText} numberOfLines={1}>
                    Last 6 Months
                  </Text> */}
                  <Icon name="chevron-right" size={16} color={COLORS.secondary} />
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
            {renderMonthlyGraph()}
          </Animated.View>

          {/* Department Performance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="business" size={22} color={COLORS.primary} />
                <Text style={styles.sectionTitle} numberOfLines={1}>
                  Department Performance
                </Text>
              </View>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText} numberOfLines={1}>
                  View All
                </Text>
                <Icon name="chevron-right" size={16} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            {departmentPerformance.map((dept, index) => renderDepartmentCard(dept, index))}
          </View>

          {/* Recent Reports */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="description" size={22} color={COLORS.primary} />
                <Text style={styles.sectionTitle} numberOfLines={1}>
                  Recent Reports
                </Text>
              </View>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText} numberOfLines={1}>
                  View All
                </Text>
                <Icon name="chevron-right" size={16} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            {recentReports.map((report, index) => renderRecentReport(report, index))}
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Navigation Footer - Made floating and smaller */}
      {renderFooter()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 100, // Reduced from 120
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 4,
  },
  headerGradient: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90, // Reduced padding to prevent content behind footer
  },
  content: {
    padding: 16,
  },
  greetingCard: {
    height: 120, // Reduced from 140
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  greetingGradient: {
    flex: 1,
    padding: 20,
  },
  greetingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textLight,
    marginVertical: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 140, // Reduced from 160
  },
  statCardGradient: {
    flex: 1,
  },
  statCardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 4,
    maxWidth: 80,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textLight,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  statCardPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  patternCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(66, 153, 225, 0.2)',
    flexShrink: 0,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  graphContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  graphHeader: {
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  graphSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  graphBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    paddingHorizontal: 4,
  },
  graphBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barGradient: {
    flex: 1,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  graphFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  graphLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  deptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  deptIconContainer: {
    marginRight: 12,
  },
  deptIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deptInfo: {
    flex: 1,
    marginRight: 12,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  deptProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deptProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  deptProgress: {
  height: '100%',
  width: '100%',   // ✅ REQUIRED
  borderRadius: 3,
  overflow: 'hidden',
},
  deptProgressGradient: {
    flex: 1,
  },
  deptPercent: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
    minWidth: 36,
    textAlign: 'right',
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  reportIconText: {
    fontSize: 20,
  },
  reportInfo: {
    flex: 1,
    marginRight: 8,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportLocation: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 2,
    flexShrink: 1,
  },
  reportTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  reportTime: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 8,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    position: "absolute",
    bottom: 10, // Added spacing from bottom for floating effect
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 0 : 0, // Removed extra padding
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: 16, // Reduced margin for floating effect
    paddingVertical: 8, // Reduced padding
    paddingHorizontal: 4,
    borderRadius: 20, // More rounded for floating look
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: -6 }, // Adjusted shadow
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1.5, // Thicker border for floating effect
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  footerButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8, // Reduced padding
    borderRadius: 14,
    minHeight: 60, // Reduced height
  },
  footerButtonActive: {
    backgroundColor: 'rgba(66, 153, 225, 0.08)',
  },
  footerIconWrapper: {
    width: 40, // Smaller icon wrapper
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(226, 232, 240, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  footerIconWrapperActive: {
    backgroundColor: COLORS.secondary,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  footerLabel: {
    fontSize: 11, // Smaller font
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerLabelActive: {
    color: COLORS.secondary,
    fontWeight: "700",
  },
});

export default AdminDashboard;