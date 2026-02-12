// components/HoverButton.tsx - FIXED VERSION
import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';
import Icon from './icon';
import type { IconName } from './icon';

interface HoverButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  style?: ViewStyle;
  icon?: IconName;
  children?: React.ReactNode;
}

const HoverButton = ({ 
  title, 
  onPress, 
  loading = false, 
  style, 
  icon,
  children 
}: HoverButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={loading}
    >
      <Animated.View
        style={[
          styles.button,
          style,
          {
            transform: [{ scale: scaleAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isPressed ? 2 : 5 },
            shadowOpacity: isPressed ? 0.2 : 0.3,
            shadowRadius: isPressed ? 3 : 8,
            elevation: isPressed ? 3 : 8,
          },
        ]}
      >
        {children ? children : (
          <View style={styles.buttonContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Animated.View style={styles.spinner} />
              </View>
            ) : (
              <>
                {icon && <Icon name={icon} size={20} color="#FFFFFF" style={styles.icon} />}
                <Text style={styles.buttonText}>{title}</Text>
              </>
            )}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4361EE',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  icon: {
    marginRight: 8,
  },
  loadingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
  },
});

export default HoverButton;