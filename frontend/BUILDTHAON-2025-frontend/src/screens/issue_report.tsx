import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from "../config/api";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import {
  LinearGradient
} from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  ArrowLeft,
  HelpCircle,
  User,
  ChevronDown,
  CheckCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
  MapPin,
  Search,
  Edit3,
  Send,
  Clock,
  TrendingUp,
  AlertCircle,
  Check,
  Radio,
  FileText,
  Phone,
  Mail,
  X,
  Map,
  Navigation,
  Upload,
  FileEdit,
  Award,
  Shield,
  Globe
} from 'lucide-react-native';
import Constants from 'expo-constants';

// Enhanced formal color palette matching the dashboard
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
  gradientOcean: ['#0EA5E9', '#38BDF8'] as const,
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

// Enhanced Header Component
const EnhancedHeader = ({ onBack, onHelp, onProfile }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

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
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    // Wave animation
    const waveAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    waveAnimation.start();

    return () => waveAnimation.stop();
  }, []);

  const waveTranslateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.3, 0.1],
  });

  return (
    <Animated.View
      style={{
        backgroundColor: COLORS.backgroundDark,
        opacity: fadeAnim,
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        overflow: 'hidden',
        position: 'relative',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}
    >
      {/* Animated gradient background */}
      <LinearGradient
        colors={[COLORS.backgroundDark, '#1E293B']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated wave pattern */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          opacity: waveOpacity,
          transform: [{ translateY: waveTranslateY }],
        }}
      >
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.1)', 'rgba(37, 99, 235, 0.05)', 'transparent']}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      {/* Floating particles */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: COLORS.primaryLight,
            top: 20 + i * 15,
            left: 30 + i * 70,
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

      <View style={{
        paddingTop: Constants.statusBarHeight + 16,
        paddingHorizontal: 24,
        paddingBottom: 28,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          {/* Back Button - FIXED: Use regular Pressable with animated style */}
          <Pressable
            onPress={onBack}
            style={({ pressed }) => ({
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.95 : 1 }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            <ArrowLeft size={24} color={COLORS.textLight} />
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Help Button - FIXED: Use regular Pressable */}
            <Pressable
              onPress={onHelp}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.95 : 1 }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              })}
            >
              <HelpCircle size={24} color={COLORS.textLight} />
            </Pressable>

            {/* Profile Button - FIXED: Use regular Pressable */}
            <Pressable
              onPress={onProfile}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.95 : 1 }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              })}
            >
              <User size={24} color={COLORS.textLight} />
            </Pressable>
          </View>
        </View>

        <Animated.View
          style={{
            alignItems: 'center',
            paddingVertical: 8,
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [-50, 0],
                outputRange: [20, 0]
              })
            }]
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            position: 'relative',
          }}>
            {/* Icon with glow effect */}
            <Animated.View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }}
            >
              <FileEdit size={32} color={COLORS.textLight} />

              {/* Pulsing glow */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  borderRadius: 42,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                  opacity: waveOpacity,
                  transform: [{
                    scale: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2]
                    })
                  }]
                }}
              />
            </Animated.View>

            <View>
              <Text style={styles.headerTitle}>Report an Issue</Text>
              <Animated.View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8,
                  opacity: fadeAnim,
                  transform: [{
                    translateX: slideAnim.interpolate({
                      inputRange: [-50, 0],
                      outputRange: [20, 0]
                    })
                  }]
                }}
              >
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.primaryLight,
                  marginRight: 8,
                }} />
                <Text style={styles.headerSubtitle}>
                  Help us make the city better
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* Status badge */}
          <Animated.View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(16, 185, 129, 0.3)',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginTop: 16,
              opacity: fadeAnim,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [-50, 0],
                  outputRange: [20, 0]
                })
              }]
            }}
          >
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: COLORS.successLight,
              marginLeft: 8,
              letterSpacing: 0.3,
            }}>
              Your reports contribute to urban improvement
            </Text>
          </Animated.View>

          {/* Progress indicator line */}
          <Animated.View
            style={{
              width: '100%',
              height: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1.5,
              marginTop: 24,
              opacity: fadeAnim,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                width: '60%',
                height: '100%',
                backgroundColor: COLORS.primary,
                borderRadius: 1.5,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [-50, 0],
                    outputRange: [-100, 0]
                  })
                }]
              }}
            />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Bottom decorative curve */}
      <View style={{
        position: 'absolute',
        bottom: -20,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }} />
    </Animated.View>
  );
};

// Enhanced Field Card Component
const EnhancedFieldCard = ({ label, children, icon: Icon, index }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
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
      <View style={styles.enhancedFieldCard}>
        <View style={styles.fieldHeader}>
          {Icon && (
            <View style={styles.fieldIconContainer}>
              <Icon size={18} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.enhancedFieldLabel}>{label}</Text>
        </View>

        <View style={styles.fieldContent}>
          {children}
        </View>

        {/* Animated border bottom */}
        <Animated.View
          style={{
            height: 2,
            backgroundColor: COLORS.primary,
            borderRadius: 1,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.2]
            }),
            marginTop: 12,
          }}
        />
      </View>
    </Animated.View>
  );
};

// Enhanced Menu Tile Component
const EnhancedMenuTile = ({ valueText, onPress, trailing, icon: Icon, badge }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={({ pressed }) => [
        styles.enhancedMenuTile,
        {
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <View style={styles.menuTileContent}>
        {Icon && (
          <View style={styles.menuTileIcon}>
            <Icon size={20} color={COLORS.primary} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.enhancedMenuTileText}>{valueText}</Text>
          {badge && (
            <Text style={styles.menuTileBadge}>{badge}</Text>
          )}
        </View>

        {trailing || (
          <View style={styles.chevronContainer}>
            <ChevronDown size={20} color={COLORS.textSecondary} />
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
};

// Enhanced Submit Button Component
const EnhancedSubmitButton = ({ onPress, disabled, loading }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.enhancedSubmitButton,
          (disabled || loading) && styles.submitButtonDisabled,
        ]}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.submitGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Glow effect */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                opacity: glowOpacity,
              }
            ]}
          />

          <View style={styles.submitButtonContent}>
            {loading ? (
              <Animated.View style={styles.loadingSpinner}>
                <View style={styles.spinnerInner} />
              </Animated.View>
            ) : (
              <Send size={22} color={COLORS.textLight} />
            )}
            <Text style={styles.enhancedSubmitButtonText}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Text>
          </View>

          {/* Shine effect */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: -100,
              width: 50,
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              transform: [{
                translateX: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, SCREEN_WIDTH + 200]
                })
              }]
            }}
          />
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
};

// Enhanced Image Upload Component
const EnhancedImageUpload = ({ selectedImage, onPickImage, onRemoveImage, uploading }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (!selectedImage) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
    }

    return () => pulseAnimation.stop();
  }, [selectedImage]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {!selectedImage ? (
        <AnimatedPressable
          style={({ pressed }) => [
            styles.enhancedImageButton,
            {
              transform: [
                { scale: pressed ? 0.98 : pulseAnim }
              ]
            }
          ]}
          onPress={onPickImage}
        >
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.05)'] as const}
            style={styles.imageButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.imageButtonIcon}>
              <Upload size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.enhancedImageButtonText}>Add Photo</Text>
            <Text style={styles.imageButtonSubtext}>Optional - Tap to add</Text>
          </LinearGradient>
        </AnimatedPressable>
      ) : (
        <View style={styles.imagePreviewWrapper}>
          <Animated.View
            style={[
              styles.enhancedImagePreview,
              {
                transform: [{ scale: fadeAnim }]
              }
            ]}
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
              resizeMode="cover"
            />

            {uploading && (
              <View style={styles.imageUploadOverlay}>
                <Animated.View style={styles.uploadingSpinner}>
                  <View style={styles.spinnerCircle} />
                </Animated.View>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}

            <AnimatedPressable
              style={({ pressed }) => [
                styles.removeImageButton,
                { transform: [{ scale: pressed ? 0.9 : 1 }] }
              ]}
              onPress={onRemoveImage}
            >
              <LinearGradient
                colors={COLORS.gradientDanger}
                style={styles.removeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Trash2 size={18} color={COLORS.textLight} />
                <Text style={styles.removeButtonText}>Remove</Text>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
};

// Enhanced Location Status Component
const EnhancedLocationStatus = ({ type, loading, error, address, onRetry, onManual }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  if (loading) {
    return (
      <Animated.View
        style={[
          styles.locationStatusContainer,
          styles.locationLoading,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.locationStatusHeader}>
          <Animated.View style={styles.locationSpinner}>
            <Navigation size={18} color={COLORS.primary} />
          </Animated.View>
          <Text style={styles.locationStatusTitle}>Getting Location</Text>
        </View>
        <Text style={styles.locationStatusMessage}>
          Fetching your current location...
        </Text>
        <View style={styles.locationProgress}>
          <Animated.View
            style={[
              styles.locationProgressBar,
              {
                transform: [
                  {
                    scaleX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
                transformOrigin: 'left',
              },
            ]}
          />

        </View>
      </Animated.View>
    );
  }

  if (error) {
    return (
      <Animated.View
        style={[
          styles.locationStatusContainer,
          styles.locationError,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.locationStatusHeader}>
          <AlertCircle size={20} color={COLORS.danger} />
          <Text style={styles.locationStatusTitle}>Location Error</Text>
        </View>
        <Text style={styles.locationStatusMessage}>{error}</Text>
        <View style={styles.locationActionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.locationActionButton,
              styles.retryButton,
              { transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
            onPress={onRetry}
          >
            <Navigation size={16} color={COLORS.danger} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.locationActionButton,
              styles.manualButton,
              { transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
            onPress={onManual}
          >
            <Edit3 size={16} color={COLORS.primary} />
            <Text style={styles.manualButtonText}>Enter Manually</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  if (address) {
    return (
      <Animated.View
        style={[
          styles.locationStatusContainer,
          styles.locationSuccess,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.locationStatusHeader}>
          <CheckCircle size={20} color={COLORS.success} />
          <Text style={styles.locationStatusTitle}>📍 Location Captured</Text>
        </View>
        <Text style={styles.locationStatusMessage}>
          {address}
        </Text>
      </Animated.View>
    );
  }

  return null;
};

export default function ReportIssueScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<string | null>(null);
  const [locationChoice, setLocationChoice] = useState<string | null>(null);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; long: number } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setUrgencyLevel(null);
    setLocationChoice(null);
    setShowManualLocation(false);
    setManualLocation('');
    setDescription('');
    setSelectedImage(null);
    setCurrentAddress('');
    setLocationError('');
    setCoords(null);
  };

  useEffect(() => {
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'High': return COLORS.danger;
      case 'Medium': return COLORS.warning;
      case 'Low': return COLORS.success;
      default: return COLORS.textMuted;
    }
  };

  const getUrgencyGradient = () => {
    switch (urgencyLevel) {
      case 'High': return COLORS.gradientDanger;
      case 'Medium': return COLORS.gradientWarning;
      case 'Low': return COLORS.gradientSuccess;
      default: return ['#94A3B8', '#94A3B8'] as const;
    }
  };

  const predictDepartment = async () => {
    const formData = new FormData();
    formData.append("description", description);

    if (selectedImage) {
      formData.append("image", {
        uri: selectedImage,
        name: "issue.jpg",
        type: "image/jpeg",
      } as any);
    }

    const res = await fetch(`${API_BASE}/predict-department`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    return await res.json();
  };

  const validateRequired = () => {
    return name.trim() !== '' &&
      phone.trim() !== '' &&
      urgencyLevel !== null &&
      locationChoice !== null &&
      description.trim() !== '';
  };

  // Location Functions
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable location services.');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoords({
        lat: location.coords.latitude,
        long: location.coords.longitude,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setCurrentAddress(
        address[0]
          ? `${address[0].street || ''}, ${address[0].city || ''}, ${address[0].region || ''}`
          : `Coordinates: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
      );

      setLocationChoice('📍 Current location');
      setIsLoadingLocation(false);

      // Scroll to show location status
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 400, animated: true });
      }, 300);
    } catch (error) {
      console.error('Location error:', error);
      setLocationError('Failed to get location. Please try again or enter manually.');
      setIsLoadingLocation(false);
    }
  };

  const searchCityLocation = async () => {
    if (!citySearch.trim()) return;

    setIsSearchingCity(true);

    try {
      // Simulate API call - replace with actual geocoding service
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response
      setCurrentAddress(`📍 ${citySearch}, City Location`);
      setLocationChoice(`📍 ${citySearch}`);
      setShowCitySearch(false);
      setCitySearch('');
      setShowCitySearch(false);
    } catch (error) {
      Alert.alert('Error', `❌ Failed to find location: ${error}`);
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Image Functions
  const showImageSourceDialog = () => {
    Alert.alert(
      'Add Photo',
      'Choose image source to add photo evidence',
      [
        {
          text: '📷 Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.85,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.85,
          selectionLimit: 1,
        });
      }

      if (!result.canceled) {
        setIsUploadingImage(true);
        setSelectedImage(result.assets[0].uri);

        // Simulate upload
        setTimeout(() => {
          setIsUploadingImage(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Image pick error:', error);
      setIsUploadingImage(false);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setSelectedImage(null),
        },
      ]
    );
  };

  // Choice Sheets
  const showChoiceSheet = (
    title: string,
    items: string[],
    onPick: (choice: string) => void
  ) => {
    Alert.alert(
      title,
      undefined,
      [
        ...items.map(item => ({
          text: item,
          onPress: () => onPick(item),
        })),
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const showUrgencyMenu = () => {
    Alert.alert(
      'Select Urgency Level',
      'How urgent is this issue?',
      [
        {
          text: '🔴 High Priority',
          onPress: () => setUrgencyLevel('High'),
        },
        {
          text: '🟡 Medium Priority',
          onPress: () => setUrgencyLevel('Medium'),
        },
        {
          text: '🟢 Low Priority',
          onPress: () => setUrgencyLevel('Low'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const showLocationMenu = () => {
    Alert.alert(
      'Select Location Method',
      'How would you like to provide the location?',
      [
        {
          text: '📍 Use Current Location',
          onPress: getCurrentLocation,
        },
        {
          text: '🔍 Search by City',
          onPress: () => setShowCitySearch(true),
        },
        {
          text: '✏️ Enter Manually',
          onPress: () => {
            setLocationChoice('✏️ Manual location');
            setShowManualLocation(true);
            setLocationError('');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Submit Handler
  const handleSubmit = async () => {
    // Validate location
    const hasLocation = currentAddress || (showManualLocation && manualLocation.trim());
    if (!hasLocation) {
      Alert.alert(
        'Location Required',
        'Please provide a location using GPS, city search, or manual entry.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ AI prediction
      const aiResult = await predictDepartment();

      // 2️⃣ Create report
      const reportPayload = {
        user_name: name,
        user_mobile: phone,
        user_email: email || null,
        urgency_level: urgencyLevel,
        title: description.split(" ").slice(0, 5).join(" "),
        description,
        location_lat: coords?.lat,
        location_long: coords?.long,
        location_address: currentAddress || manualLocation,

        // 🔥 AI fields
        department: aiResult.final_department,
        auto_assigned: aiResult.final_confidence >= 50,
        prediction_confidence: aiResult.final_confidence,
      };

      const res = await fetch(`${API_BASE}/reports/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportPayload),
      });

      if (!res.ok) throw new Error("Report creation failed");

      Alert.alert("✅ Success", "Issue reported & auto-assigned!");
      resetForm();
    } catch (err) {
      Alert.alert("❌ Error", "Failed to submit issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showHelpDialog = () => {
    Alert.alert(
      'How to Report an Issue',
      'Follow these steps to submit a proper report:\n\n' +
      '1. 📝 Fill your contact details for follow-up\n' +
      '2. ⚡ Select urgency level based on severity\n' +
      '3. 📋 Describe the issue in detail\n' +
      '4. 📍 Provide accurate location\n' +
      '5. 📷 Add photo evidence (optional)\n' +
      '6. ✅ Submit for review\n\n' +
      'Your reports help improve city infrastructure.',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <EnhancedHeader
        onBack={() => console.log('Back')}
        onHelp={showHelpDialog}
        onProfile={() => Alert.alert('Profile', 'Profile page coming soon')}
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Fields */}
        <EnhancedFieldCard label="Name *" icon={User} index={0}>
          <TextInput
            style={styles.enhancedInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="words"
          />
        </EnhancedFieldCard>

        <EnhancedFieldCard label="Phone *" icon={Phone} index={1}>
          <TextInput
            style={styles.enhancedInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </EnhancedFieldCard>

        <EnhancedFieldCard label="Email (optional)" icon={Mail} index={2}>
          <TextInput
            style={styles.enhancedInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </EnhancedFieldCard>

        {/* Urgency Level */}
        <EnhancedFieldCard label="Urgency Level *" icon={AlertCircle} index={3}>
          <EnhancedMenuTile
            valueText={urgencyLevel ? `${urgencyLevel} Priority` : 'Select urgency level…'}
            onPress={showUrgencyMenu}
            icon={AlertCircle}
            badge={urgencyLevel ? 'Priority' : 'Tap to select'}
            trailing={
              urgencyLevel && (
                <LinearGradient
                  colors={getUrgencyGradient()}
                  style={styles.urgencyBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.urgencyBadgeText}>{urgencyLevel}</Text>
                </LinearGradient>
              )
            }
          />
        </EnhancedFieldCard>

        {/* Description */}
        <EnhancedFieldCard label="Description *" icon={FileText} index={4}>
          <TextInput
            style={[styles.enhancedInput, styles.enhancedTextArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue in detail…\n• What is the problem?\n• Where exactly is it located?\n• How does it affect people?"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>
            {description.length}/500 characters
          </Text>
        </EnhancedFieldCard>

        {/* Location */}
        <EnhancedFieldCard label="Location *" icon={MapPin} index={5}>
          <EnhancedMenuTile
            valueText={locationChoice || 'Select location method…'}
            onPress={showLocationMenu}
            icon={MapPin}
            badge={locationChoice ? 'Selected' : 'Required'}
          />
        </EnhancedFieldCard>

        {/* Location Status */}
        <EnhancedLocationStatus
          type={locationChoice}
          loading={isLoadingLocation}
          error={locationError}
          address={currentAddress}
          onRetry={getCurrentLocation}
          onManual={() => {
            setLocationChoice('✏️ Manual location');
            setShowManualLocation(true);
            setLocationError('');
          }}
        />

        {/* Manual Location Input */}
        {showManualLocation && (
          <EnhancedFieldCard label="Enter Location Manually *" icon={Edit3} index={6}>
            <TextInput
              style={[styles.enhancedInput, styles.enhancedTextArea]}
              value={manualLocation}
              onChangeText={setManualLocation}
              placeholder="Enter complete address:\n• House/Building number\n• Street name\n• Landmark\n• City\n• Pin code"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </EnhancedFieldCard>
        )}

        {/* Image Upload */}
        <EnhancedFieldCard label="Add Photo Evidence (Optional)" icon={Camera} index={7}>
          <EnhancedImageUpload
            selectedImage={selectedImage}
            onPickImage={showImageSourceDialog}
            onRemoveImage={removeImage}
            uploading={isUploadingImage}
          />
        </EnhancedFieldCard>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Shield size={16} color={COLORS.primary} />
          <Text style={styles.privacyText}>
            Your personal information is protected and will only be used for official communication regarding this report.
          </Text>
        </View>

        {/* Submit Button */}
        <EnhancedSubmitButton
          onPress={handleSubmit}
          disabled={!validateRequired()}
          loading={isSubmitting}
        />

        <Text style={styles.requiredNotice}>
          * Required fields must be filled to submit the report
        </Text>
      </Animated.ScrollView>

      {/* City Search Modal */}
      <Modal
        visible={showCitySearch}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCitySearch(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.enhancedModalContent}>
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.enhancedModalTitle}>Search City</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowCitySearch(false)}
              >
                <X size={24} color={COLORS.textLight} />
              </Pressable>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={styles.enhancedSearchContainer}>
                <Search size={22} color={COLORS.primary} />
                <TextInput
                  style={styles.enhancedSearchInput}
                  value={citySearch}
                  onChangeText={setCitySearch}
                  placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)..."
                  placeholderTextColor={COLORS.textMuted}
                  autoFocus
                />
                {citySearch && (
                  <Pressable onPress={() => setCitySearch('')}>
                    <X size={20} color={COLORS.textSecondary} />
                  </Pressable>
                )}
              </View>

              {isSearchingCity ? (
                <View style={styles.searchingContainer}>
                  <Animated.View style={styles.searchingSpinner}>
                    <Globe size={24} color={COLORS.primary} />
                  </Animated.View>
                  <Text style={styles.searchingText}>Searching for {citySearch}...</Text>
                </View>
              ) : (
                <View style={styles.searchTips}>
                  <Text style={styles.tipsTitle}>💡 Search Tips:</Text>
                  <Text style={styles.tip}>• Enter city name accurately</Text>
                  <Text style={styles.tip}>• Include state if known</Text>
                  <Text style={styles.tip}>• Check spelling for best results</Text>
                </View>
              )}

              <View style={styles.enhancedModalButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalActionButton,
                    styles.modalCancelButton,
                    { transform: [{ scale: pressed ? 0.95 : 1 }] }
                  ]}
                  onPress={() => setShowCitySearch(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalActionButton,
                    styles.modalSearchButton,
                    { transform: [{ scale: pressed ? 0.95 : 1 }] }
                  ]}
                  onPress={searchCityLocation}
                  disabled={!citySearch.trim() || isSearchingCity}
                >
                  <LinearGradient
                    colors={COLORS.gradientPrimary}
                    style={styles.searchButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Search size={18} color={COLORS.textLight} />
                    <Text style={styles.modalSearchButtonText}>
                      {isSearchingCity ? 'Searching...' : 'Search'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 48,
  },

  // Enhanced Field Card
  enhancedFieldCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  enhancedFieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  fieldContent: {
    // Content styles
  },
  // Enhanced Input
  enhancedInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  enhancedTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    borderBottomWidth: 0,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  // Enhanced Menu Tile
  enhancedMenuTile: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
  },
  menuTileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  enhancedMenuTileText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  menuTileBadge: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  chevronContainer: {
    padding: 4,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  urgencyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Enhanced Submit Button
  enhancedSubmitButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitGradient: {
    paddingVertical: 20,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  enhancedSubmitButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.textLight,
    borderTopColor: 'transparent',
  },
  spinnerInner: {
    flex: 1,
  },
  // Enhanced Image Upload
  enhancedImageButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageButtonGradient: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 20,
  },
  imageButtonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  enhancedImageButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  imageButtonSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  imagePreviewWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBackground,
  },
  enhancedImagePreview: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 240,
  },
  imageUploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingSpinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.textLight,
    borderTopColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerCircle: {
    width: 24,
    height: 24,
  },
  uploadingText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 12,
    fontWeight: '600',
  },
  removeImageButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  removeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  // Enhanced Location Status
  locationStatusContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  locationLoading: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  locationError: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  locationSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  locationStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationSpinner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationStatusMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  locationProgress: {
    height: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  locationProgressBar: {
    height: '100%',
    width: '100%', // ✅ REQUIRED
    backgroundColor: COLORS.primary,
  },

  locationActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  locationActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  retryButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: COLORS.dangerLight,
  },
  manualButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderColor: COLORS.primaryLight,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },
  manualButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Privacy Notice
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  requiredNotice: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  // Enhanced Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  enhancedModalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enhancedModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalBody: {
    padding: 24,
  },
  enhancedSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  enhancedSearchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginHorizontal: 12,
  },
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  searchingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  searchingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  searchTips: {
    backgroundColor: 'rgba(37, 99, 235, 0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  enhancedModalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalCancelButton: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  modalSearchButton: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  modalSearchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});