class ReportModel {
  final int? id;
  final int userId;
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

  ReportModel({
    this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.category,
    required this.urgency,
    this.status = 'Pending',
    this.department,
    this.locationAddress,
    this.latitude,
    this.longitude,
    this.imagePath,
    this.aiLabel,
    this.aiConfidence,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        'user_id': userId,
        'title': title,
        'description': description,
        'category': category,
        'urgency': urgency,
        'status': status,
        'department': department,
        'location_address': locationAddress,
        'latitude': latitude,
        'longitude': longitude,
        'image_path': imagePath,
        'ai_label': aiLabel,
        'ai_confidence': aiConfidence,
        'created_at': createdAt,
        'updated_at': updatedAt,
      };

  factory ReportModel.fromMap(Map<String, dynamic> m) => ReportModel(
        id: m['id'],
        userId: m['user_id'],
        title: m['title'],
        description: m['description'],
        category: m['category'],
        urgency: m['urgency'],
        status: m['status'] ?? 'Pending',
        department: m['department'],
        locationAddress: m['location_address'],
        latitude: m['latitude'],
        longitude: m['longitude'],
        imagePath: m['image_path'],
        aiLabel: m['ai_label'],
        aiConfidence: m['ai_confidence'],
        createdAt: m['created_at'],
        updatedAt: m['updated_at'],
      );

  ReportModel copyWith({String? status, String? department, String? updatedAt}) => ReportModel(
        id: id,
        userId: userId,
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
      );
}
