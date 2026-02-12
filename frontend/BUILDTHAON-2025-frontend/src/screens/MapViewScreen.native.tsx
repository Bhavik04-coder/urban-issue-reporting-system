// File: MapViewScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from "../config/api";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  PanResponder,
  Platform,
} from 'react-native';

import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import Icon, { IconName } from '../components/icon';

const { width, height } = Dimensions.get('window');

interface Issue {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'New';
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  latitude: number;
  longitude: number;
  createdAt: string;
  userEmail: string;
  department?: string;
  icon?: string;
}

const MapViewScreen: React.FC = () => {
  // State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    status: string[];
    urgency: string[];
  }>({
    status: [],
    urgency: [],
  });

  // Refs
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const searchSlideAnim = useRef(new Animated.Value(-width)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const filterHeight = useRef(new Animated.Value(0)).current;

  // Urgency colors
  const urgencyColors = {
    Urgent: '#FF4757',
    High: '#FFA502',
    Medium: '#FFD32A',
    Low: '#2ED573',
  };

  // Status colors
  const statusColors = {
    New: '#4361EE',
    Pending: '#FF9F43',
    'In Progress': '#2D98DA',
    Resolved: '#20BF6B',
  };

  useEffect(() => {
    // Start animations
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
      Animated.timing(searchSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // ✅ Fixed: No useNativeDriver in Animated.loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,  // This is fine
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,  // This is fine
          }),
        ])
      ),
    ]).start();

    // Load data
    loadUserLocation();
    loadIssues();
  }, []);

  const loadUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };
  const normalizeStatus = (status: string) => {
    if (!status) return "Pending";
    if (status === "Reported") return "New";
    return status;
  };

  const loadIssues = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE}/admin/issues`);
      const data = await res.json();

      const formattedIssues: Issue[] = data.issues.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        status: issue.status || "Pending",
        urgency: issue.urgency_level || "Medium",
        latitude: issue.location_lat,
        longitude: issue.location_long,
        createdAt: issue.created_at,
        userEmail: issue.user_email,
        department: issue.assigned_department || "Public Works",
        icon:
          issue.urgency_level === "High"
            ? "🚨"
            : issue.urgency_level === "Medium"
              ? "⚠️"
              : "📍",
      }));

      setIssues(formattedIssues);

    } catch (error) {
      console.error("Failed to load map issues:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadIssues();
  };

  const handleMarkerPress = (issue: Issue) => {
    // Animate marker press
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedIssue(issue);

    // Animate map to marker
    mapRef.current?.animateToRegion({
      latitude: issue.latitude,
      longitude: issue.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // Mock search - in real app, you would geocode the address
    const mockCoordinates = {
      latitude: 18.5204,
      longitude: 73.8567,
    };

    mapRef.current?.animateToRegion({
      ...mockCoordinates,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);

    // Clear search
    setSearchQuery('');
  };

  const handleZoomIn = () => {
    if (userLocation) {
      const newRegion = {
        ...userLocation,
        latitudeDelta: userLocation.latitudeDelta / 2,
        longitudeDelta: userLocation.longitudeDelta / 2,
      };
      mapRef.current?.animateToRegion(newRegion, 500);
    }
  };

  const handleZoomOut = () => {
    if (userLocation) {
      const newRegion = {
        ...userLocation,
        latitudeDelta: userLocation.latitudeDelta * 2,
        longitudeDelta: userLocation.longitudeDelta * 2,
      };
      mapRef.current?.animateToRegion(newRegion, 500);
    }
  };

  const handleFocusUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.error('Error focusing location:', error);
    }
  };

  const toggleFilters = () => {
    Animated.timing(filterHeight, {
      toValue: showFilters ? 0 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowFilters(!showFilters);
  };

  const toggleFilter = (type: 'status' | 'urgency', value: string) => {
    setActiveFilters(prev => {
      const currentValues = prev[type];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [type]: currentValues.filter(v => v !== value),
        };
      } else {
        return {
          ...prev,
          [type]: [...currentValues, value],
        };
      }
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      status: [],
      urgency: [],
    });
  };

  const filteredIssues = issues.filter(issue => {
    if (activeFilters.status.length > 0 && !activeFilters.status.includes(issue.status)) {
      return false;
    }
    if (activeFilters.urgency.length > 0 && !activeFilters.urgency.includes(issue.urgency)) {
      return false;
    }
    return true;
  });

  const renderMarker = (issue: Issue, index: number) => {
    const markerAnimation = new Animated.Value(1);

    return (
      <Marker
        key={issue.id}
        coordinate={{
          latitude: issue.latitude,
          longitude: issue.longitude,
        }}
        onPress={() => handleMarkerPress(issue)}
      >
        <Animated.View
          style={[
            styles.markerContainer,
            {
              backgroundColor: urgencyColors[issue.urgency],
              transform: [
                { scale: markerAnimation },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              urgencyColors[issue.urgency],
              urgencyColors[issue.urgency] + 'DD',
            ]}
            style={styles.markerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={styles.markerPulse}>
              <View style={styles.markerInner}>
                <Text style={styles.markerIcon}>{issue.icon || '📍'}</Text>
                <View style={styles.markerBadge}>
                  <Text style={styles.markerBadgeText}>
                    {issue.urgency === 'Urgent' ? '!!!' :
                      issue.urgency === 'High' ? '!!' :
                        issue.urgency === 'Medium' ? '!' : '•'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </Marker>
    );
  };

  const renderIssueDetail = () => {
    if (!selectedIssue) return null;

    return (
      <Modal
        animationType="slide"
        transparent
        visible={!!selectedIssue}
        onRequestClose={() => setSelectedIssue(null)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.detailCard,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
                opacity: fadeAnim,
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={styles.detailGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Header */}
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderLeft}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: statusColors[selectedIssue.status] }
                  ]} />
                  <View>
                    <Text style={styles.detailTitle}>{selectedIssue.title}</Text>
                    <Text style={styles.detailSubtitle}>
                      Issue #{selectedIssue.id} • {selectedIssue.department}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedIssue(null)}
                >
                  <Icon name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Urgency Badge */}
              <View style={styles.urgencyBadgeContainer}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <LinearGradient
                    colors={[
                      urgencyColors[selectedIssue.urgency],
                      urgencyColors[selectedIssue.urgency] + 'DD',
                    ]}
                    style={styles.urgencyBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.urgencyBadgeText}>
                      {selectedIssue.urgency.toUpperCase()} PRIORITY
                    </Text>
                  </LinearGradient>
                </Animated.View>

              </View>

              {/* Content */}
              <ScrollView style={styles.detailContent}>
                <View style={styles.infoSection}>
                  <Icon name="description" size={20} color="#4361EE" />
                  <Text style={styles.infoText}>{selectedIssue.description}</Text>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Icon name="person" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Reporter</Text>
                    <Text style={styles.infoValue}>{selectedIssue.userEmail}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Icon name="calendar-today" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Reported</Text>
                    <Text style={styles.infoValue}>{selectedIssue.createdAt}</Text>
                  </View>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Icon name="location-on" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>
                      {selectedIssue.latitude.toFixed(4)}, {selectedIssue.longitude.toFixed(4)}
                    </Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Icon name="assignment" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Status</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors[selectedIssue.status] + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: statusColors[selectedIssue.status] }
                      ]}>
                        {selectedIssue.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButtonSecondary}>
                  <Icon name="edit" size={18} color="#4361EE" />
                  <Text style={styles.actionButtonSecondaryText}>Edit Status</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButtonPrimary}>
                  <LinearGradient
                    colors={['#4361EE', '#3A0CA3']}
                    style={styles.actionButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Icon name="directions" size={18} color="#FFFFFF" />
                    <Text style={styles.actionButtonPrimaryText}>Get Directions</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const renderLegend = () => (
    <Animated.View
      style={[
        styles.legendContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.legendGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.legendHeader}
          onPress={() => setShowLegend(!showLegend)}
        >
          <Text style={styles.legendTitle}>Issue Legend</Text>
          <Icon
            name={showLegend ? 'expand-less' : 'expand-more'}
            size={20}
            color="#4361EE"
          />
        </TouchableOpacity>

        {showLegend && (
          <Animated.View style={styles.legendContent}>
            {Object.entries(urgencyColors).map(([urgency, color]) => (
              <View key={urgency} style={styles.legendItem}>
                <View style={styles.legendColorContainer}>

                  {/* ✅ FIX: Animated wrapper */}
                  <Animated.View
                    style={{ transform: [{ scale: pulseAnim }] }}
                  >
                    <LinearGradient
                      colors={[color, color + 'DD']}
                      style={styles.legendColor}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.legendIcon}>
                        {urgency === 'Urgent'
                          ? '!!!'
                          : urgency === 'High'
                            ? '!!'
                            : urgency === 'Medium'
                              ? '!'
                              : '•'}
                      </Text>
                    </LinearGradient>
                  </Animated.View>

                </View>
                <Text style={styles.legendText}>{urgency}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );


  const renderFilters = () => (
    <Animated.View
      style={[
        styles.filterContainer,
        {
          height: filterHeight,
        },
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.filterGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.filterTitle}>Filter Issues</Text>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Status</Text>
          <View style={styles.filterChips}>
            {Object.keys(statusColors).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  activeFilters.status.includes(status) && styles.filterChipActive,
                ]}
                onPress={() => toggleFilter('status', status)}
              >
                <View style={[
                  styles.statusDot,
                  { backgroundColor: statusColors[status as keyof typeof statusColors] }
                ]} />
                <Text style={[
                  styles.filterChipText,
                  activeFilters.status.includes(status) && styles.filterChipTextActive,
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Urgency</Text>
          <View style={styles.filterChips}>
            {Object.keys(urgencyColors).map(urgency => (
              <TouchableOpacity
                key={urgency}
                style={[
                  styles.filterChip,
                  activeFilters.urgency.includes(urgency) && styles.filterChipActive,
                  {
                    backgroundColor: activeFilters.urgency.includes(urgency)
                      ? urgencyColors[urgency as keyof typeof urgencyColors] + '20'
                      : '#FFFFFF'
                  },
                ]}
                onPress={() => toggleFilter('urgency', urgency)}
              >
                <View style={[
                  styles.urgencyDot,
                  { backgroundColor: urgencyColors[urgency as keyof typeof urgencyColors] }
                ]} />
                <Text style={[
                  styles.filterChipText,
                  activeFilters.urgency.includes(urgency) && {
                    color: urgencyColors[urgency as keyof typeof urgencyColors],
                    fontWeight: '700',
                  },
                ]}>
                  {urgency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Icon name="clear-all" size={18} color="#64748B" />
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <Animated.View style={{
          transform: [{
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            })
          }]
        }}>
          <Icon name="map" size={64} color="#4361EE" />
        </Animated.View>
        <Text style={styles.loadingText}>Loading map data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A237E" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
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
          colors={['#1A237E', '#283593']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Icon name="map" size={28} color="#FFFFFF" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Admin Map View</Text>
                <Text style={styles.headerSubtitle}>
                  {filteredIssues.length} issues • {issues.length} total
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Animated.View style={{
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }}>
                <Icon name="refresh" size={22} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            transform: [{ translateX: searchSlideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.searchGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location or address..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={toggleFilters}>
              <Icon name="filter-list" size={20} color="#4361EE" />
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Filters */}
      {renderFilters()}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={userLocation || {
          latitude: 18.5204,
          longitude: 73.8567,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {filteredIssues.map((issue, index) => renderMarker(issue, index))}
      </MapView>

      {/* Legend */}
      {renderLegend()}

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <Animated.View
          style={[
            styles.controlGroup,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleZoomIn}
          >
            <LinearGradient
              colors={['#4361EE', '#3A0CA3']}
              style={styles.controlButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleZoomOut}
          >
            <LinearGradient
              colors={['#4361EE', '#3A0CA3']}
              style={styles.controlButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="remove" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleFocusUserLocation}
          >
            <LinearGradient
              colors={['#2ED573', '#20BF6B']}
              style={styles.controlButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="my-location" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Issue Detail Modal */}
      {renderIssueDetail()}
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
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 12,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2B2D42',
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  markerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    fontSize: 12,
  },
  markerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4757',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  markerBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  legendContainer: {
    position: 'absolute',
    top: 160,
    left: 20,
    width: 160,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  legendGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4361EE',
  },
  legendContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColorContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  legendColor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  legendText: {
    marginLeft: 12,
    fontSize: 12,
    fontWeight: '500',
    color: '#2B2D42',
  },
  filterContainer: {
    position: 'absolute',
    top: 160,
    left: 20,
    right: 20,
    zIndex: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  filterGradient: {
    padding: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2D42',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    borderWidth: 2,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: '#4361EE',
    fontWeight: '700',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 6,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 10,
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlButton: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  controlButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  detailGradient: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2D42',
  },
  detailSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyBadgeContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  urgencyBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  detailContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginLeft: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#2B2D42',
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  actionButtonSecondaryText: {
    color: '#4361EE',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonPrimary: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MapViewScreen;