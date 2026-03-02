class Report {
  final int id;
  final String complaintId;
  final String title;
  final String category;
  final String status;
  final String locationAddress;
  final String? urgencyLevel;
  final String? department;
  final String? date;
  final String? submittedOn;
  final String? description;

  Report({
    required this.id,
    required this.complaintId,
    required this.title,
    required this.category,
    required this.status,
    required this.locationAddress,
    this.urgencyLevel,
    this.department,
    this.date,
    this.submittedOn,
    this.description,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      id: json['id'] ?? 0,
      complaintId: json['complaint_id'] ?? '',
      title: json['title'] ?? '',
      category: json['category'] ?? '',
      status: json['status'] ?? '',
      locationAddress: json['location_address'] ?? '',
      urgencyLevel: json['urgency_level'],
      department: json['department'],
      date: json['date'],
      submittedOn: json['submitted_on'],
      description: json['description'],
    );
  }
}

class TimelineEvent {
  final String step;
  final String date;
  final bool completed;
  final String? description;

  TimelineEvent({
    required this.step,
    required this.date,
    required this.completed,
    this.description,
  });

  factory TimelineEvent.fromJson(Map<String, dynamic> json) {
    return TimelineEvent(
      step: json['event']?.toString().toLowerCase().replaceAll(' ', '_') ?? '',
      date: json['timestamp'] ?? '',
      completed: json['status'] == 'completed',
      description: json['description'],
    );
  }
}

class UserStats {
  final int todayReports;
  final int weekReports;
  final int totalReports;
  final int resolvedReports;

  UserStats({
    required this.todayReports,
    required this.weekReports,
    required this.totalReports,
    required this.resolvedReports,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      todayReports: json['today_reports'] ?? 0,
      weekReports: json['week_reports'] ?? 0,
      totalReports: json['total_reports'] ?? 0,
      resolvedReports: json['resolved_reports'] ?? 0,
    );
  }
}
