import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use localhost for web/desktop. For Android emulator use 10.0.2.2:8000
  static const String baseUrl = 'http://localhost:8000';

  static Map<String, String> _headers({String? token}) {
    final h = <String, String>{'Content-Type': 'application/json'};
    if (token != null) h['Authorization'] = 'Bearer $token';
    return h;
  }

  // ── Auth ──────────────────────────────────────────────

  static Future<Map<String, dynamic>> login(
      String email, String password) async {
    final res = await http
        .post(
          Uri.parse('$baseUrl/api/login'),
          headers: _headers(),
          body: jsonEncode({'email': email, 'password': password}),
        )
        .timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Login failed');
  }

  static Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullName,
    required String mobile,
  }) async {
    final res = await http
        .post(
          Uri.parse('$baseUrl/api/users/register'),
          headers: _headers(),
          body: jsonEncode({
            'email': email,
            'password': password,
            'full_name': fullName,
            'mobile_number': mobile,
            'is_admin': false,
          }),
        )
        .timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Registration failed');
  }

  static Future<Map<String, dynamic>> getMe(String token) async {
    final res = await http
        .get(
          Uri.parse('$baseUrl/api/users/me'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Failed to fetch profile');
  }

  static Future<Map<String, dynamic>> updateProfile(
      String token, String fullName, String mobile) async {
    final res = await http
        .put(
          Uri.parse('$baseUrl/api/users/me'),
          headers: _headers(token: token),
          body: jsonEncode({'full_name': fullName, 'mobile_number': mobile}),
        )
        .timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Update failed');
  }

  // ── Reports ───────────────────────────────────────────

  static Future<Map<String, dynamic>> submitReport({
    required String token,
    required String userName,
    required String userMobile,
    required String userEmail,
    required String title,
    required String description,
    required String category,
    required String urgency,
    String? locationAddress,
    double locationLat = 0.0,
    double locationLong = 0.0,
  }) async {
    final res = await http
        .post(
          Uri.parse('$baseUrl/api/reports/'),
          headers: _headers(token: token),
          body: jsonEncode({
            'user_name': userName,
            'user_mobile': userMobile,
            'user_email': userEmail,
            'title': title,
            'description': description,
            'urgency_level': urgency,
            'location_lat': locationLat,
            'location_long': locationLong,
            'location_address': locationAddress ?? '',
            'department': _categoryToDept(category),
            'auto_assigned': true,
          }),
        )
        .timeout(const Duration(seconds: 20));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Failed to submit report');
  }

  /// Fetches reports for the currently authenticated user via the dedicated
  /// backend endpoint (filters server-side by user email from JWT).
  static Future<List<dynamic>> getUserReports(String token,
      {String filter = 'all'}) async {
    final res = await http
        .get(
          Uri.parse(
              '$baseUrl/api/users/reports/filtered?status_filter=$filter'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return data['complaints'] as List<dynamic>? ?? [];
    }
    throw 'Failed to load your reports';
  }

  /// Fetches all reports (admin use).
  static Future<List<dynamic>> getAllReports({String? token}) async {
    final res = await http
        .get(
          Uri.parse('$baseUrl/reports/'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) return jsonDecode(res.body) as List<dynamic>;
    throw 'Failed to load reports';
  }

  static Future<void> updateReportStatus(
      int reportId, String newStatus, String token) async {
    final res = await http
        .put(
          Uri.parse(
              '$baseUrl/reports/$reportId?new_status=${Uri.encodeComponent(newStatus)}'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      throw _extractError(data, 'Failed to update status');
    }
  }

  static Future<void> deleteReport(int reportId, String token) async {
    final res = await http
        .delete(
          Uri.parse('$baseUrl/reports/$reportId'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      throw _extractError(data, 'Failed to delete report');
    }
  }

  static Future<Map<String, dynamic>> getDashboardStats() async {
    final res = await http
        .get(Uri.parse('$baseUrl/dashboard/stats'))
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw 'Failed to load stats';
  }

  // ── Helpers ───────────────────────────────────────────

  static String _extractError(Map<String, dynamic> data, String fallback) {
    final detail = data['detail'];
    if (detail == null) return fallback;
    if (detail is String) return detail;
    if (detail is List && detail.isNotEmpty) {
      final first = detail.first;
      if (first is Map && first['msg'] != null) return first['msg'] as String;
    }
    return fallback;
  }

  static String _categoryToDept(String category) {
    switch (category) {
      case 'Water Supply':
        return 'water_dept';
      case 'Road Maintenance':
        return 'road_dept';
      case 'Sanitation':
        return 'sanitation_dept';
      case 'Electricity':
        return 'electricity_dept';
      case 'Public Works':
        return 'road_dept';
      default:
        return 'other';
    }
  }
}
