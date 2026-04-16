import 'dart:convert';
import 'dart:io';
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

  // ── Feature 4: Password Reset ─────────────────────────

  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    final res = await http
        .post(
          Uri.parse('$baseUrl/api/auth/forgot-password'),
          headers: _headers(),
          body: jsonEncode({'email': email}),
        )
        .timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Failed to send reset email');
  }

  static Future<void> resetPassword(
      String token, String newPassword) async {
    final res = await http
        .post(
          Uri.parse('$baseUrl/api/auth/reset-password'),
          headers: _headers(),
          body: jsonEncode({'token': token, 'new_password': newPassword}),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      throw _extractError(data, 'Password reset failed');
    }
  }

  // ── Feature 1: FCM Token ──────────────────────────────

  static Future<void> updateFcmToken(String token, String fcmToken) async {
    await http
        .post(
          Uri.parse('$baseUrl/api/users/fcm-token'),
          headers: _headers(token: token),
          body: jsonEncode({'fcm_token': fcmToken}),
        )
        .timeout(const Duration(seconds: 10));
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

  // ── Feature 2: Image Upload ───────────────────────────

  static Future<String> uploadReportImage(
      String token, int reportId, File imageFile) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/reports/$reportId/image'),
    );
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(
      await http.MultipartFile.fromPath('image', imageFile.path),
    );
    final streamed = await request.send().timeout(const Duration(seconds: 30));
    final res = await http.Response.fromStream(streamed);
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data['url'] as String;
    throw _extractError(data, 'Image upload failed');
  }

  // ── Feature 3: Report Detail + Timeline ──────────────

  static Future<Map<String, dynamic>> getReportTimeline(
      int reportId) async {
    final res = await http
        .get(Uri.parse('$baseUrl/api/reports/$reportId/timeline'))
        .timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Failed to load report details');
  }

  // ── Feature 6: Search Reports ─────────────────────────

  static Future<List<dynamic>> searchUserReports(
      String userEmail, String query) async {
    final res = await http
        .get(
          Uri.parse(
              '$baseUrl/users/reports/search?query=${Uri.encodeComponent(query)}&user_email=${Uri.encodeComponent(userEmail)}'),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return data['complaints'] as List<dynamic>? ?? [];
    }
    throw 'Search failed';
  }

  // ── Feature 8: Confirmations / Upvotes ───────────────

  static Future<Map<String, dynamic>> confirmReport(
      String token, int reportId) async {
    final res = await http
        .post(
          Uri.parse('$baseUrl/api/reports/$reportId/confirm'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 10));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Failed to confirm report');
  }

  static Future<void> unconfirmReport(String token, int reportId) async {
    final res = await http
        .delete(
          Uri.parse('$baseUrl/api/reports/$reportId/confirm'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      throw _extractError(data, 'Failed to remove confirmation');
    }
  }

  static Future<Map<String, dynamic>> getConfirmStatus(
      String token, int reportId) async {
    final res = await http
        .get(
          Uri.parse('$baseUrl/api/reports/$reportId/confirm/status'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 10));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Failed to get confirm status');
  }

  // ── Feature 9: Department Performance ────────────────

  static Future<Map<String, dynamic>> getDepartmentSummary() async {
    final res = await http
        .get(Uri.parse('$baseUrl/api/departments/summary'))
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw 'Failed to load department summary';
  }

  static Future<Map<String, dynamic>> getResolutionTrends() async {
    final res = await http
        .get(Uri.parse('$baseUrl/api/departments/resolution-trends'))
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw 'Failed to load resolution trends';
  }

  // ── Feature 7: Admin Map ──────────────────────────────

  static Future<Map<String, dynamic>> getMapIssues(
      {String? statusFilter}) async {
    final params = statusFilter != null ? '?status=$statusFilter' : '';
    final res = await http
        .get(Uri.parse('$baseUrl/api/admin/map/issues$params'))
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw 'Failed to load map issues';
  }

  // ── Super Admin: User Management ─────────────────────

  static Future<List<dynamic>> listAllUsers(String token,
      {String? roleFilter}) async {
    final params = roleFilter != null ? '?role_filter=$roleFilter' : '';
    final res = await http
        .get(
          Uri.parse('$baseUrl/api/super-admin/users$params'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) return jsonDecode(res.body) as List<dynamic>;
    throw _extractError(
        jsonDecode(res.body) as Map<String, dynamic>, 'Failed to load users');
  }

  static Future<Map<String, dynamic>> assignUserRole(
    String token,
    int userId,
    String role, {
    String? department,
  }) async {
    final res = await http
        .patch(
          Uri.parse('$baseUrl/api/super-admin/users/$userId/role'),
          headers: _headers(token: token),
          body: jsonEncode({'role': role, 'department': department}),
        )
        .timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return data;
    throw _extractError(data, 'Failed to update role');
  }

  static Future<void> deleteUser(String token, int userId) async {
    final res = await http
        .delete(
          Uri.parse('$baseUrl/api/super-admin/users/$userId'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      throw _extractError(data, 'Failed to delete user');
    }
  }

  static Future<Map<String, dynamic>> getSuperAdminStats(String token) async {
    final res = await http
        .get(
          Uri.parse('$baseUrl/api/super-admin/stats'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw 'Failed to load stats';
  }

  static Future<Map<String, dynamic>> createAdminUser({
    required String token,
    required String email,
    required String password,
    required String fullName,
    required String mobile,
    required String role,
    String? department,
  }) async {
    final params = 'role=$role${department != null ? '&department=$department' : ''}';
    final res = await http
        .post(
          Uri.parse('$baseUrl/api/super-admin/create-admin?$params'),
          headers: _headers(token: token),
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
    throw _extractError(data, 'Failed to create admin');
  }

  // ── Feature 12: Export ────────────────────────────────

  static Future<List<int>> exportCsv(String token,
      {String? statusFilter}) async {
    final params =
        statusFilter != null ? '?status_filter=$statusFilter' : '';
    final res = await http
        .get(
          Uri.parse('$baseUrl/api/admin/export/csv$params'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 30));
    if (res.statusCode == 200) return res.bodyBytes;
    throw 'Export failed';
  }

  static Future<List<int>> exportPdf(String token,
      {String? statusFilter}) async {
    final params =
        statusFilter != null ? '?status_filter=$statusFilter' : '';
    final res = await http
        .get(
          Uri.parse('$baseUrl/api/admin/export/pdf$params'),
          headers: _headers(token: token),
        )
        .timeout(const Duration(seconds: 30));
    if (res.statusCode == 200) return res.bodyBytes;
    throw 'Export failed';
  }

  // ── Existing endpoints ────────────────────────────────

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
