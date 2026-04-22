class NotificationModel {
  final int id;
  final int? reportId;
  final String title;
  final String message;
  final String type; // info | status_change | priority_change | resolved | urgent
  final bool isRead;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    this.reportId,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromApi(Map<String, dynamic> m) {
    return NotificationModel(
      id: m['id'] as int,
      reportId: m['report_id'] as int?,
      title: (m['title'] ?? '') as String,
      message: (m['message'] ?? '') as String,
      type: (m['type'] ?? 'info') as String,
      isRead: (m['is_read'] ?? false) as bool,
      createdAt: m['created_at'] != null
          ? DateTime.tryParse(m['created_at'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  NotificationModel copyWith({bool? isRead}) => NotificationModel(
        id: id,
        reportId: reportId,
        title: title,
        message: message,
        type: type,
        isRead: isRead ?? this.isRead,
        createdAt: createdAt,
      );
}
