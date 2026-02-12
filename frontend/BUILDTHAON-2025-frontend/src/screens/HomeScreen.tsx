import React, { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE } from "../../src/config/api";
import { WEATHER_API_KEY, WEATHER_BASE_URL } from "../config/weather";
import * as Location from 'expo-location';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react-native';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  StyleSheet,
  Easing
} from 'react-native';
import { Home, FileEdit, ClipboardList, User, HelpCircle, Bell, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = 176;
const CARD_HEIGHT = 224;

const COLORS = {
  // Background colors
  background: '#F8FAFC',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#0F172A',

  // Card colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',

  // Accent colors (refined blue theme)
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryGradient: ['#2563EB', '#3B82F6', '#60A5FA'] as const,

  // Secondary colors
  secondary: '#7C3AED',
  secondaryLight: '#8B5CF6',
  secondaryDark: '#6D28D9',

  // Status colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  danger: '#EF4444',
  dangerLight: '#F87171',
  info: '#6366F1',
  infoLight: '#818CF8',

  // Text colors
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textLight: '#F8FAFC',

  // UI Elements
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.15)',

  // Gradient colors
  gradientPrimary: ['#4169E1', '#3B82F6', '#60A5FA'] as const,
  gradientSuccess: ['#10B981', '#34D399'] as const,
  gradientWarning: ['#F59E0B', '#FBBF24'] as const,
  gradientDanger: ['#EF4444', '#F87171'] as const,
  gradientPurple: ['#8B5CF6', '#A78BFA'] as const,
  gradientTeal: ['#0D9488', '#14B8A6'] as const,
};

// ==================== WeatherWidget Component ====================
function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const response = await fetch(
          `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Weather fetch failed:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !weather) return null;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary + '10',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 24,
      gap: 10,
      marginBottom: 20,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: COLORS.primary + '20',
    }}>
      <LinearGradient
        colors={[COLORS.primary + '20', COLORS.primary + '05']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {weather.weather[0].main.toLowerCase().includes('cloud') ?
        <Cloud size={18} color={COLORS.primary} /> :
        <Sun size={18} color={COLORS.primary} />
      }
      <Text style={{
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
      }}>
        {Math.round(weather.main.temp)}°C • {weather.name}
      </Text>
    </View>
  );
}

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ==================== Enhanced StatsCard Component ====================
interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  index: number;
}

function EnhancedStatsCard({ title, value, subtitle, trend, index }: StatsCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const gradients = [
    COLORS.gradientPrimary,
    COLORS.gradientPurple,
    COLORS.gradientTeal
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 150),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        })
      ])
    ]).start();
  }, []);

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '0deg'],
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          { rotateY }
        ],
      }}
    >
      <LinearGradient
        colors={gradients[index % gradients.length]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          shadowColor: COLORS.shadowDark,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
          minHeight: 140,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.95)',
              letterSpacing: 0.5,
            }}>
              {title}
            </Text>
            {trend && (
              <Animated.View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  transform: [{
                    scale: scaleAnim.interpolate({
                      inputRange: [0.8, 1],
                      outputRange: [0.8, 1]
                    })
                  }]
                }}
              >
                <TrendingUp size={12} color="#FFFFFF" />
                <Text style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: '#FFFFFF',
                }}>
                  {trend}
                </Text>
              </Animated.View>
            )}
          </View>

          <View>
            <Text style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#FFFFFF',
              marginBottom: subtitle ? 4 : 0,
              textShadowColor: 'rgba(0, 0, 0, 0.1)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}>
              {value}
            </Text>
            {subtitle && (
              <Text style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.8)',
                letterSpacing: 0.3,
              }}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Animated Background Pattern */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 60,
            height: 60,
            opacity: 0.1,
            transform: [{
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }]
          }}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

// ==================== Enhanced Header Component ====================
function EnhancedHeader() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        backgroundColor: COLORS.backgroundDark,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Animated.View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{
              fontFamily: 'System',
              fontWeight: '800',
              fontSize: 20,
              color: COLORS.textLight,
            }}>
              U
            </Text>
          </Animated.View>
          <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
            <Text style={{
              fontFamily: 'System',
              fontWeight: '700',
              fontSize: 20,
              color: COLORS.textLight,
              letterSpacing: 0.5,
              lineHeight: 24,
            }}>
              UrbanSim AI
            </Text>
            <Text style={{
              fontFamily: 'System',
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: 2,
            }}>
              Citizen Dashboard
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}>
            <HelpCircle size={20} color={COLORS.textLight} />
          </Pressable>

          <Pressable style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            transform: [{ scale: pressed ? 0.95 : 1 }],
            position: 'relative',
          })}>
            <Bell size={20} color={COLORS.textLight} />
            {notificationCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: COLORS.danger,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: COLORS.textLight,
                }}>
                  {notificationCount}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}>
            <User size={20} color={COLORS.textLight} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

// ==================== Enhanced Greeting Section ====================
interface EnhancedGreetingSectionProps {
  userName: string;
  stats: any;
  citizenScore: any;
}

function EnhancedGreetingSection({ userName, stats, citizenScore }: EnhancedGreetingSectionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    // Continuous animations
    const waveAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    // Start loop animations
    waveAnimation.start();
    glowAnimation.start();

    // Cleanup
    return () => {
      waveAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  // Animation interpolations
  const waveTranslateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const today = stats?.today_reports ?? 0;
  const week = stats?.week_reports ?? 0;
  const total = stats?.total_reports ?? 0;
  const resolved = stats?.resolved_reports ?? 0;
  const pending = total - resolved;
  const quickStats = [
    {
      label: 'Today',
      value: stats ? today.toString() : "-",
      icon: '📊',
      color: COLORS.primary
    },
    {
      label: 'This Week',
      value: stats ? week.toString() : "-",
      icon: '📈',
      color: COLORS.secondary
    },
    {
      label: 'Rating',
      value: citizenScore?.citizen_score ? (citizenScore.citizen_score / 20).toFixed(1) : '-',
      icon: '⭐',
      color: COLORS.success
    }
  ];

  return (
    <Animated.View
      style={{
        backgroundColor: COLORS.backgroundLight,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 28,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim }
        ],
        opacity: fadeAnim,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated Background Elements */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      >
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.05)', 'rgba(59, 130, 246, 0.02)', 'transparent']}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Floating Particles */}
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: COLORS.primaryLight,
            top: 20 + i * 20,
            left: 30 + i * 80,
            opacity: waveOpacity,
            transform: [
              { translateY: waveTranslateY },
              {
                scale: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5]
                })
              }
            ],
          }}
        />
      ))}

      {/* Main Content */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <WeatherWidget />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{
              fontFamily: 'System',
              fontWeight: '700',
              fontSize: 32,
              color: COLORS.textPrimary,
              letterSpacing: -0.5,
            }}>
              Good Morning,
            </Text>
            <Animated.View
              style={{
                marginLeft: 8,
                transform: [{ translateY: waveTranslateY }],
                opacity: waveOpacity,
              }}
            >
              <Text style={{
                fontFamily: 'System',
                fontWeight: '700',
                fontSize: 32,
                color: COLORS.primary,
                letterSpacing: -0.5,
              }}>
                👋
              </Text>
            </Animated.View>
          </View>

          <Text style={{
            fontFamily: 'System',
            fontWeight: '800',
            fontSize: 40,
            color: COLORS.textPrimary,
            marginBottom: 4,
            lineHeight: 44,
            letterSpacing: -0.5,
          }}>
            {userName || "User"}!
          </Text>

          <Animated.View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 4,
              opacity: fadeAnim,
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, -20],
                })
              }]
            }}
          >
            <Animated.View style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: COLORS.primary,
              marginRight: 8,
              transform: [{
                scale: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5]
                })
              }]
            }} />
            <Text style={{
              fontFamily: 'System',
              fontSize: 16,
              color: COLORS.textSecondary,
              lineHeight: 24,
            }}>
              Here's what's happening with your reports today
            </Text>
          </Animated.View>
        </View>

        {/* Enhanced Profile Avatar */}
        <AnimatedPressable
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          style={({ pressed }) => ({
            width: 60,
            height: 60,
            borderRadius: 20,
            backgroundColor: COLORS.cardBackground,
            borderWidth: 2,
            borderColor: COLORS.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            transform: [
              { scale: pressed ? 0.95 : isPressed ? 0.98 : 1 },
              {
                rotate: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg']
                })
              }
            ]
          })}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={{
              fontFamily: 'System',
              fontWeight: '800',
              fontSize: 22,
              color: COLORS.textLight,
            }}>
              {userName?.charAt(0) || 'U'}
            </Text>
          </LinearGradient>

          {/* Active Status Indicator */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: COLORS.success,
              borderWidth: 2,
              borderColor: COLORS.cardBackground,
              shadowColor: COLORS.success,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              transform: [{
                scale: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.3, 1]
                })
              }]
            }}
          />
        </AnimatedPressable>
      </View>

      {/* Quick Stats Row */}
      <Animated.View
        style={{
          flexDirection: 'row',
          marginTop: 28,
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 20],
            })
          }]
        }}
      >
        {quickStats.map((stat, index) => (
          <Animated.View
            key={stat.label}
            style={{
              flex: 1,
              backgroundColor: COLORS.cardBackground,
              borderRadius: 16,
              padding: 16,
              marginRight: index < 2 ? 12 : 0,
              borderWidth: 1,
              borderColor: COLORS.borderLight,
              shadowColor: COLORS.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              transform: [{
                translateY: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, index % 2 === 0 ? -3 : 3]
                })
              }]
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, marginRight: 2 }}>{stat.icon}</Text>
              <Text style={{
                fontSize: 10,
                fontWeight: '500',
                color: COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {stat.label}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: stat.color,
                marginRight: 4,
              }}>
                {stat.value}
              </Text>
              {stat.label === 'Rating' && (
                <Text style={{
                  fontSize: 14,
                  color: COLORS.textMuted,
                }}>
                  /5
                </Text>
              )}
            </View>
          </Animated.View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

// ==================== Enhanced CitizenTrustScoreCard Component ====================
interface EnhancedCitizenTrustScoreCardProps {
  score?: number;
  totalIssues?: number;
  resolvedIssues?: number;
}

const EnhancedCitizenTrustScoreCard = ({ score = 89, totalIssues = 156, resolvedIssues = 128 }: EnhancedCitizenTrustScoreCardProps) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // POLISHED CITIZEN SCORE LOGIC: Better color mapping with smooth transitions
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return COLORS.gradientSuccess;
    if (scoreValue >= 60) return COLORS.gradientWarning;
    return COLORS.gradientDanger;
  };

  const citizenScoreColor = getScoreColor(score);

  useEffect(() => {
    // Create the loop animation
    const glowLoopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start parallel animations
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: score,
        duration: 1500,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start the loop animation
    glowLoopAnimation.start();

    // Cleanup
    return () => {
      glowLoopAnimation.stop();
    };
  }, [score]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  return (
    <Animated.View
      style={{
        marginBottom: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <LinearGradient
        colors={COLORS.gradientPrimary}
        style={{
          borderRadius: 20,
          padding: 28,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Glow Effect */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            opacity: glowOpacity,
          }}
        />

        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.95)',
          marginBottom: 16,
          textAlign: 'center',
          letterSpacing: 0.5,
        }}>
          Citizen Trust Score
        </Text>

        <Animated.Text
          style={{
            fontSize: 56,
            fontWeight: '900',
            color: '#FFFFFF',
            marginBottom: 8,
            textShadowColor: 'rgba(0, 0, 0, 0.2)',
            textShadowOffset: { width: 0, height: 4 },
            textShadowRadius: 8,
            transform: [{
              scale: scaleAnim.interpolate({
                inputRange: [0.9, 1],
                outputRange: [0.9, 1]
              })
            }]
          }}
        >
          {score}
        </Animated.Text>

        <Text style={{
          fontSize: 15,
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.85)',
          textAlign: 'center',
          marginBottom: 24,
          paddingHorizontal: 20,
          lineHeight: 22,
        }}>
          Excellent reputation based on {totalIssues} issues with {resolvedIssues} resolved
        </Text>

        <View style={{
          width: '100%',
          height: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          <Animated.View
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }),
              height: '100%',
              borderRadius: 6,
            }}
          >
            <LinearGradient
              colors={citizenScoreColor}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Text style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            Needs Improvement
          </Text>
          <Text style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            Excellent
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// ==================== Enhanced UpdateCard Component ====================
interface EnhancedUpdateCardProps {
  message: string;
  index: number;
}

function EnhancedUpdateCard({ message, index }: EnhancedUpdateCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 200),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        style={({ pressed }) => ({
          paddingHorizontal: 24,
          paddingVertical: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20,
          backgroundColor: COLORS.cardBackground,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: COLORS.border,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Bell size={20} color={COLORS.textLight} />
        </LinearGradient>
        <Text style={{
          fontFamily: 'System',
          fontSize: 15,
          fontWeight: '500',
          color: COLORS.textPrimary,
          flex: 1,
          lineHeight: 22,
        }}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ==================== IssueCard Component ====================
interface IssueCardProps {
  icon: string;
  title: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  urgency: 'URGENCY' | 'MEDIUM' | 'LOW';
  distance: string;
  index: number;
  scrollX: Animated.Value;
}

const IssueCard: React.FC<IssueCardProps> = ({
  icon,
  title,
  location,
  status,
  urgency,
  distance,
  index,
  scrollX,
}) => {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + 32),
    index * (CARD_WIDTH + 32),
    (index + 1) * (CARD_WIDTH + 32),
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1.1, 0.9],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
    extrapolate: 'clamp',
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [20, 0, 20],
    extrapolate: 'clamp',
  });

  const shadowOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.1, 0.3, 0.1],
    extrapolate: 'clamp',
  });

  const urgencyStyles = {
    URGENCY: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: '#FECACA',
      color: '#DC2626',
    },
    MEDIUM: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#FDE68A',
      color: '#D97706',
    },
    LOW: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#A7F3D0',
      color: '#059669',
    },
  };

  const statusStyles = {
    Pending: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: '#FECACA',
      color: '#DC2626',
    },
    'In Progress': {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#FDE68A',
      color: '#D97706',
    },
    Resolved: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#A7F3D0',
      color: '#059669',
    },
  };
  const safeUrgency = urgencyStyles[urgency] ?? urgencyStyles.LOW;
  const safeStatus = statusStyles[status] ?? statusStyles.Pending;

  const getFormalIcon = (icon: string) => {
    const iconMap: Record<string, string> = {
      '🗑️': '🗑️',
      '💧': '💧',
      '🛣️': '🛣️',
      '💡': '💡',
    };
    return iconMap[icon] || icon;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale }, { translateY }],
          opacity,
          shadowOpacity,
          marginHorizontal: 12,
          shadowColor: COLORS.shadowDark,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 16,
          elevation: 8,
        },
      ]}
    >
      <View style={[styles.gradient, {
        backgroundColor: COLORS.cardBackground,
      }]} />

      <View style={[styles.contentContainer, { paddingBottom: 28 }]}>
        <View style={[styles.iconContainer, {
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderColor: 'rgba(37, 99, 235, 0.15)',
          width: 64,
          height: 64,
          marginBottom: 16,
        }]}>
          <Text style={[styles.icon, {
            color: COLORS.primary,
            fontSize: 28,
          }]}>{getFormalIcon(icon)}</Text>
        </View>

        <View style={[styles.textContainer, { marginBottom: 12 }]}>
          <Text style={[styles.title, {
            color: COLORS.textPrimary,
            fontSize: 15,
            marginBottom: 4,
            fontWeight: '700',
          }]}>{title}</Text>
          <Text style={[styles.location, {
            color: COLORS.textSecondary,
            fontSize: 11,
          }]}>{location}</Text>
        </View>

        <View style={[styles.badgesContainer, { marginBottom: 16 }]}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: safeUrgency.backgroundColor,
                borderColor: safeUrgency.borderColor,
                paddingHorizontal: 10,
                paddingVertical: 4,
              },
            ]}
          >
            <Text style={[styles.badgeText, {
              color: safeUrgency.color,
              fontSize: 10,
              fontWeight: '700',
            }]}>
              {urgency === 'URGENCY' ? 'HIGH' : urgency}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: safeStatus.backgroundColor,
                borderColor: safeStatus.borderColor,   // ✅ FIXED
                paddingHorizontal: 10,
                paddingVertical: 4,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: safeStatus.color,              // ✅ FIXED
                  fontSize: 10,
                  fontWeight: '700',
                },
              ]}
            >
              {status}
            </Text>
          </View>

        </View>

        <View style={[styles.distanceContainer, { marginTop: 4 }]}>
          <Text style={[styles.distanceText, {
            color: COLORS.textMuted,
            fontSize: 12,
            fontWeight: '600',
          }]}>{distance}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ==================== Enhanced HomeScreen Component ====================
export default function HomeScreen() {
  const router = useRouter();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const { token } = useAuth();

  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [citizenScore, setCitizenScore] = useState<any>(null);
  const [issuesData, setIssuesData] = useState<any[]>([]);
  const [updatesData, setUpdatesData] = useState<string[]>([]);

  // ADD CACHING / OPTIMIZATION: Cache data to prevent unnecessary re-fetches
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // User profile
      const userRes = await fetch(`${API_BASE}/users/me`, { headers });
      const userData = await userRes.json();
      setUserName(userData.full_name || "User");

      // Dashboard stats
      const statsRes = await fetch(`${API_BASE}/users/dashboard/stats`, { headers });
      const statsData = await statsRes.json();
      setStats(statsData);

      // Citizen score
      const scoreRes = await fetch(`${API_BASE}/users/citizen-score`, { headers });
      const scoreData = await scoreRes.json();
      setCitizenScore(scoreData);

      // User reports (carousel) - CONNECT CAROUSEL NEXT: Properly fetching real data
      const reportsRes = await fetch(`${API_BASE}/users/reports/filtered?status_filter=all`, { headers });
      const reportsData = await reportsRes.json();
      const complaints = reportsData.complaints || reportsData.issues || reportsData.reports || [];


      const mapUrgency = (level?: string): 'URGENCY' | 'MEDIUM' | 'LOW' => {
        switch (level) {
          case 'High':
            return 'URGENCY';
          case 'Medium':
            return 'MEDIUM';
          case 'Low':
            return 'LOW';
          default:
            return 'LOW';
        }
      };

      // Transform API data to match IssueCard interface
      const transformedIssues = complaints.map((issue: any) => ({
        icon: getIssueIcon(issue.category),
        title: issue.title || issue.category || 'Issue',
        location: issue.location_address || 'Unknown',
        status: issue.status || 'Pending',
        urgency: mapUrgency(issue.urgency_level),
        distance: issue.distance ? `${issue.distance} KM` : '0.5 KM',
      }));


      setIssuesData(transformedIssues);

      // Activity feed
      const activityRes = await fetch(`${API_BASE}/activity/today`, {
        headers,
      });
      const activityData = await activityRes.json();
      const activities = activityData.activities || [];
      setUpdatesData(activities.map((a: any) => a.title || a.message));

      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to default data if API fails
      setIssuesData(defaultIssuesData);
      setUpdatesData(defaultUpdatesData);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get icon based on category
  const getIssueIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'garbage': '🗑️',
      'waste': '🗑️',
      'water': '💧',
      'leak': '💧',
      'road': '🛣️',
      'pothole': '🛣️',
      'light': '💡',
      'electricity': '💡',
    };

    const lowerCategory = category?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerCategory.includes(key)) return icon;
    }
    return '📝';
  };

  useEffect(() => {
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + 32));
    setActiveCardIndex(Math.min(Math.max(index, 0), issuesData.length - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollViewRef.current) return;

    scrollViewRef.current.scrollTo({
      x: index * (CARD_WIDTH + 32),
      animated: true,
    });
    setActiveCardIndex(index);
  };

  // CONNECT CAROUSEL NEXT: Enhanced navigation with proper boundaries
  const handlePrevCard = () => {
    if (activeCardIndex > 0) {
      scrollToIndex(activeCardIndex - 1);
    }
  };

  const handleNextCard = () => {
    if (activeCardIndex < issuesData.length - 1) {
      scrollToIndex(activeCardIndex + 1);
    }
  };

  const total = stats?.total_reports ?? 0;
  const resolved = stats?.resolved_reports ?? 0;
  const pending = total - resolved;

  const statsCards = [
    { title: "Total Issues", value: total.toString() },
    { title: "Resolved", value: resolved.toString() },
    { title: "Pending", value: pending.toString() },
  ];


  return (
    <Animated.View style={{ flex: 1, backgroundColor: COLORS.background, opacity: contentOpacity }}>
      <EnhancedHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={undefined}
      >
        {/* Enhanced Greeting Section */}
        <EnhancedGreetingSection
          userName={userName}
          stats={stats}
          citizenScore={citizenScore}
        />

        {/* Stats Cards Section */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32, marginTop: 16 }}>
          <Text style={{
            fontFamily: 'System',
            fontWeight: '500',
            fontSize: 18,
            color: COLORS.textPrimary,
            marginBottom: 20,
            letterSpacing: -0.3,
          }}>
            Overview Dashboard
          </Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
            gap: 16,
          }}>
            {statsCards.map((stat, index) => (
              <View key={stat.title} style={{ flex: 1 }}>
                <EnhancedStatsCard
                  title={stat.title}
                  value={stat.value}
                  index={index}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Citizen Trust Score Card */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <EnhancedCitizenTrustScoreCard
            score={citizenScore?.citizen_score ?? 50}
            totalIssues={citizenScore?.total_issues ?? 0}
            resolvedIssues={citizenScore?.resolved_issues ?? 0}
          />
        </View>

        {/* Reported Issues Section */}
        <View style={{ marginBottom: 40 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            marginBottom: 20,
          }}>
            <Text style={{
              fontFamily: 'System',
              fontWeight: '700',
              fontSize: 22,
              color: COLORS.textPrimary,
              letterSpacing: -0.3,
            }}>
              Recent Reports
            </Text>
            <Pressable
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: pressed ? COLORS.primaryDark : COLORS.primary,
                borderRadius: 12,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
              onPress={() => router.push("/dashboard/issues")}
            >
              <Text style={{
                fontFamily: 'System',
                fontWeight: '600',
                fontSize: 14,
                color: COLORS.textLight,
              }}>
                View All Reports →
              </Text>
            </Pressable>
          </View>

          {/* Carousel */}
          <View>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={CARD_WIDTH + 32}
              snapToAlignment="center"
              decelerationRate="fast"
              onScroll={handleScroll}
              onMomentumScrollEnd={handleScrollEnd}
              contentContainerStyle={{
                paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
                paddingVertical: 16,
              }}
              style={{ marginHorizontal: -24 }}
            >
              {issuesData.map((issue, index) => (
                <View key={index} style={{ marginRight: 32 }}>
                  <IssueCard
                    icon={issue.icon}
                    title={issue.title}
                    location={issue.location}
                    status={issue.status}
                    urgency={issue.urgency}
                    distance={issue.distance}
                    index={index}
                    scrollX={scrollX}
                  />
                </View>
              ))}
            </ScrollView>

            {/* Enhanced Carousel Controls */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 24,
              gap: 16,
            }}>
              <Pressable
                onPress={handlePrevCard}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: COLORS.cardBackground,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  shadowColor: COLORS.shadowDark,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  opacity: activeCardIndex === 0 ? 0.5 : 1,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                })}
                disabled={activeCardIndex === 0}
              >
                <LinearGradient
                  colors={activeCardIndex === 0 ?
                    [COLORS.textMuted, COLORS.textMuted] :
                    COLORS.gradientPrimary}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={{
                    color: COLORS.textLight,
                    fontSize: 18,
                    fontWeight: '700',
                    marginLeft: -1,
                  }}>‹</Text>
                </LinearGradient>
              </Pressable>

              {/* Enhanced Dots */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {issuesData.map((_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => scrollToIndex(index)}
                  >
                    <View
                      style={{
                        width: activeCardIndex === index ? 28 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: activeCardIndex === index ? COLORS.primary : COLORS.border,
                      }}
                    />
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={handleNextCard}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: COLORS.cardBackground,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  shadowColor: COLORS.shadowDark,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  opacity: activeCardIndex === issuesData.length - 1 ? 0.5 : 1,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                })}
                disabled={activeCardIndex === issuesData.length - 1}
              >
                <LinearGradient
                  colors={activeCardIndex === issuesData.length - 1 ?
                    [COLORS.textMuted, COLORS.textMuted] :
                    COLORS.gradientPrimary}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={{
                    color: COLORS.textLight,
                    fontSize: 18,
                    fontWeight: '700',
                    marginLeft: 1,
                  }}>›</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Updates Section */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{
            fontFamily: 'System',
            fontWeight: '700',
            fontSize: 22,
            color: COLORS.textPrimary,
            marginBottom: 20,
            letterSpacing: -0.3,
          }}>
            Recent Updates
          </Text>
          <View style={{ gap: 16 }}>
            {updatesData.map((update, index) => (
              <EnhancedUpdateCard key={index} message={update} index={index} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FOOTER NAVIGATION */}
      <View style={styles.footer}>
        {/* Home */}
        <Pressable
          style={styles.footerButton}
          onPress={() => router.replace("/dashboard")}
        >
          <Home size={24} color="#2563EB" />
          <Text style={styles.footerText}>Home</Text>
        </Pressable>

        {/* Report Issue */}
        <Pressable
          style={styles.footerButton}
          onPress={() => router.replace("/dashboard/issue_report")}
        >
          <FileEdit size={24} color="#2563EB" />
          <Text style={styles.footerText}>Report</Text>
        </Pressable>

        {/* My Issues */}
        <Pressable
          style={styles.footerButton}
          onPress={() => router.replace("/dashboard/issues")}
        >
          <ClipboardList size={24} color="#2563EB" />
          <Text style={styles.footerText}>Issues</Text>
        </Pressable>

        {/* Profile */}
        <Pressable
          style={styles.footerButton}
          onPress={() => router.replace("/dashboard/profile")}
        >
          <User size={24} color="#2563EB" />
          <Text style={styles.footerText}>Profile</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ==================== StyleSheet Definitions ====================
const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + 20,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    // fontSize set inline
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'System',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  location: {
    textAlign: 'center',
    lineHeight: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 12,
    minWidth: 65,
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 4,
  },
  distanceText: {
    fontWeight: '500',
  },
  // Footer Navigation Styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 24,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});

// Default data arrays for fallback
const defaultIssuesData = [
  {
    icon: '🗑️',
    title: 'Garbage',
    location: 'Road, Zone 3',
    status: 'Resolved' as const,
    urgency: 'MEDIUM' as const,
    distance: '0.3 KM',
  },
  {
    icon: '💧',
    title: 'Water Leak',
    location: 'Maraj, Block A',
    status: 'Resolved' as const,
    urgency: 'MEDIUM' as const,
    distance: '0.3 KM',
  },
  {
    icon: '💧',
    title: 'Garbage Leakage',
    location: 'Marei, Block B',
    status: 'Resolved' as const,
    urgency: 'MEDIUM' as const,
    distance: '0.5 KM',
  },
  {
    icon: '🛣️',
    title: 'Road Damage',
    location: 'Porkex 7',
    status: 'Resolved' as const,
    urgency: 'MEDIUM' as const,
    distance: '0.1 KM',
  },
  {
    icon: '💡',
    title: 'Street Light Out',
    location: 'Locain Road, Block B',
    status: 'Pending' as const,
    urgency: 'URGENCY' as const,
    distance: '0.5 KM',
  },
];

const defaultUpdatesData = [
  'New report from John D. - Pothole on Oak St.',
  "Your issue 'Garbage Overflow' has been resolved",
  'System maintenance scheduled for tomorrow',
  'New feature: Real-time tracking available',
];