class ApiConfig {
  static const String baseUrl = 'http://localhost:8000/api';
  
  // Auth endpoints
  static const String login = '$baseUrl/login';
  static const String register = '$baseUrl/users/register';
  
  // User endpoints
  static const String userReports = '$baseUrl/users/reports/filtered';
  static const String userReportsSearch = '$baseUrl/users/reports/search';
  static const String userStats = '$baseUrl/users/stats';
  
  // Admin endpoints
  static const String adminDashboardStats = '$baseUrl/admin/dashboard/stats';
  static const String adminMonthlyTrends = '$baseUrl/admin/dashboard/monthly-trends';
  static const String adminDepartmentPerformance = '$baseUrl/admin/dashboard/department-performance';
  static const String adminRecentReports = '$baseUrl/admin/dashboard/recent-reports';
  
  // Report endpoints
  static const String createReport = '$baseUrl/reports';
  static String reportTimeline(int id) => '$baseUrl/reports/$id/timeline';
}
