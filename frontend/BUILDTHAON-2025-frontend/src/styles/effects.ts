// styles/effects.ts
import { StyleSheet } from 'react-native';

export const effects = StyleSheet.create({
  glassEffect: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    // Note: backdrop-filter is not supported in React Native
    // You can use a blur effect from react-native-blur instead
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  glowEffect: {
    shadowColor: 'rgba(245, 241, 232, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  
  icon3D: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  hoverLift: {
    // React Native doesn't support hover effects
    // You can use TouchableOpacity with onPressIn/onPressOut instead
  }
});

// For iOS blur effect, you'll need to install and use react-native-blur

// styles/effects.ts
export const getGlassEffect = (opacity = 0.15, blurAmount = 10) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
});

export const getGlowEffect = (color = 'rgba(245, 241, 232, 0.5)', size = 10) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: size,
  elevation: size / 2,
});

export const getIcon3DEffect = () => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 4,
});