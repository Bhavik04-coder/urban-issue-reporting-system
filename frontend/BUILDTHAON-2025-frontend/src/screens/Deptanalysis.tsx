// File: DeptAnalysisScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
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
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Icon, { IconName } from '../components/icon';

const { width, height } = Dimensions.get('window');

interface Department {
  id: number;
  name: string;
  internal_name: string;
  icon: IconName;
  resolved: number;
  pending: number;
  progress: number;
  efficiency: number;
  total_issues: number;
}

interface DepartmentIssue {
  department: string;
  internal_department: string;
  issues_count: number;
}

interface ResolutionTrend {
  department: string;
  internal_department: string;
  months: string[];
  data: number[];
}

const DeptAnalysisScreen: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>("All Departments");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("This Month");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [resolutionTrends, setResolutionTrends] = useState<ResolutionTrend[]>([]);
  const [departmentIssues, setDepartmentIssues] = useState<DepartmentIssue[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [efficiencyTrend, setEfficiencyTrend] = useState<number[]>([]);
  const [showDetailPage, setShowDetailPage] = useState<boolean>(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef<Animated.Value[]>([]);
  const globalScaleAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    cardScale.current = departments.map(() => new Animated.Value(1));
  }, [departments]);

  const chartHeightAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const departmentsList = [
    "All Departments",
    "Water Dept",
    "Road Dept",
    "Sanitation Dept",
    "Electricity Dept",
  ];

  const periodsList = ["This Week", "This Month", "This Year"];

  useEffect(() => {
    loadDepartmentData();
    startAnimations();
  }, []);
  useEffect(() => {
    if (!isLoading) {
      animateCharts();
    }
  }, [isLoading]);

  const startAnimations = () => {
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
      Animated.spring(globalScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(chartHeightAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();

    // Continuous rotation for refresh icon
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const animateCharts = () => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  };

  const loadDepartmentData = async () => {
    try {
      setIsLoading(true);

      const [summaryRes, issuesRes, trendsRes] = await Promise.all([
        fetch(`${API_BASE}/departments/summary`),
        fetch(`${API_BASE}/departments/issues/by-department`),
        fetch(`${API_BASE}/departments/resolution-trends`)
      ]);

      const summaryJson = await summaryRes.json();
      const issuesJson = await issuesRes.json();
      const trendsJson = await trendsRes.json();
      console.log("API_BASE USED:", API_BASE);


      setDepartments(summaryJson.departments || []);
      setDepartmentIssues(issuesJson.data || []);
      setResolutionTrends(trendsJson.trends || []);


    } catch (error) {
      console.error("Backend connection error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    loadDepartmentData();
  };

  const triggerAIAssignment = async () => {
    try {
      setIsLoading(true);
      await fetch(`${API_BASE}/ai/auto-assign`, { method: "POST" });
      await loadDepartmentData();
      Alert.alert("Success", "AI auto-assignment completed");
    } catch (e) {
      Alert.alert("Error", "AI service not available");
    } finally {
      setIsLoading(false);
    }
  };




  const handleCardPress = async (department: Department) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE}/departments/${department.id}`);
      const data = await res.json();

      setSelectedDepartment(data);
      setEfficiencyTrend(data.efficiency_trend);
      setShowDetailPage(true);

    } catch (error) {
      console.error("Department detail fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const submitFeedback = async () => {
    if (!selectedDepartment || !feedbackText.trim()) return;

    await fetch(`${API_BASE}/departments/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        department_id: selectedDepartment.id,
        feedback_text: feedbackText,
      }),
    });

    setFeedbackText("");
    setShowFeedbackModal(false);
  };


  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: globalScaleAnim }
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['#4361EE', '#3A0CA3']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerIconContainer}>
              <Icon name="analytics" size={26} color="#FFFFFF" />
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Department Analysis</Text>
              <Text style={styles.headerSubtitle}>
                Track AI-assigned issues & performance
              </Text>
            </View>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadDepartmentData}
              disabled={isLoading}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: rotationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <Icon name="refresh" size={20} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );


  const renderDepartmentCard = (department: Department, index: number) => {
    const successRate = (department.resolved / (department.total_issues || 1)) * 100;
    const efficiencyColor = department.efficiency >= 85 ? '#4ADE80' :
      department.efficiency >= 70 ? '#F59E0B' : '#EF4444';

    const cardAnimation =
      cardScale.current[index] ?? new Animated.Value(1);

    return (
      <TouchableOpacity
        key={department.id}
        activeOpacity={0.9}
        onPress={() => handleCardPress(department)}
      >
        <Animated.View
          style={[
            styles.departmentCard,
            {
              opacity: fadeAnim,
              transform: [
                { scale: cardAnimation },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <LinearGradient
                colors={['#4361EE', '#3A0CA3']}
                style={styles.cardIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon
                  name={department.icon as IconName}
                  size={22}
                  color="#FFFFFF"
                />
              </LinearGradient>

              <View style={styles.efficiencyBadge}>
                <LinearGradient
                  colors={[efficiencyColor, efficiencyColor + 'CC']}
                  style={styles.efficiencyGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.efficiencyText}>
                    {department.efficiency.toFixed(0)}%
                  </Text>
                </LinearGradient>
                {department.name !== "Other" && (
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.departmentName}>{department.name}</Text>
              <Text style={styles.issuesCount}>
                {department.total_issues} Issues
              </Text>

              <Animated.View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${successRate}%`],
                        }),
                        backgroundColor: efficiencyColor,
                      },
                    ]}
                  />
                </View>
              </Animated.View>
            </View>

            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#4ADE80' }]}>
                  {department.resolved}
                </Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  {department.pending}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#3B82F6' }]}>
                  {department.progress}
                </Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderBarChart = () => {
    if (departmentIssues.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Icon name="bar-chart" size={48} color="#687280" />
          <Text style={styles.emptyChartText}>No data available</Text>
        </View>
      );
    }

    const maxIssues = Math.max(...departmentIssues.map(d => d.issues_count));
    const barWidth = (width - 80) / departmentIssues.length;

    return (
      <Animated.View
        style={[
          styles.chartContainer,
          {
            height: chartHeightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 240],
            }),
            opacity: chartHeightAnim,
          },
        ]}
      >
        <View style={styles.chartContent}>
          {departmentIssues.map((dept, index) => {
            const barHeight = (dept.issues_count / (maxIssues || 1)) * 140;

            return (
              <Animated.View
                key={index}
                style={styles.barContainer}
              >
                <View style={styles.barLabelContainer}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {dept.department.split(' ')[0]}
                  </Text>
                </View>

                <Animated.View
                  style={[
                    styles.barWrapper,
                    {
                      height: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, barHeight],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#4361EE', '#4CC9F0']}
                    style={[styles.bar, { width: barWidth - 16 }]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                  />
                </Animated.View>

                <Text style={styles.barValue}>{dept.issues_count}</Text>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.yAxis}>
          {Array.from({ length: Math.min(5, maxIssues) + 1 }).map((_, i) => (
            <Text key={i} style={styles.yAxisLabel}>
              {i}
            </Text>
          ))}
        </View>

      </Animated.View>
    );
  };

  const renderTrendChart = () => {
    if (resolutionTrends.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Icon name="timeline" size={48} color="#687280" />
          <Text style={styles.emptyChartText}>No trend data available</Text>
        </View>
      );
    }

    const colors = ['#4361EE', '#4CC9F0', '#7209B7', '#F72585'];
    const months = resolutionTrends[0]?.months || [];

    return (
      <Animated.View
        style={[
          styles.trendChartContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.trendLegend}>
          {resolutionTrends.map((trend, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors[index % colors.length] },
                ]}
              />
              <Text style={styles.legendText}>{trend.department}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trendChart}>
          <Svg width={width - 80} height={160}>
            <Defs>
              {colors.map((color, index) => (
                <SvgGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={color} stopOpacity="1" />
                  <Stop offset="1" stopColor={color} stopOpacity="0.3" />
                </SvgGradient>
              ))}
            </Defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y, index) => (
              <Path
                key={index}
                d={`M 20 ${160 - (y / 100) * 120} L ${width - 80} ${160 - (y / 100) * 120}`}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Trend lines */}
            {resolutionTrends.map((trend, trendIndex) => {

              // ✅ FIX 2 — GUARDS (CRITICAL)
              if (!trend.data || trend.data.length === 0) return null;
              if (trend.data.some(v => typeof v !== "number" || isNaN(v))) return null;

              const minValue = Math.min(...trend.data);
              const maxValue = Math.max(...trend.data);
              const range = maxValue - minValue;

              const points = trend.data
                .map((value: number, monthIndex: number) => {

                  const x =
                    trend.months.length === 1
                      ? width / 2
                      : 20 + (monthIndex * (width - 100)) / (trend.months.length - 1);

                  const y =
                    range === 0
                      ? 160 / 2
                      : 160 - ((value - minValue) / range) * 120;

                  return `${monthIndex === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ");

              // ✅ SAFE end X for area fill
              const endX =
                trend.months.length === 1
                  ? width / 2
                  : 20 + (trend.months.length - 1) * (width - 100) / (trend.months.length - 1);

              return (
                <G key={trendIndex}>
                  {/* Line */}
                  <Path
                    d={points}
                    stroke={colors[trendIndex % colors.length]}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Area under curve */}
                  <Path
                    d={`${points} L ${endX} 160 L 20 160 Z`}
                    fill={`url(#gradient${trendIndex})`}
                    opacity={0.2}
                  />
                </G>
              );
            })}

          </Svg>

          {/* X-axis labels */}
          <View style={styles.monthLabels}>
            {months.map((month: string, index: number) => (

              <Text key={index} style={styles.monthLabel}>{month}</Text>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderDetailPage = () => {
    if (!selectedDepartment) return null;

    const resolvedPct = (selectedDepartment.resolved / (selectedDepartment.total_issues || 1)) * 100;
    const pendingPct = (selectedDepartment.pending / (selectedDepartment.total_issues || 1)) * 100;
    const progressPct = (selectedDepartment.progress / (selectedDepartment.total_issues || 1)) * 100;

    return (
      <Modal
        visible={showDetailPage}
        animationType="slide"
        onRequestClose={() => setShowDetailPage(false)}
      >
        <SafeAreaView style={styles.detailContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          {/* Header */}
          <View style={styles.detailHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowDetailPage(false)}
            >
              <Icon name="arrow-back" size={24} color="#2B2D42" />
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{selectedDepartment.name}</Text>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => setShowFeedbackModal(true)}
            >
              <Icon name="feedback" size={20} color="#4361EE" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailScrollView}>
            {/* Stats Cards */}
            <View style={styles.detailStats}>
              <Animated.View
                style={[
                  styles.detailStatCard,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
              >
                <Text style={styles.detailStatLabel}>Resolved</Text>
                <Text style={[styles.detailStatValue, { color: '#4ADE80' }]}>
                  {selectedDepartment.resolved}
                </Text>
                <View style={styles.detailProgressBar}>
                  <Animated.View
                    style={[
                      styles.detailProgressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${resolvedPct}%`],
                        }),
                        backgroundColor: '#4ADE80',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.detailStatPct}>{resolvedPct.toFixed(0)}%</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.detailStatCard,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
              >
                <Text style={styles.detailStatLabel}>Pending</Text>
                <Text style={[styles.detailStatValue, { color: '#F59E0B' }]}>
                  {selectedDepartment.pending}
                </Text>
                <View style={styles.detailProgressBar}>
                  <Animated.View
                    style={[
                      styles.detailProgressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${pendingPct}%`],
                        }),
                        backgroundColor: '#F59E0B',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.detailStatPct}>{pendingPct.toFixed(0)}%</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.detailStatCard,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
              >
                <Text style={styles.detailStatLabel}>In Progress</Text>
                <Text style={[styles.detailStatValue, { color: '#3B82F6' }]}>
                  {selectedDepartment.progress}
                </Text>
                <View style={styles.detailProgressBar}>
                  <Animated.View
                    style={[
                      styles.detailProgressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${progressPct}%`],
                        }),
                        backgroundColor: '#3B82F6',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.detailStatPct}>{progressPct.toFixed(0)}%</Text>
              </Animated.View>
            </View>

            {/* Efficiency Trend */}
            <Animated.View
              style={[
                styles.detailSection,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <Text style={styles.sectionTitle}>Efficiency Trend</Text>
              <Text style={styles.sectionSubtitle}>Last 6 months performance</Text>

              <View style={styles.efficiencyChart}>
                <Svg width={width - 64} height={200}>
                  {/* Grid */}
                  {[50, 60, 70, 80, 90, 100].map((y, index) => (
                    <Path
                      key={index}
                      d={`M 20 ${200 - ((y - 50) / 50) * 160} L ${width - 84} ${200 - ((y - 50) / 50) * 160}`}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Trend line */}
                  <Path
                    d={efficiencyTrend.map((value, index) => {
                      const x = 20 + (index * (width - 104) / (efficiencyTrend.length - 1));
                      const y = 200 - ((value - 50) / 50) * 160;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    stroke="#4361EE"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Dots */}
                  {efficiencyTrend.map((value, index) => {
                    const x = 20 + (index * (width - 104) / (efficiencyTrend.length - 1));
                    const y = 200 - ((value - 50) / 50) * 160;

                    return (
                      <G key={index}>
                        <Circle cx={x} cy={y} r="6" fill="#4361EE" />
                        <Circle cx={x} cy={y} r="3" fill="#FFFFFF" />
                      </G>
                    );
                  })}
                </Svg>

                <View style={styles.monthLabels}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                    <Text key={index} style={styles.monthLabel}>{month}</Text>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Pie Chart */}
            <Animated.View
              style={[
                styles.detailSection,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <Text style={styles.sectionTitle}>Breakdown</Text>

              <View style={styles.pieChartContainer}>
                <View style={styles.pieChart}>
                  <Svg width={180} height={180} viewBox="0 0 100 100">
                    {/* Resolved */}
                    <Path
                      d="M50,50 L50,10 A40,40 0 1,1 14.64,65 L50,50"
                      fill="#4ADE80"
                    />
                    {/* Pending */}
                    <Path
                      d="M50,50 L14.64,65 A40,40 0 0,1 85.36,65 L50,50"
                      fill="#F59E0B"
                    />
                    {/* In Progress */}
                    <Path
                      d="M50,50 L85.36,65 A40,40 0 0,1 50,10 L50,50"
                      fill="#3B82F6"
                    />
                    <Circle cx="50" cy="50" r="20" fill="#FFFFFF" />
                  </Svg>
                </View>

                <View style={styles.pieLegend}>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendColor, { backgroundColor: '#4ADE80' }]} />
                    <Text style={styles.legendLabel}>Resolved</Text>
                    <Text style={styles.legendValue}>
                      {selectedDepartment.resolved} ({resolvedPct.toFixed(0)}%)
                    </Text>
                  </View>

                  <View style={styles.legendRow}>
                    <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendLabel}>Pending</Text>
                    <Text style={styles.legendValue}>
                      {selectedDepartment.pending} ({pendingPct.toFixed(0)}%)
                    </Text>
                  </View>

                  <View style={styles.legendRow}>
                    <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.legendLabel}>In Progress</Text>
                    <Text style={styles.legendValue}>
                      {selectedDepartment.progress} ({progressPct.toFixed(0)}%)
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderFeedbackModal = () => (
    <Modal
      visible={showFeedbackModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            { opacity: fadeAnim, transform: [{ scale: globalScaleAnim }] }
          ]}
        >
          <Text style={styles.modalTitle}>
            Feedback for {selectedDepartment?.name}
          </Text>

          <TextInput
            style={styles.feedbackInput}
            placeholder="Enter feedback or remarks..."
            placeholderTextColor="#8D99AE"
            multiline
            numberOfLines={4}
            value={feedbackText}
            onChangeText={setFeedbackText}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setShowFeedbackModal(false)}
            >
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButtonSubmit}
              onPress={submitFeedback}
              disabled={!feedbackText.trim()}
            >
              <LinearGradient
                colors={['#4361EE', '#3A0CA3']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalButtonSubmitText}>Submit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <Animated.View style={{
          transform: [{
            rotate: rotationAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            })
          }]
        }}>
          <Icon name="refresh" size={48} color="#4361EE" />
        </Animated.View>
        <Text style={styles.loadingText}>Loading department data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4361EE" />

      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4361EE']}
            tintColor="#4361EE"
          />
        }
      >
        <View style={styles.content}>
          {/* AI Assignment Button */}
          {selectedDept === "All Departments" && (
            <Animated.View
              style={[
                styles.aiButtonContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.aiButton}
                onPress={triggerAIAssignment}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#7209B7', '#4361EE']}
                  style={styles.aiButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="auto-awesome" size={20} color="#FFFFFF" />
                  <Text style={styles.aiButtonText}>Run AI Auto-Assignment</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Filter Badge */}
          {selectedDept !== "All Departments" && (
            <Animated.View
              style={[
                styles.filterBadge,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Icon name="filter-alt" size={16} color="#4361EE" />
              <Text style={styles.filterBadgeText}>
                Filtered by: {selectedDept}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDept("All Departments");
                  loadDepartmentData();
                }}
              >
                <Icon name="close" size={16} color="#4361EE" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Departments Grid */}
          <Animated.View
            style={[
              styles.departmentsGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {departments.map((dept, index) => renderDepartmentCard(dept, index))}
          </Animated.View>

          {/* Performance Overview */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Performance Overview</Text>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Issues by Department</Text>
              {renderBarChart()}
            </View>
          </Animated.View>

          {/* Resolution Trend */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Resolution Trend Analysis</Text>
              {renderTrendChart()}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {renderDetailPage()}
      {renderFeedbackModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2B2D42',
    fontWeight: '500',
  },
  headerContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 30,   // 👈 ADD / INCREASE THIS
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#cbceddff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },

  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContent: {
    width: '100%',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownContainer: {
    flex: 1,
    height: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 12,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#5B5FEF', // solid button
  },

  filterPillActive: {
    backgroundColor: '#FFFFFF',
  },

  filterPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  filterPillTextActive: {
    color: '#3A0CA3',
    fontWeight: '700',
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  aiButtonContainer: {
    marginBottom: 16,
  },
  aiButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.3)',
    marginBottom: 12,
  },
  filterBadgeText: {
    color: '#4361EE',
    fontWeight: '600',
    fontSize: 13,
    marginHorizontal: 8,
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  departmentCard: {
    width: (width - 56) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#1F1F1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.08)',
  },
  cardContent: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  efficiencyBadge: {
    alignItems: 'flex-end',
  },
  efficiencyGradient: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  efficiencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  aiBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(114, 9, 183, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    alignSelf: 'flex-end',
  },
  aiBadgeText: {
    color: '#7209B7',
    fontSize: 8,
    fontWeight: '700',
  },
  cardBody: {
    marginBottom: 16,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B2D42',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  issuesCount: {
    color: '#8D99AE',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  progressContainer: {
    height: 6,
  },
  progressBackground: {
    height: '100%',
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#8D99AE',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(141, 153, 174, 0.2)',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2B2D42',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1F1F1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.08)',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B2D42',
    marginBottom: 16,
  },
  chartContainer: {
    overflow: 'hidden',
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    paddingHorizontal: 20,
  },
  barContainer: {
    alignItems: 'center',
    height: 180,
  },
  barLabelContainer: {
    height: 30,
    justifyContent: 'center',
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#8D99AE',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 60,
  },
  barWrapper: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 8,
  },
  barValue: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#2B2D42',
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 30,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#8D99AE',
    fontWeight: '500',
    textAlign: 'right',
    width: 30,
  },
  emptyChart: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    marginTop: 8,
    color: '#687280',
    fontSize: 14,
  },
  trendChartContainer: {
    marginTop: 16,
  },
  trendLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#2B2D42',
    fontWeight: '500',
  },
  trendChart: {
    alignItems: 'center',
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 80,
    marginTop: 8,
  },
  monthLabel: {
    fontSize: 10,
    color: '#8D99AE',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  // Detail Page Styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  backButton: {
    padding: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2B2D42',
  },
  feedbackButton: {
    padding: 8,
  },
  detailScrollView: {
    flex: 1,
    padding: 16,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  detailStatLabel: {
    fontWeight: '600',
    color: '#8D99AE',
    fontSize: 14,
    marginBottom: 8,
  },
  detailStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailProgressBar: {
    height: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  detailProgressFill: {
    height: '100%',
    borderRadius: 10,
  },
  detailStatPct: {
    fontSize: 12,
    color: '#8D99AE',
    fontWeight: '500',
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  sectionSubtitle: {
    color: '#687280',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  efficiencyChart: {
    alignItems: 'center',
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  pieChart: {
    marginRight: 32,
  },
  pieLegend: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendLabel: {
    flex: 1,
    fontWeight: '600',
    color: '#2B2D42',
    marginLeft: 12,
  },
  legendValue: {
    color: '#8D99AE',
    fontWeight: '500',
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2B2D42',
    marginBottom: 16,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#2B2D42',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButtonCancel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
  },
  modalButtonCancelText: {
    color: '#8D99AE',
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonSubmit: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalButtonSubmitText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DeptAnalysisScreen;