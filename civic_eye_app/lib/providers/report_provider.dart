import 'package:flutter/foundation.dart';
import '../core/api_service.dart';
import '../models/report_model.dart';

class ReportProvider with ChangeNotifier {
  List<ReportModel> _reports = [];
  Map<String, int> _stats = {};
  bool _isLoading = false;
  String? _error;

  List<ReportModel> get reports => _reports;
  Map<String, int> get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // ── User reports (server-side filtered by JWT identity) ──────────────────

  Future<void> loadUserReports(String userEmail, {String? token}) async {
    if (token == null) return;
    _setLoading(true);
    try {
      final raw = await ApiService.getUserReports(token);
      _reports = raw
          .map((e) => ReportModel.fromApi(e as Map<String, dynamic>))
          .toList();
      _stats = _calcStats(_reports);
      _error = null;
    } catch (e) {
      debugPrint('loadUserReports error: $e');
      _error = e.toString();
      _reports = [];
      _stats = {};
    }
    _setLoading(false);
  }

  // ── Admin: all reports ───────────────────────────────────────────────────

  Future<void> loadAllReports({String? token}) async {
    _setLoading(true);
    try {
      final raw = await ApiService.getAllReports(token: token);
      _reports = raw
          .map((e) => ReportModel.fromApi(e as Map<String, dynamic>))
          .toList();
      _stats = _calcStats(_reports);
      _error = null;
    } catch (e) {
      debugPrint('loadAllReports error: $e');
      _error = e.toString();
      _reports = [];
      _stats = {};
    }
    _setLoading(false);
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  Future<String?> submitReport({
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
    try {
      await ApiService.submitReport(
        token: token,
        userName: userName,
        userMobile: userMobile,
        userEmail: userEmail,
        title: title,
        description: description,
        category: category,
        urgency: urgency,
        locationAddress: locationAddress,
        locationLat: locationLat,
        locationLong: locationLong,
      );
      // Refresh user reports after submit
      await loadUserReports(userEmail, token: token);
      return null; // success
    } catch (e) {
      debugPrint('submitReport error: $e');
      return e.toString();
    }
  }

  // ── Admin actions ────────────────────────────────────────────────────────

  Future<String?> updateStatus(
      int reportId, String newStatus, String token) async {
    try {
      await ApiService.updateReportStatus(reportId, newStatus, token);
      final idx = _reports.indexWhere((r) => r.id == reportId);
      if (idx != -1) {
        _reports[idx] = _reports[idx].copyWith(
            status: newStatus, updatedAt: DateTime.now().toIso8601String());
        _stats = _calcStats(_reports);
        notifyListeners();
      }
      return null;
    } catch (e) {
      debugPrint('updateStatus error: $e');
      return e.toString();
    }
  }

  Future<String?> deleteReport(int reportId, String token) async {
    try {
      await ApiService.deleteReport(reportId, token);
      _reports.removeWhere((r) => r.id == reportId);
      _stats = _calcStats(_reports);
      notifyListeners();
      return null;
    } catch (e) {
      debugPrint('deleteReport error: $e');
      return e.toString();
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  void _setLoading(bool v) {
    _isLoading = v;
    notifyListeners();
  }

  Map<String, int> _calcStats(List<ReportModel> reports) {
    return {
      'total': reports.length,
      'resolved': reports.where((r) => r.status == 'Resolved').length,
      'pending': reports
          .where((r) => r.status == 'Reported' || r.status == 'Pending')
          .length,
      'inProgress': reports.where((r) => r.status == 'In Progress').length,
    };
  }
}
