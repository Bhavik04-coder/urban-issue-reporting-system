// components/GlassCard.tsx - Pure React Native version
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  opacity?: number;
  blurAmount?: number;
}

const GlassCard = ({ 
  children, 
  style, 
  opacity = 0.15,
  blurAmount = 10 
}: GlassCardProps) => {
  return (
    <View style={[styles.container, style]}>
      {/* Glass effect overlay */}
      <View style={[
        StyleSheet.absoluteFill,
        { 
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
          borderRadius: 20,
        }
      ]} />
      
      {/* Inner glow effect */}
      <View style={styles.innerGlow} />
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassCard;