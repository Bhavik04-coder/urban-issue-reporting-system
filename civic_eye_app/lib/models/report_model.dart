class ReportModel {
  final int? id;
  final String title;
  final String description;
  final String category;
  final String urgency;
  final String status;
  final String? department;
  final String? locationAddress;
  final double? latitude;
  final double? longitude;
  final String? imagePath;
  final String? aiLabel;
  final double? aiConfidence;
  final String createdAt;
  final String updatedAt;
  // For display — populated from API response
  final String? userName;
  final String? userMobile;
  final String? userEmail;

  ReportModel({
    this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.urgency,
    this.status = 'Reported',
    this.department,
    this.locationAddress,
    this.latitude,
    this.longitude,
    this.imagePath,
    this.aiLabel,
    this.aiConfidence,
    required this.createdAt,
    required this.updatedAt,
    this.userName,
    this.userMobile,
    this.userEmail,
  });

  factory ReportModel.fromApi(Map<String, dynamic> m) {
    // urgency_level is the canonical field; fall back to urgency
    final urgency = (m['urgency_level'] ?? m['urgency'] ?? 'Medium') as String;

    // status string
    final status = (m['status'] ?? 'Reported') as String;

    // The /api/users/reports/filtered endpoint returns a 'category' string
    // directly (e.g. "General", "Road Maintenance").
    // The /reports/ (admin) endpoint returns a 'department' field.
    // Prefer explicit category, fall back to department mapping.
    final String category;
    if (m['category'] != null && m['category'] != 'General') {
      category = m['category'] as String;
    } else {
      final dept = (m['department'] ?? 'other') as String;
      category = _deptToCategory(dept);
    }

    final dept = (m['department'] ?? 'other') as String;

    // created_at may be an ISO string or a formatted date string like "16 Apr. 10:30 AM"
    final rawCreated = m['created_at'] ?? m['date'] ?? DateTime.now().toIso8601String();
    final rawUpdated = m['updated_at'] ?? rawCreated;

    return ReportModel(
      id: m['id'] as int?,
      title: (m['title'] ?? '') as String,
      description: (m['description'] ?? '') as String,
      category: category,
      urgency: urgency,
      status: status,
      department: dept,
      locationAddress: m['location_address'] as String?,
      latitude: (m['location_lat'] as num?)?.toDouble(),
      longitude: (m['location_long'] as num?)?.toDouble(),
      aiLabel: m['ai_label'] as String?,
      aiConfidence: (m['prediction_confidence'] as num?)?.toDouble(),
      createdAt: rawCreated.toString(),
      updatedAt: rawUpdated.toString(),
      userName: m['user_name'] as String?,
      userMobile: m['user_mobile'] as String?,
      userEmail: m['user_email'] as String?,
    );
  }

  ReportModel copyWith(
          {String? status, String? department, String? updatedAt}) =>
      ReportModel(
        id: id,
        title: title,
        description: description,
        category: category,
        urgency: urgency,
        status: status ?? this.status,
        department: department ?? this.department,
        locationAddress: locationAddress,
        latitude: latitude,
        longitude: longitude,
        imagePath: imagePath,
        aiLabel: aiLabel,
        aiConfidence: aiConfidence,
        createdAt: createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        userName: userName,
        userMobile: userMobile,
        userEmail: userEmail,
      );

  static String _deptToCategory(String dept) {
    switch (dept) {
      case 'water_dept':
        return 'Water Supply';
      case 'road_dept':
        return 'Road Maintenance';
      case 'sanitation_dept':
        return 'Sanitation';
      case 'electricity_dept':
        return 'Electricity';
      default:
        return 'Other';
    }
  }
}
