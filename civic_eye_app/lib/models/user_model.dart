class UserModel {
  final int? id;
  final String email;
  final String fullName;
  final String mobile;
  final bool isAdmin;
  final String createdAt;

  UserModel({
    this.id,
    required this.email,
    required this.fullName,
    required this.mobile,
    this.isAdmin = false,
    required this.createdAt,
  });

  factory UserModel.fromApi(Map<String, dynamic> m) => UserModel(
        id: m['id'],
        email: m['email'] ?? '',
        fullName: m['full_name'] ?? '',
        mobile: m['mobile_number'] ?? '',
        isAdmin: m['is_admin'] ?? false,
        createdAt: m['created_at'] ?? DateTime.now().toIso8601String(),
      );

  UserModel copyWith({
    int? id,
    String? email,
    String? fullName,
    String? mobile,
    bool? isAdmin,
    String? createdAt,
  }) =>
      UserModel(
        id: id ?? this.id,
        email: email ?? this.email,
        fullName: fullName ?? this.fullName,
        mobile: mobile ?? this.mobile,
        isAdmin: isAdmin ?? this.isAdmin,
        createdAt: createdAt ?? this.createdAt,
      );
}
