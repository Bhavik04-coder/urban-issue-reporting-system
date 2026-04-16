class UserModel {
  final int? id;
  final String email;
  final String passwordHash;
  final String fullName;
  final String mobile;
  final bool isAdmin;
  final String createdAt;

  UserModel({
    this.id,
    required this.email,
    required this.passwordHash,
    required this.fullName,
    required this.mobile,
    this.isAdmin = false,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        'email': email,
        'password_hash': passwordHash,
        'full_name': fullName,
        'mobile': mobile,
        'is_admin': isAdmin ? 1 : 0,
        'created_at': createdAt,
      };

  factory UserModel.fromMap(Map<String, dynamic> m) => UserModel(
        id: m['id'],
        email: m['email'],
        passwordHash: m['password_hash'],
        fullName: m['full_name'],
        mobile: m['mobile'],
        isAdmin: m['is_admin'] == 1,
        createdAt: m['created_at'],
      );

  UserModel copyWith({
    int? id,
    String? email,
    String? passwordHash,
    String? fullName,
    String? mobile,
    bool? isAdmin,
    String? createdAt,
  }) =>
      UserModel(
        id: id ?? this.id,
        email: email ?? this.email,
        passwordHash: passwordHash ?? this.passwordHash,
        fullName: fullName ?? this.fullName,
        mobile: mobile ?? this.mobile,
        isAdmin: isAdmin ?? this.isAdmin,
        createdAt: createdAt ?? this.createdAt,
      );
}
