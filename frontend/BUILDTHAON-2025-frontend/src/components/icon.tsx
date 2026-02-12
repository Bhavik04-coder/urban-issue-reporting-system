import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

// icon.tsx - UPDATED IconName type
export type IconName =
  // Basic icons
  | 'home' | 'alert-circle' | 'list' | 'user'
  | 'water' | 'trash' | 'lightbulb' | 'alert-triangle'
  | 'map-pin' | 'chevron-right' | 'clock' | 'check-circle'
  // Admin icons
  | 'admin-panel-settings' | 'analytics' | 'map' | 'person'
  | 'task-alt' | 'verified' | 'pending-actions' | 'refresh'
  | 'logout' | 'error-outline' | 'apartment'
  // Form icons
  | 'person-outline' | 'phone-outlined' | 'email-outlined'
  | 'lock-outline' | 'lock-person-outlined' | 'login'
  | 'person-add' | 'build-circle' | 'warning'
  | 'dashboard' | 'report' | 'analytics-outlined'
  // Additional icons from your files
  | 'dashboard' | 'analytics-outlined' | 'report-outlined'
  | 'map-outlined' | 'person-outline'
  // ADD THESE SPECIFIC ICONS FOR AdminDashboard
  | 'assessment'        // For analytics in nav
  | 'description'       // For report in nav
  | 'map'               // Already exists
  | 'person'            // Already exists
  | 'check-circle'      // Already exists for resolved status
  | 'build-circle'      // Already exists for in progress status
  | 'warning'           // Already exists for urgent status
  | 'pending-actions'   // Already exists for pending status
  | 'task-alt'          // Already exists for total issues
  | 'verified'          // Already exists for resolved issues
  | 'error-outline'     // Already exists for error
  | 'admin-panel-settings' // Already exists for avatar/header
  | 'refresh'           // Already exists for refresh button
  | 'logout'
  | 'directions-bus'
  | 'park'
  | 'arrow-back'     // Add this
  | 'add'           // Add this  
  | 'visibility'    // Add this
  | 'shield'        // Add this
  | 'settings'
  |'clean-hands'
  |'road'
  |'water-drop'
  |'flash-on'
  |'more-horiz'
  |'business'
  |'calendar-today'
  |'bar-chart'
  |'timeline'
  |'feedback'
  |'filter-alt'
  |'auto-awesome'
  |'close'
  |'star'
  |'location-on'
  |'assignment'
  |'directions'
  |'clear-all'
  |'search'
  |'expand-less'
  |'expand-more'
  |'filter-list'
  |'remove'
  |'my-location'
  |'edit'
  |'delete'
  |'report-problem'
  |'schedule'
  |'phone'
  |'email'
  |'category'
  |'priority-high'
  |'notes'
  |'verified-user'
  |'inbox'
  |'check'
  |'check-circle'
  |'update'
  |'done-all'
  |'track-changes'
  |'work-outline'
  |'badge'
  |'notifications'
  |'security'
  |'today'
  |'logo-google'
  |'shield-checkmark'
  |'engineering'
  |'cleaning-services'
  |'bolt'
  |'construction'
  |'trending-down'
  |'trending-up'
  |'place'
  |'access-time'
  |'account-balance';           // Already exists for logout button;           // Already exists for logout button

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

const Icon = ({ name, size = 24, color = '#000', style }: IconProps) => {
  const baseProps = {
    size,
    color,
    style: style as StyleProp<TextStyle>,
  };

  // MaterialIcons
  // MaterialIcons section - add these icons:
  if ([
    'home', 'list', 'chevron-right', 'error-outline',
    'admin-panel-settings', 'logout', 'refresh',
    'email-outlined', 'person-outline', 'phone-outlined',
    'lock-outline', 'lock-person-outlined',
    'arrow-back', 'add', 'visibility', 'shield', 'settings' // ADD THESE
  ].includes(name)) {
    const materialIconMap: Record<string, any> = {
      // ... existing mappings ...
      'arrow-back': 'arrow-back',
      'add': 'add',
      'visibility': 'visibility',
      'shield': 'shield',
      'settings': 'settings',
    };
    return <MaterialIcons name={materialIconMap[name]} {...baseProps} />;
  }

  // FontAwesome
  if ([
    'user', 'trash', 'lightbulb', 'alert-triangle',
    'map-pin', 'clock', 'check-circle', 'warning',
    'dashboard', 'analytics', 'report', 'person',
    'assessment', 'description'
  ].includes(name)) {
    const faIconMap: Record<string, any> = {
      'user': 'user',
      'trash': 'trash',
      'lightbulb': 'lightbulb-o',
      'alert-triangle': 'exclamation-triangle',
      'map-pin': 'map-marker',
      'clock': 'clock-o',
      'check-circle': 'check-circle',
      'warning': 'exclamation-triangle',
      'dashboard': 'dashboard',
      'analytics': 'bar-chart',
      'report': 'flag',
      'person': 'user',
      'assessment': 'bar-chart', // ADD THIS - using same as analytics
      'description': 'file-text-o',
    };
    return <FontAwesome name={faIconMap[name]} {...baseProps} />;
  }

  // MaterialCommunityIcons
  if ([
  'water',
  'water-drop',
  'road',
  'clean-hands',
  'flash-on',
  'apartment',
  'task-alt',
  'verified',
  'pending-actions',
  'build-circle',
  'analytics-outlined'
].includes(name)) {
    const mcIconMap: Record<string, any> = {
  'water': 'water',
  'water-drop': 'water',
  'road': 'road-variant',
  'clean-hands': 'hand-wash',
  'flash-on': 'flash',
  'apartment': 'office-building',
  'task-alt': 'clipboard-check',
  'verified': 'check-decagram',
  'pending-actions': 'clock-outline',
  'build-circle': 'hammer-wrench',
  'analytics-outlined': 'chart-line',
};

    return <MaterialCommunityIcons name={mcIconMap[name]} {...baseProps} />;
  }

  // Ionicons
  if (['login', 'person-add', 'map'].includes(name)) {
    const ioniconMap: Record<string, any> = {
      'login': 'log-in',
      'person-add': 'person-add',
      'map': 'map',
    };
    return <Ionicons name={ioniconMap[name]} {...baseProps} />;
  }

  // Default fallback
  return <MaterialIcons name="help-outline" {...baseProps} />;
};

export default Icon;