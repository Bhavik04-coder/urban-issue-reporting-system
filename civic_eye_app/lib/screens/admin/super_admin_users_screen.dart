import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';

const _departments = [
  'water_dept',
  'road_dept',
  'sanitation_dept',
  'electricity_dept',
  'other',
];

const _deptLabels = {
  'water_dept': 'Water Dept',
  'road_dept': 'Road Dept',
  'sanitation_dept': 'Sanitation Dept',
  'electricity_dept': 'Electricity Dept',
  'other': 'Other',
};

class SuperAdminUsersScreen extends StatefulWidget {
  const SuperAdminUsersScreen({super.key});

  @override
  State<SuperAdminUsersScreen> createState() => _SuperAdminUsersScreenState();
}

class _SuperAdminUsersScreenState extends State<SuperAdminUsersScreen> {
  List<Map<String, dynamic>> _users = [];
  bool _loading = true;
  String _roleFilter = 'all';
  Map<String, dynamic> _stats = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        ApiService.listAllUsers(token,
            roleFilter: _roleFilter == 'all' ? null : _roleFilter),
        ApiService.getSuperAdminStats(token),
      ]);
      setState(() {
        _users = (results[0] as List<dynamic>)
            .map((u) => u as Map<String, dynamic>)
            .toList();
        _stats = results[1] as Map<String, dynamic>;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      _snack('Failed to load: $e');
    }
  }

  void _snack(String msg, {bool ok = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: ok ? AppTheme.secondary : AppTheme.accent,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  Future<void> _changeRole(Map<String, dynamic> user) async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;

    String selectedRole = user['role'] as String? ?? 'user';
    String? selectedDept = user['department'] as String?;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSt) => AlertDialog(
          backgroundColor: AppTheme.surfaceCard,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Change Role — ${user['full_name']}',
            style: const TextStyle(
                color: AppTheme.textPrimary, fontSize: 16),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Role',
                  style: TextStyle(
                      color: AppTheme.textSecondary, fontSize: 12)),
              const SizedBox(height: 8),
              // Role chips
              Wrap(
                spacing: 8,
                children: ['user', 'dept_admin', 'super_admin'].map((r) {
                  final sel = r == selectedRole;
                  return ChoiceChip(
                    label: Text(_roleLabel(r)),
                    selected: sel,
                    selectedColor: AppTheme.primary,
                    backgroundColor: AppTheme.surfaceLight,
                    labelStyle: TextStyle(
                        color: sel ? Colors.white : AppTheme.textSecondary,
                        fontSize: 12),
                    onSelected: (_) => setSt(() {
                      selectedRole = r;
                      if (r != 'dept_admin') selectedDept = null;
                    }),
                  );
                }).toList(),
              ),

              if (selectedRole == 'dept_admin') ...[
                const SizedBox(height: 16),
                const Text('Department',
                    style: TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: _departments.map((d) {
                    final sel = d == selectedDept;
                    return ChoiceChip(
                      label: Text(_deptLabels[d] ?? d),
                      selected: sel,
                      selectedColor: AppTheme.secondary,
                      backgroundColor: AppTheme.surfaceLight,
                      labelStyle: TextStyle(
                          color: sel ? Colors.white : AppTheme.textSecondary,
                          fontSize: 11),
                      onSelected: (_) => setSt(() => selectedDept = d),
                    );
                  }).toList(),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel',
                  style: TextStyle(color: AppTheme.textSecondary)),
            ),
            ElevatedButton(
              onPressed: () async {
                if (selectedRole == 'dept_admin' && selectedDept == null) {
                  _snack('Please select a department');
                  return;
                }
                Navigator.pop(ctx);
                try {
                  await ApiService.assignUserRole(
                    token,
                    user['id'] as int,
                    selectedRole,
                    department: selectedDept,
                  );
                  _snack('Role updated successfully', ok: true);
                  _load();
                } catch (e) {
                  _snack(e.toString());
                }
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _deleteUser(Map<String, dynamic> user) async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceCard,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete User',
            style: TextStyle(color: AppTheme.textPrimary)),
        content: Text(
          'Delete ${user['full_name']} (${user['email']})? This cannot be undone.',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel',
                style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accent),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm != true) return;
    try {
      await ApiService.deleteUser(token, user['id'] as int);
      _snack('User deleted', ok: true);
      _load();
    } catch (e) {
      _snack(e.toString());
    }
  }

  void _showCreateAdminDialog() {
    final emailCtrl = TextEditingController();
    final passCtrl = TextEditingController();
    final nameCtrl = TextEditingController();
    final mobileCtrl = TextEditingController();
    String role = 'dept_admin';
    String? dept;
    bool loading = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSt) => AlertDialog(
          backgroundColor: AppTheme.surfaceCard,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Create Admin Account',
              style: TextStyle(color: AppTheme.textPrimary)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _DialogField(ctrl: nameCtrl, label: 'Full Name',
                    icon: Icons.person_outline),
                const SizedBox(height: 10),
                _DialogField(ctrl: emailCtrl, label: 'Email',
                    icon: Icons.email_outlined,
                    type: TextInputType.emailAddress),
                const SizedBox(height: 10),
                _DialogField(ctrl: mobileCtrl, label: 'Mobile (10 digits)',
                    icon: Icons.phone_outlined,
                    type: TextInputType.phone),
                const SizedBox(height: 10),
                _DialogField(ctrl: passCtrl, label: 'Password',
                    icon: Icons.lock_outline, obscure: true),
                const SizedBox(height: 14),
                const Text('Role',
                    style: TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  children: ['dept_admin', 'super_admin'].map((r) {
                    final sel = r == role;
                    return ChoiceChip(
                      label: Text(_roleLabel(r)),
                      selected: sel,
                      selectedColor: AppTheme.primary,
                      backgroundColor: AppTheme.surfaceLight,
                      labelStyle: TextStyle(
                          color: sel ? Colors.white : AppTheme.textSecondary,
                          fontSize: 12),
                      onSelected: (_) => setSt(() {
                        role = r;
                        if (r != 'dept_admin') dept = null;
                      }),
                    );
                  }).toList(),
                ),
                if (role == 'dept_admin') ...[
                  const SizedBox(height: 12),
                  const Text('Department',
                      style: TextStyle(
                          color: AppTheme.textSecondary, fontSize: 12)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: _departments.map((d) {
                      final sel = d == dept;
                      return ChoiceChip(
                        label: Text(_deptLabels[d] ?? d),
                        selected: sel,
                        selectedColor: AppTheme.secondary,
                        backgroundColor: AppTheme.surfaceLight,
                        labelStyle: TextStyle(
                            color: sel ? Colors.white : AppTheme.textSecondary,
                            fontSize: 11),
                        onSelected: (_) => setSt(() => dept = d),
                      );
                    }).toList(),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel',
                  style: TextStyle(color: AppTheme.textSecondary)),
            ),
            ElevatedButton(
              onPressed: loading
                  ? null
                  : () async {
                      if (role == 'dept_admin' && dept == null) {
                        _snack('Select a department');
                        return;
                      }
                      final token =
                          context.read<AuthProvider>().token;
                      if (token == null) return;
                      setSt(() => loading = true);
                      try {
                        await ApiService.createAdminUser(
                          token: token,
                          email: emailCtrl.text.trim(),
                          password: passCtrl.text,
                          fullName: nameCtrl.text.trim(),
                          mobile: mobileCtrl.text.trim(),
                          role: role,
                          department: dept,
                        );
                        if (ctx.mounted) Navigator.pop(ctx);
                        _snack('Admin created successfully', ok: true);
                        _load();
                      } catch (e) {
                        _snack(e.toString());
                      } finally {
                        setSt(() => loading = false);
                      }
                    },
              child: loading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Text('Create'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppTheme.bgDark : AppTheme.bgLight;
    final cardColor =
        isDark ? AppTheme.surfaceCard : AppTheme.surfaceCardLight;
    final textPrimary =
        isDark ? AppTheme.textPrimary : AppTheme.textPrimaryLight;
    final textSecondary =
        isDark ? AppTheme.textSecondary : AppTheme.textSecondaryLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        title: Text('User Management',
            style: TextStyle(color: textPrimary)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.primary),
            onPressed: _load,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateAdminDialog,
        backgroundColor: AppTheme.primary,
        icon: const Icon(Icons.person_add_rounded, color: Colors.white),
        label: const Text('Add Admin',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: Column(
        children: [
          // Stats row
          if (_stats.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Row(
                children: [
                  _StatPill('Total', '${_stats['total_users'] ?? 0}',
                      AppTheme.primary),
                  const SizedBox(width: 8),
                  _StatPill('Super', '${_stats['super_admins'] ?? 0}',
                      AppTheme.accent),
                  const SizedBox(width: 8),
                  _StatPill('Dept', '${_stats['dept_admins'] ?? 0}',
                      AppTheme.secondary),
                  const SizedBox(width: 8),
                  _StatPill('Users', '${_stats['regular_users'] ?? 0}',
                      AppTheme.warning),
                ],
              ).animate().fadeIn(),
            ),

          // Filter chips
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: SizedBox(
              height: 36,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: {
                  'all': 'All',
                  'user': 'Users',
                  'dept_admin': 'Dept Admins',
                  'super_admin': 'Super Admins',
                }.entries.map((e) {
                  final sel = e.key == _roleFilter;
                  return GestureDetector(
                    onTap: () {
                      setState(() => _roleFilter = e.key);
                      _load();
                    },
                    child: AnimatedContainer(
                      duration: 200.ms,
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: sel ? AppTheme.primary : cardColor,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: sel
                              ? AppTheme.primary
                              : Colors.white.withAlpha(15),
                        ),
                      ),
                      child: Text(e.value,
                          style: TextStyle(
                              color: sel ? Colors.white : textSecondary,
                              fontSize: 12,
                              fontWeight: sel
                                  ? FontWeight.w600
                                  : FontWeight.w400)),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // User list
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.primary))
                : _users.isEmpty
                    ? Center(
                        child: Text('No users found',
                            style: TextStyle(color: textSecondary)))
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                        itemCount: _users.length,
                        itemBuilder: (_, i) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _UserCard(
                            user: _users[i],
                            cardColor: cardColor,
                            textPrimary: textPrimary,
                            textSecondary: textSecondary,
                            onChangeRole: () => _changeRole(_users[i]),
                            onDelete: () => _deleteUser(_users[i]),
                          ),
                        ).animate(delay: (i * 40).ms).slideX(begin: 0.1).fadeIn(),
                      ),
          ),
        ],
      ),
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

String _roleLabel(String role) {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'dept_admin':
      return 'Dept Admin';
    default:
      return 'User';
  }
}

Color _roleColor(String role) {
  switch (role) {
    case 'super_admin':
      return AppTheme.accent;
    case 'dept_admin':
      return AppTheme.secondary;
    default:
      return AppTheme.primary;
  }
}

// ── Widgets ───────────────────────────────────────────────────────────────────

class _StatPill extends StatelessWidget {
  final String label, value;
  final Color color;
  const _StatPill(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withAlpha(40)),
        ),
        child: Column(
          children: [
            Text(value,
                style: TextStyle(
                    color: color,
                    fontSize: 16,
                    fontWeight: FontWeight.w800)),
            Text(label,
                style: const TextStyle(
                    color: AppTheme.textSecondary, fontSize: 10)),
          ],
        ),
      ),
    );
  }
}

class _UserCard extends StatelessWidget {
  final Map<String, dynamic> user;
  final Color cardColor, textPrimary, textSecondary;
  final VoidCallback onChangeRole, onDelete;

  const _UserCard({
    required this.user,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
    required this.onChangeRole,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final role = user['role'] as String? ?? 'user';
    final dept = user['department'] as String?;
    final rc = _roleColor(role);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: rc.withAlpha(25),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                (user['full_name'] as String? ?? 'U')
                    .split(' ')
                    .take(2)
                    .map((e) => e.isNotEmpty ? e[0].toUpperCase() : '')
                    .join(),
                style: TextStyle(
                    color: rc,
                    fontSize: 15,
                    fontWeight: FontWeight.w700),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user['full_name'] as String? ?? '',
                    style: TextStyle(
                        color: textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w600)),
                Text(user['email'] as String? ?? '',
                    style: TextStyle(
                        color: textSecondary, fontSize: 11)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: rc.withAlpha(25),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(_roleLabel(role),
                          style: TextStyle(
                              color: rc,
                              fontSize: 10,
                              fontWeight: FontWeight.w700)),
                    ),
                    if (dept != null) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.secondary.withAlpha(20),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          _deptLabels[dept] ?? dept,
                          style: const TextStyle(
                              color: AppTheme.secondary,
                              fontSize: 10,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // Actions
          PopupMenuButton<String>(
            icon: Icon(Icons.more_vert_rounded,
                color: textSecondary, size: 20),
            color: AppTheme.surfaceCard,
            onSelected: (v) {
              if (v == 'role') onChangeRole();
              if (v == 'delete') onDelete();
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'role',
                child: Row(
                  children: [
                    Icon(Icons.manage_accounts_rounded,
                        color: AppTheme.primary, size: 18),
                    SizedBox(width: 10),
                    Text('Change Role',
                        style: TextStyle(color: AppTheme.textPrimary)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete_outline_rounded,
                        color: AppTheme.accent, size: 18),
                    SizedBox(width: 10),
                    Text('Delete User',
                        style: TextStyle(color: AppTheme.accent)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DialogField extends StatelessWidget {
  final TextEditingController ctrl;
  final String label;
  final IconData icon;
  final TextInputType? type;
  final bool obscure;
  const _DialogField({
    required this.ctrl,
    required this.label,
    required this.icon,
    this.type,
    this.obscure = false,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: ctrl,
      keyboardType: type,
      obscureText: obscure,
      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon:
            Icon(icon, color: AppTheme.textSecondary, size: 18),
        isDense: true,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
    );
  }
}
