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

  // Role helpers
  bool get isAdmin => _user?.isAnyAdmin ?? false;
  bool get isSuperAdmin => _user?.isSuperAdmin ?? false;
  bool get isDeptAdmin => _user?.isDeptAdmin ?? false;
  String? get adminDepartment => _user?.department;

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
      // Fetch full profile (includes role + department)
      final profile = await ApiService.getMe(_token!);
      _user = UserModel.fromApi(profile);
      // Patch role/department from login response if profile doesn't have it
      if (data['role'] != null) {
        _user = _user!.copyWith(
          role: data['role'] as String?,
          department: data['department'] as String?,
          isAdmin: data['is_admin'] as bool?,
        );
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
      final data = await ApiService.updateProfile(_token!, fullName, mobile);
      _user = UserModel.fromApi(data);
      notifyListeners();
    } catch (e) {
      debugPrint('Update profile error: $e');
    }
  }
}
