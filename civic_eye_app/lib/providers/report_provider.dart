import 'package:flutter/foundation.dart';
import '../core/database_helper.dart';
import '../models/report_model.dart';

class ReportProvider with ChangeNotifier {
  List<ReportModel> _reports = [];
  Map<String, int> _stats = {};
  bool _isLoading = false;

  List<ReportModel> get reports => _reports;
  Map<String, int> get stats => _stats;
  bool get isLoading => _isLoading;

  Future<void> loadUserReports(int userId) async {
    _isLoading = true;
    notifyListeners();
    _reports = await DatabaseHelper.instance.getReportsByUser(userId);
    _stats = await DatabaseHelper.instance.getUserStats(userId);
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadAllReports() async {
    _isLoading = true;
    notifyListeners();
    _reports = await DatabaseHelper.instance.getAllReports();
    _stats = await DatabaseHelper.instance.getAdminStats();
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> submitReport(ReportModel report) async {
    try {
      final id = await DatabaseHelper.instance.insertReport(report);
      await DatabaseHelper.instance.logActivity(
          id, report.userId, 'report_created', 'New report: ${report.title}');
      _reports.insert(0, report.copyWith());
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> updateStatus(int reportId, String status, int adminId) async {
    await DatabaseHelper.instance.updateReportStatus(reportId, status);
    await DatabaseHelper.instance.logActivity(
        reportId, adminId, 'status_updated', 'Status changed to $status');
    final idx = _reports.indexWhere((r) => r.id == reportId);
    if (idx != -1) {
      _reports[idx] = _reports[idx].copyWith(
          status: status, updatedAt: DateTime.now().toIso8601String());
      notifyListeners();
    }
  }

  Future<void> deleteReport(int reportId) async {
    await DatabaseHelper.instance.deleteReport(reportId);
    _reports.removeWhere((r) => r.id == reportId);
    notifyListeners();
  }
}
