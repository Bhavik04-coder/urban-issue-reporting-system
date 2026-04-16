class UserModel {
  final int? id;
  final String email;
  final String fullName;
  final String mobile;
  final bool isAdmin;
  final String role;          // "user" | "dept_admin" | "super_admin"
  final String? department;   // set when role == "dept_admin"
  final String createdAt;

  UserModel({
    this.id,
    required this.email,
    required this.fullName,
    required this.mobile,
    this.isAdmin = false,
    this.role = 'user',
    this.department,
    required this.createdAt,
  });

  bool get isSuperAdmin => role == 'super_admin';
  bool get isDeptAdmin => role == 'dept_admin';
  bool get isAnyAdmin => role == 'dept_admin' || role == 'super_admin' || isAdmin;

  factory UserModel.fromApi(Map<String, dynamic> m) => UserModel(
        id: m['id'],
        email: m['email'] ?? '',
        fullName: m['full_name'] ?? '',
        mobile: m['mobile_number'] ?? '',
        isAdmin: m['is_admin'] ?? false,
        role: m['role'] as String? ?? 'user',
        department: m['department'] as String?,
        createdAt: m['created_at'] ?? DateTime.now().toIso8601String(),
      );

  UserModel copyWith({
    int? id,
    String? email,
    String? fullName,
    String? mobile,
    bool? isAdmin,
    String? role,
    String? department,
    String? createdAt,
  }) =>
      UserModel(
        id: id ?? this.id,
        email: email ?? this.email,
        fullName: fullName ?? this.fullName,
        mobile: mobile ?? this.mobile,
        isAdmin: isAdmin ?? this.isAdmin,
        role: role ?? this.role,
        department: department ?? this.department,
        createdAt: createdAt ?? this.createdAt,
      );
}
