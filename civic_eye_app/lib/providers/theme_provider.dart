import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider with ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.dark;
  bool _isLoading = true;

  ThemeMode get themeMode => _themeMode;
  bool get isLoading => _isLoading;
  bool get isDarkMode => _themeMode == ThemeMode.dark;

  ThemeProvider() {
    _loadThemeMode();
  }

  Future<void> _loadThemeMode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedMode = prefs.getString('theme_mode') ?? 'dark';
      _themeMode = savedMode == 'light' ? ThemeMode.light : ThemeMode.dark;
    } catch (e) {
      _themeMode = ThemeMode.dark;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleTheme() async {
    _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
    
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('theme_mode', _themeMode == ThemeMode.dark ? 'dark' : 'light');
    } catch (e) {
      debugPrint('Failed to save theme mode: $e');
    }
  }

  // Alias for convenience
  Future<void> toggle() => toggleTheme();

  Future<void> setThemeMode(ThemeMode mode) async {
    if (_themeMode == mode) return;
    _themeMode = mode;
    notifyListeners();
    
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('theme_mode', mode == ThemeMode.dark ? 'dark' : 'light');
    } catch (e) {
      debugPrint('Failed to save theme mode: $e');
    }
  }
}
