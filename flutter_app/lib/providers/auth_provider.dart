import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';

class AuthProvider with ChangeNotifier {
  String? _token;
  String? _userEmail;
  bool _isAdmin = false;
  bool _isLoading = true;

  String? get token => _token;
  String? get userEmail => _userEmail;
  bool get isAdmin => _isAdmin;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _loadAuthData();
  }

  Future<void> _loadAuthData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('access_token');
      _userEmail = prefs.getString('user_email');
      _isAdmin = prefs.getBool('is_admin') ?? false;
    } catch (e) {
      debugPrint('Failed to load auth data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.login),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _saveAuthData(
          data['access_token'],
          email,
          data['is_admin'] ?? false,
        );
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Login error: $e');
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
    required String mobileNumber,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.register),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'full_name': fullName,
          'mobile_number': mobileNumber,
          'is_admin': false,
        }),
      );

      if (response.statusCode == 200) {
        return await login(email, password);
      }
      return false;
    } catch (e) {
      debugPrint('Registration error: $e');
      return false;
    }
  }

  Future<void> _saveAuthData(String token, String email, bool isAdmin) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
    await prefs.setString('user_email', email);
    await prefs.setBool('is_admin', isAdmin);

    _token = token;
    _userEmail = email;
    _isAdmin = isAdmin;
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('user_email');
    await prefs.remove('is_admin');

    _token = null;
    _userEmail = null;
    _isAdmin = false;
    notifyListeners();
  }
}
