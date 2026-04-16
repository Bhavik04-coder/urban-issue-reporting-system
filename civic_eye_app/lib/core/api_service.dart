import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/report_model.dart';

class ApiResponse {
  final int statusCode;
  final dynamic data;
  final String? error;

  ApiResponse({required this.statusCode, this.data, this.error});

  bool get isSuccess => statusCode >= 200 && statusCode < 300;
  bool get isUnauthorized => statusCode == 401;
}

class ApiService {
  static const String baseUrl = "http://10.0.2.2:8000";
  static const Duration timeoutDuration = Duration(seconds: 10);

  static Map<String, String> _headers(String? token) {
    return {
      "Content-Type": "application/json",
      if (token != null) "Authorization": "Bearer $token",
    };
  }

  static Future<ApiResponse> _handleRequest(Future<http.Response> request) async {
    try {
      final response = await request.timeout(timeoutDuration);
      final body = response.body.isNotEmpty ? jsonDecode(response.body) : null;
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return ApiResponse(statusCode: response.statusCode, data: body);
      } else {
        String errorMsg = "Something went wrong";
        if (body is Map && body.containsKey('detail')) {
          errorMsg = body['detail'].toString();
        }
        return ApiResponse(statusCode: response.statusCode, error: errorMsg);
      }
    } on SocketException {
      return ApiResponse(statusCode: 503, error: "Unable to connect to server. Please check your internet.");
    } on TimeoutException {
      return ApiResponse(statusCode: 408, error: "Request timed out. Please try again.");
    } catch (e) {
      return ApiResponse(statusCode: 500, error: "An unexpected error occurred: $e");
    }
  }

  static Future<ApiResponse> login(String email, String password) async {
    return _handleRequest(http.post(
      Uri.parse('$baseUrl/api/login'),
      headers: _headers(null),
      body: jsonEncode({"email": email, "password": password}),
    ));
  }

  static Future<ApiResponse> register(
      String email, String password, String name, String mobile) async {
    return _handleRequest(http.post(
      Uri.parse('$baseUrl/api/users/register'),
      headers: _headers(null),
      body: jsonEncode({
        "email": email,
        "password": password,
        "full_name": name,
        "mobile_number": mobile,
        "is_admin": false
      }),
    ));
  }

  static Future<ApiResponse> getProfile(String token) async {
    return _handleRequest(http.get(
      Uri.parse('$baseUrl/api/users/me'),
      headers: _headers(token),
    ));
  }

  static Future<ApiResponse> updateProfile(String token, String fullName, String mobile) async {
    return _handleRequest(http.patch(
      Uri.parse('$baseUrl/api/users/me'),
      headers: _headers(token),
      body: jsonEncode({
        "full_name": fullName,
        "mobile_number": mobile,
      }),
    ));
  }

  static Future<ApiResponse> getReports(String token, {bool all = false}) async {
    final endpoint = all ? '/api/reports/all' : '/api/reports/';
    return _handleRequest(http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers(token),
    ));
  }

  static Future<ApiResponse> createReport(String token, ReportModel report) async {
    return _handleRequest(http.post(
      Uri.parse('$baseUrl/api/reports/'),
      headers: _headers(token),
      body: jsonEncode({
        "title": report.title,
        "description": report.description,
        "category": report.category,
        "urgency_level": report.urgency,
        "department": report.department,
        "location_address": report.locationAddress,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "image_path": report.imagePath,
      }),
    ));
  }

  static Future<ApiResponse> updateReportStatus(String token, int reportId, String status) async {
    return _handleRequest(http.patch(
      Uri.parse('$baseUrl/api/reports/$reportId/status'),
      headers: _headers(token),
      body: jsonEncode({"status": status}),
    ));
  }

  static Future<ApiResponse> getStats(String token) async {
    return _handleRequest(http.get(
      Uri.parse('$baseUrl/api/reports/stats'),
      headers: _headers(token),
    ));
  }

  static Future<ApiResponse> deleteReport(String token, int reportId) async {
    return _handleRequest(http.delete(
      Uri.parse('$baseUrl/api/reports/$reportId'),
      headers: _headers(token),
    ));
  }
}
