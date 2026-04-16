import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_service.dart';
import '../models/user_model.dart';

class AuthProvider with ChangeNotifier {
  bool _isLoading = false;
  String? _token;
  UserModel? _user;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _token != null;
  String? get token => _token;
  UserModel? get user => _user;
  bool get isAdmin => _user?.isAdmin ?? false;

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    if (_token != null) {
      final response = await ApiService.getProfile(_token!);
      if (response.isSuccess) {
        final userData = response.data;
        _user = UserModel(
          id: userData['id'],
          email: userData['email'],
          passwordHash: "",
          fullName: userData['full_name'],
          mobile: userData['mobile_number'] ?? "",
          isAdmin: userData['is_admin'] ?? false,
          createdAt: userData['created_at'] ?? DateTime.now().toIso8601String(),
        );
      } else {
        // Token might be expired or server unreachable
        if (response.isUnauthorized) {
          _token = null;
          await prefs.remove('token');
        }
      }
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.login(email, password);

      if (!response.isSuccess) {
        _isLoading = false;
        notifyListeners();
        return response.error ?? "Login failed";
      }

      final data = response.data;
      _token = data['access_token'];
      final userData = data['user'];
      
      _user = UserModel(
        id: userData['id'],
        email: userData['email'],
        passwordHash: "",
        fullName: userData['full_name'],
        mobile: userData['mobile_number'] ?? "",
        isAdmin: userData['is_admin'] ?? false,
        createdAt: userData['created_at'] ?? DateTime.now().toIso8601String(),
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);

      _isLoading = false;
      notifyListeners();
      return null;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return "Error: $e";
    }
  }

  Future<String?> register({
    required String email,
    required String password,
    required String fullName,
    required String mobile,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await ApiService.register(email, password, fullName, mobile);
      _isLoading = false;
      notifyListeners();
      if (!response.isSuccess) return response.error ?? "Registration failed";
      return null;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return "Error: $e";
    }
  }

  Future<String?> updateProfile({required String fullName, required String mobile}) async {
    if (_token == null) return "Not authenticated";
    _isLoading = true;
    notifyListeners();

    final response = await ApiService.updateProfile(_token!, fullName, mobile);
    _isLoading = false;
    
    if (response.isSuccess) {
      final userData = response.data;
      _user = _user?.copyWith(
        fullName: userData['full_name'],
        mobile: userData['mobile_number'],
      );
      notifyListeners();
      return null;
    } else {
      if (response.isUnauthorized) logout();
      notifyListeners();
      return response.error ?? "Update failed";
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }
}
