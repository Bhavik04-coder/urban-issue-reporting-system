import 'package:flutter/foundation.dart';
import '../core/api_service.dart';
import '../models/report_model.dart';

class ReportProvider with ChangeNotifier {
  List<ReportModel> _reports = [];
  Map<String, dynamic> _stats = {};
  bool _isLoading = false;
  String? _error;

  List<ReportModel> get reports => _reports;
  Map<String, dynamic> get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  void _setError(String? e) {
    _error = e;
    notifyListeners();
  }

  Future<bool> fetchUserReports(String token) async {
    _isLoading = true;
    _setError(null);
    notifyListeners();
    try {
      final response = await ApiService.getReports(token, all: false);
      _isLoading = false;
      if (response.isSuccess) {
        final List data = response.data;
        _reports = data.map((m) => ReportModel.fromMap(m)).toList();
        notifyListeners();
        return true;
      } else {
        _setError(response.error);
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _setError("An unexpected error occurred");
      return false;
    }
  }

  Future<bool> fetchAllReports(String token) async {
    _isLoading = true;
    _setError(null);
    notifyListeners();
    try {
      final response = await ApiService.getReports(token, all: true);
      if (response.isSuccess) {
        final List data = response.data;
        _reports = data.map((m) => ReportModel.fromMap(m)).toList();
        
        final statsResp = await ApiService.getStats(token);
        if (statsResp.isSuccess) {
          _stats = statsResp.data;
        }
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        _setError(response.error);
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _setError("An unexpected error occurred");
      return false;
    }
  }

  Future<String?> submitReport(String token, ReportModel report) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await ApiService.createReport(token, report);
      _isLoading = false;
      if (response.isSuccess) {
        final newReport = ReportModel.fromMap(response.data);
        _reports.insert(0, newReport);
        notifyListeners();
        return null;
      }
      return response.error ?? "Failed to submit report";
    } catch (e) {
      _isLoading = false;
      return "Error: $e";
    }
  }

  Future<String?> updateStatus(String token, int reportId, String status) async {
    try {
      final response = await ApiService.updateReportStatus(token, reportId, status);
      if (response.isSuccess) {
        final idx = _reports.indexWhere((r) => r.id == reportId);
        if (idx != -1) {
          _reports[idx] = _reports[idx].copyWith(
              status: status, updatedAt: DateTime.now().toIso8601String());
          notifyListeners();
        }
        return null;
      }
      return response.error ?? "Failed to update status";
    } catch (e) {
      return "Error: $e";
    }
  }

  Future<String?> deleteReport(String token, int reportId) async {
    try {
      final response = await ApiService.deleteReport(token, reportId);
      if (response.isSuccess) {
        _reports.removeWhere((r) => r.id == reportId);
        notifyListeners();
        return null;
      }
      return response.error ?? "Failed to delete report";
    } catch (e) {
      return "Error: $e";
    }
  }
}
