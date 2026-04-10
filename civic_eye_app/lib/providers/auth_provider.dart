import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/database_helper.dart';
import '../models/user_model.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  bool _isLoading = true;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _user != null;
  bool get isAdmin => _user?.isAdmin ?? false;

  AuthProvider() {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    try {
      // Ensure DB is ready before any query
      await DatabaseHelper.instance.database;
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('user_id');
      if (userId != null) {
        _user = await DatabaseHelper.instance.getUserById(userId);
      }
    } catch (e) {
      debugPrint('Session restore error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> login(String email, String password) async {
    try {
      final user = await DatabaseHelper.instance.getUserByEmail(email.trim());
      if (user == null) return 'No account found with this email';
      if (user.passwordHash != password) return 'Incorrect password';
      _user = user;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('user_id', user.id!);
      notifyListeners();
      return null;
    } catch (e) {
      debugPrint('Login error: $e');
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
      final existing =
          await DatabaseHelper.instance.getUserByEmail(email.trim());
      if (existing != null) return 'Email already registered';
      final user = UserModel(
        email: email.trim(),
        passwordHash: password,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        createdAt: DateTime.now().toIso8601String(),
      );
      final id = await DatabaseHelper.instance.insertUser(user);
      _user = user.copyWith(id: id);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('user_id', id);
      notifyListeners();
      return null;
    } catch (e) {
      debugPrint('Register error: $e');
      return 'Registration failed. Try again.';
    }
  }

  Future<void> logout() async {
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_id');
    notifyListeners();
  }

  Future<void> updateProfile(
      {required String fullName, required String mobile}) async {
    if (_user == null) return;
    final updated = _user!.copyWith(fullName: fullName, mobile: mobile);
    await DatabaseHelper.instance.updateUser(updated);
    _user = updated;
    notifyListeners();
  }
}
