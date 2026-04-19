import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ══════════════════════════════════════════════════════════════════════════
  // Indian Flag Inspired Colors
  // ══════════════════════════════════════════════════════════════════════════
  
  // Saffron (भगवा) - Courage & Sacrifice
  static const saffron = Color(0xFFFF9933);
  static const saffronDark = Color(0xFFE67300);
  static const saffronLight = Color(0xFFFFB366);
  
  // White (सफ़ेद) - Peace & Truth
  static const white = Color(0xFFFFFFFF);
  static const whiteOff = Color(0xFFF8F9FA);
  
  // Green (हरा) - Growth & Prosperity
  static const green = Color(0xFF138808);
  static const greenDark = Color(0xFF0D5E06);
  static const greenLight = Color(0xFF19A80D);
  
  // Ashoka Chakra Blue (नीला) - Justice & Progress
  static const blue = Color(0xFF000080);
  static const blueDark = Color(0xFF000066);
  static const blueLight = Color(0xFF0000B3);

  // ══════════════════════════════════════════════════════════════════════════
  // Theme Mode Colors
  // ══════════════════════════════════════════════════════════════════════════
  
  // Dark Mode
  static const bgDark = Color(0xFF0D0D1A);
  static const surfaceDark = Color(0xFF1A1A2E);
  static const surfaceCardDark = Color(0xFF16213E);
  static const surfaceLightDark = Color(0xFF0F3460);
  static const textPrimaryDark = Color(0xFFEEEEEE);
  static const textSecondaryDark = Color(0xFF94A3B8);
  
  // Light Mode
  static const bgLight = Color(0xFFFAFAFA);
  static const surfaceLight = Color(0xFFFFFFFF);
  static const surfaceCardLight = Color(0xFFFFFFFF);
  static const surfaceLightLight = Color(0xFFF5F5F5);
  static const textPrimaryLight = Color(0xFF1A1A2E);
  static const textSecondaryLight = Color(0xFF64748B);

  // ══════════════════════════════════════════════════════════════════════════
  // Backward Compatibility Aliases (for existing code)
  // ══════════════════════════════════════════════════════════════════════════
  
  static const surface = surfaceDark;
  static const surfaceCard = surfaceCardDark;
  static const textPrimary = textPrimaryDark;
  static const textSecondary = textSecondaryDark;

  // ══════════════════════════════════════════════════════════════════════════
  // Semantic Colors (work in both themes)
  // ══════════════════════════════════════════════════════════════════════════
  
  // Primary actions - Saffron
  static const primary = saffron;
  static const primaryDark = saffronDark;
  
  // Success/Secondary - Green
  static const secondary = green;
  static const secondaryLight = greenLight;
  
  // Info/Accent - Blue
  static const accent = blue;
  static const accentLight = blueLight;
  
  // Warning - Orange (lighter saffron)
  static const warning = Color(0xFFFFB347);
  
  // Error - Red
  static const error = Color(0xFFEF5350);

  // Status colors
  static const statusPending = warning;
  static const statusInProgress = blueLight;
  static const statusResolved = greenLight;
  static const statusRejected = error;

  // Department colors
  static const deptRoad = saffron;
  static const deptWater = blueLight;
  static const deptElec = Color(0xFFFFD54F);
  static const deptSanit = greenLight;

  // ══════════════════════════════════════════════════════════════════════════
  // Dark Theme
  // ══════════════════════════════════════════════════════════════════════════
  
  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      colorScheme: const ColorScheme.dark(
        primary: saffron,
        secondary: green,
        tertiary: blue,
        surface: surfaceCardDark,
        error: error,
        onPrimary: white,
        onSecondary: white,
        onSurface: textPrimaryDark,
      ),
      textTheme: GoogleFonts.poppinsTextTheme(ThemeData.dark().textTheme),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimaryDark,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
        iconTheme: IconThemeData(color: textPrimaryDark),
      ),
      cardTheme: CardThemeData(
        color: surfaceCardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceCardDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF2A2A4A)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF2A2A4A)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: saffron, width: 2),
        ),
        labelStyle: const TextStyle(color: textSecondaryDark),
        hintStyle: const TextStyle(color: Color(0xFF4A4A6A)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: saffron,
          foregroundColor: white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: saffron,
        foregroundColor: white,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surfaceCardDark,
        indicatorColor: saffron.withAlpha(50),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
                color: saffron, fontSize: 12, fontWeight: FontWeight.w600);
          }
          return const TextStyle(color: textSecondaryDark, fontSize: 12);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: saffron);
          }
          return const IconThemeData(color: textSecondaryDark);
        }),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Light Theme
  // ══════════════════════════════════════════════════════════════════════════
  
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: bgLight,
      colorScheme: const ColorScheme.light(
        primary: saffron,
        secondary: green,
        tertiary: blue,
        surface: surfaceCardLight,
        error: error,
        onPrimary: white,
        onSecondary: white,
        onSurface: textPrimaryLight,
      ),
      textTheme: GoogleFonts.poppinsTextTheme(ThemeData.light().textTheme),
      appBarTheme: const AppBarTheme(
        backgroundColor: white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimaryLight,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
        iconTheme: IconThemeData(color: textPrimaryLight),
      ),
      cardTheme: CardThemeData(
        color: surfaceCardLight,
        elevation: 2,
        shadowColor: Colors.black.withAlpha(10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceCardLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: saffron, width: 2),
        ),
        labelStyle: const TextStyle(color: textSecondaryLight),
        hintStyle: const TextStyle(color: Color(0xFFADB5BD)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: saffron,
          foregroundColor: white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: saffron,
        foregroundColor: white,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: white,
        indicatorColor: saffron.withAlpha(30),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
                color: saffron, fontSize: 12, fontWeight: FontWeight.w600);
          }
          return const TextStyle(color: textSecondaryLight, fontSize: 12);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: saffron);
          }
          return const IconThemeData(color: textSecondaryLight);
        }),
      ),
    );
  }
}
