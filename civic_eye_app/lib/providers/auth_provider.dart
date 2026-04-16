import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_service.dart';
import '../models/user_model.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = true;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _user != null;
  bool get isAdmin => _user?.isAdmin ?? false;

  AuthProvider() {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedToken = prefs.getString('auth_token');
      if (savedToken != null) {
        final data = await ApiService.getMe(savedToken);
        _user = UserModel.fromApi(data);
        _token = savedToken;
      }
    } catch (e) {
      // Token expired or invalid — clear it
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      debugPrint('Session restore error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> login(String email, String password) async {
    try {
      final data = await ApiService.login(email.trim(), password);
      _token = data['access_token'];
      // Fetch full profile
      final profile = await ApiService.getMe(_token!);
      _user = UserModel.fromApi(profile);
      // Also patch isAdmin from login response if profile doesn't have it
      if (data['is_admin'] != null) {
        _user = _user!.copyWith(isAdmin: data['is_admin'] as bool);
      }
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);
      notifyListeners();
      return null;
    } catch (e) {
      debugPrint('Login error: $e');
      if (e is String) return e;
      return 'Login failed. Please try again.';
    }
  }

  Future<String?> register({
    required String email,
    required String password,
    required String fullName,
    required String mobile,
  }) async {
    try {
      await ApiService.register(
        email: email.trim(),
        password: password,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
      );
      // Auto-login after registration
      return await login(email, password);
    } catch (e) {
      debugPrint('Register error: $e');
      if (e is String) return e;
      return 'Registration failed. Try again.';
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    notifyListeners();
  }

  Future<void> updateProfile(
      {required String fullName, required String mobile}) async {
    if (_user == null || _token == null) return;
    try {
      final data =
          await ApiService.updateProfile(_token!, fullName, mobile);
      _user = UserModel.fromApi(data);
      notifyListeners();
    } catch (e) {
      debugPrint('Update profile error: $e');
    }
  }
}
