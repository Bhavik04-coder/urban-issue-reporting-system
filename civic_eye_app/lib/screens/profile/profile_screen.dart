import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../auth/login_screen.dart';
import '../admin/super_admin_users_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final user = auth.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppTheme.bgDark : AppTheme.bgLight;
    final textPrimary =
        isDark ? AppTheme.textPrimary : AppTheme.textPrimaryLight;
    final textSecondary =
        isDark ? AppTheme.textSecondary : AppTheme.textSecondaryLight;
    final cardColor =
        isDark ? AppTheme.surfaceCard : AppTheme.surfaceCardLight;

    final initials = user?.fullName
            .split(' ')
            .take(2)
            .map((e) => e.isNotEmpty ? e[0].toUpperCase() : '')
            .join() ??
        'U';

    return Scaffold(
      backgroundColor: bg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: bg,
            automaticallyImplyLeading: false,
            title: Text('Profile', style: TextStyle(color: textPrimary)),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
              child: Column(
                children: [
                  // Avatar
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppTheme.primary, AppTheme.secondary],
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primary.withAlpha(80),
                          blurRadius: 24,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(initials,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.w800)),
                    ),
                  ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),

                  const SizedBox(height: 16),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(user?.fullName ?? 'User',
                          style: TextStyle(
                              color: textPrimary,
                              fontSize: 22,
                              fontWeight: FontWeight.w700)),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => _showEditDialog(context, auth),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withAlpha(25),
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: AppTheme.primary.withAlpha(60)),
                          ),
                          child: const Icon(Icons.edit_rounded,
                              color: AppTheme.primary, size: 14),
                        ),
                      ),
                    ],
                  ).animate(delay: 100.ms).fadeIn(),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '',
                      style: TextStyle(
                          color: textSecondary, fontSize: 14))
                      .animate(delay: 150.ms)
                      .fadeIn(),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: auth.isAdmin
                          ? AppTheme.accent.withAlpha(30)
                          : AppTheme.primary.withAlpha(30),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: auth.isAdmin
                            ? AppTheme.accent.withAlpha(60)
                            : AppTheme.primary.withAlpha(60),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          auth.isAdmin
                              ? Icons.shield_rounded
                              : Icons.person_rounded,
                          size: 14,
                          color: auth.isAdmin
                              ? AppTheme.accent
                              : AppTheme.primary,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          auth.isAdmin ? 'Administrator' : 'Citizen',
                          style: TextStyle(
                            color: auth.isAdmin
                                ? AppTheme.accent
                                : AppTheme.primary,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ).animate(delay: 200.ms).fadeIn(),

                  const SizedBox(height: 32),

                  // Info card
                  _InfoCard(
                    user: user,
                    cardColor: cardColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                  ).animate(delay: 300.ms).slideY(begin: 0.2).fadeIn(),

                  const SizedBox(height: 20),

                  // Account section
                  _MenuSection(
                    title: 'Account',
                    cardColor: cardColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                    items: [
                      _MenuItem(
                        icon: Icons.edit_outlined,
                        label: 'Edit Profile',
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        onTap: () => _showEditDialog(context, auth),
                      ),
                      _MenuItem(
                        icon: Icons.lock_outline,
                        label: 'Change Password',
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        onTap: () {},
                      ),
                    ],
                  ).animate(delay: 350.ms).slideY(begin: 0.2).fadeIn(),

                  const SizedBox(height: 16),

                  // App section
                  _MenuSection(
                    title: 'App',
                    cardColor: cardColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                    items: [
                      // Feature 13: Theme toggle
                      _MenuItemSwitch(
                        icon: themeProvider.isDarkMode
                            ? Icons.dark_mode_rounded
                            : Icons.light_mode_rounded,
                        label: themeProvider.isDarkMode
                            ? 'Dark Mode'
                            : 'Light Mode',
                        value: themeProvider.isDarkMode,
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        onChanged: (_) => themeProvider.toggle(),
                      ),
                      _MenuItem(
                        icon: Icons.notifications_outlined,
                        label: 'Notifications',
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        onTap: () {},
                      ),
                      _MenuItem(
                        icon: Icons.help_outline,
                        label: 'Help & Support',
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        onTap: () {},
                      ),
                      _MenuItem(
                        icon: Icons.info_outline,
                        label: 'About CivicEye',
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        onTap: () => _showAbout(context),
                      ),
                    ],
                  ).animate(delay: 400.ms).slideY(begin: 0.2).fadeIn(),

                  // Super Admin: User management
                  if (auth.isSuperAdmin) ...[
                    const SizedBox(height: 16),
                    _MenuSection(
                      title: 'Administration',
                      cardColor: cardColor,
                      textPrimary: textPrimary,
                      textSecondary: textSecondary,
                      items: [
                        _MenuItem(
                          icon: Icons.manage_accounts_rounded,
                          label: 'Manage Users & Admins',
                          textPrimary: textPrimary,
                          textSecondary: textSecondary,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  const SuperAdminUsersScreen(),
                            ),
                          ),
                        ),
                      ],
                    ).animate(delay: 415.ms).slideY(begin: 0.2).fadeIn(),
                  ],

                  // Feature 12: Export section (admin only)
                  if (auth.isAdmin) ...[
                    const SizedBox(height: 16),
                    _MenuSection(
                      title: 'Export',
                      cardColor: cardColor,
                      textPrimary: textPrimary,
                      textSecondary: textSecondary,
                      items: [
                        _MenuItem(
                          icon: Icons.table_chart_outlined,
                          label: 'Export Reports as CSV',
                          textPrimary: textPrimary,
                          textSecondary: textSecondary,
                          onTap: () => _exportCsv(context, auth),
                        ),
                        _MenuItem(
                          icon: Icons.picture_as_pdf_outlined,
                          label: 'Export Reports as PDF',
                          textPrimary: textPrimary,
                          textSecondary: textSecondary,
                          onTap: () => _exportPdf(context, auth),
                        ),
                      ],
                    ).animate(delay: 420.ms).slideY(begin: 0.2).fadeIn(),
                  ],
                  const SizedBox(height: 16),

                  // Logout
                  GestureDetector(
                    onTap: () => _confirmLogout(context, auth),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: AppTheme.accent.withAlpha(15),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                            color: AppTheme.accent.withAlpha(40)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.logout_rounded,
                              color: AppTheme.accent, size: 22),
                          SizedBox(width: 14),
                          Text('Sign Out',
                              style: TextStyle(
                                  color: AppTheme.accent,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600)),
                          Spacer(),
                          Icon(Icons.chevron_right,
                              color: AppTheme.accent, size: 20),
                        ],
                      ),
                    ),
                  ).animate(delay: 450.ms).slideY(begin: 0.2).fadeIn(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showEditDialog(BuildContext context, AuthProvider auth) {
    final nameCtrl =
        TextEditingController(text: auth.user?.fullName ?? '');
    final mobileCtrl =
        TextEditingController(text: auth.user?.mobile ?? '');
    final formKey = GlobalKey<FormState>();

    bool isSaving = false;

    showDialog(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setState) {
          return AlertDialog(
            backgroundColor: AppTheme.surfaceCard,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20)),
            title: const Row(
              children: [
                Icon(Icons.edit_rounded,
                    color: AppTheme.primary, size: 20),
                SizedBox(width: 10),
                Text('Edit Profile',
                    style: TextStyle(color: AppTheme.textPrimary)),
              ],
            ),
            content: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: nameCtrl,
                    style:
                        const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(
                      labelText: 'Full Name',
                      prefixIcon: Icon(Icons.person_outline,
                          color: AppTheme.textSecondary, size: 20),
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return 'Name cannot be empty';
                      }
                      if (v.trim().length < 2) {
                        return 'Name must be at least 2 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: mobileCtrl,
                    style:
                        const TextStyle(color: AppTheme.textPrimary),
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'Mobile',
                      prefixIcon: Icon(Icons.phone_outlined,
                          color: AppTheme.textSecondary, size: 20),
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return 'Mobile cannot be empty';
                      }
                      if (!RegExp(r'^\d{10}$').hasMatch(v.trim())) {
                        return 'Enter a valid 10-digit mobile number';
                      }
                      return null;
                    },
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed:
                    isSaving ? null : () => Navigator.pop(ctx),
                child: const Text('Cancel',
                    style:
                        TextStyle(color: AppTheme.textSecondary)),
              ),
              ElevatedButton.icon(
                icon: isSaving
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.check_rounded, size: 16),
                label: Text(isSaving ? 'Saving…' : 'Save Changes'),
                onPressed: isSaving
                    ? null
                    : () async {
                        if (!formKey.currentState!.validate()) return;
                        setState(() => isSaving = true);
                        await auth.updateProfile(
                          fullName: nameCtrl.text.trim(),
                          mobile: mobileCtrl.text.trim(),
                        );
                        if (ctx.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content:
                                  Text('Profile updated successfully'),
                              backgroundColor: AppTheme.secondary,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      },
              ),
            ],
          );
        },
      ),
    );
  }

  void _showAbout(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'CivicEye',
      applicationVersion: '1.0.0',
      applicationLegalese: '© 2025 CivicEye. All rights reserved.',
    );
  }

  void _confirmLogout(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceCard,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Sign Out',
            style: TextStyle(color: AppTheme.textPrimary)),
        content: const Text('Are you sure you want to sign out?',
            style: TextStyle(color: AppTheme.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel',
                style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accent),
            onPressed: () async {
              await auth.logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (_) => false,
                );
              }
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }

  Future<void> _exportCsv(BuildContext context, AuthProvider auth) async {
    if (auth.token == null) return;
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Preparing CSV export…'),
          backgroundColor: AppTheme.primary,
          behavior: SnackBarBehavior.floating,
        ),
      );
      await ApiService.exportCsv(auth.token!);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('CSV export ready — check your downloads'),
            backgroundColor: AppTheme.secondary,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Export failed: $e'),
            backgroundColor: AppTheme.accent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _exportPdf(BuildContext context, AuthProvider auth) async {
    if (auth.token == null) return;
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Preparing PDF export…'),
          backgroundColor: AppTheme.primary,
          behavior: SnackBarBehavior.floating,
        ),
      );
      await ApiService.exportPdf(auth.token!);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('PDF export ready — check your downloads'),
            backgroundColor: AppTheme.secondary,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Export failed: $e'),
            backgroundColor: AppTheme.accent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }
}

// ── Shared widgets ─────────────────────────────────────────────────────────────

class _InfoCard extends StatelessWidget {
  final dynamic user;
  final Color cardColor, textPrimary, textSecondary;
  const _InfoCard({
    required this.user,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Column(
        children: [
          _InfoRow(Icons.email_outlined, 'Email', user?.email ?? '-',
              textPrimary, textSecondary),
          Divider(color: textSecondary.withAlpha(30), height: 24),
          _InfoRow(Icons.phone_outlined, 'Mobile', user?.mobile ?? '-',
              textPrimary, textSecondary),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color textPrimary, textSecondary;
  const _InfoRow(
      this.icon, this.label, this.value, this.textPrimary, this.textSecondary);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primary, size: 18),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: TextStyle(color: textSecondary, fontSize: 11)),
            Text(value,
                style: TextStyle(
                    color: textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ],
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<Widget> items;
  final Color cardColor, textPrimary, textSecondary;
  const _MenuSection({
    required this.title,
    required this.items,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 10),
          child: Text(title,
              style: TextStyle(
                  color: textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.8)),
        ),
        Container(
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white.withAlpha(10)),
          ),
          child: Column(
            children: items.asMap().entries.map((e) {
              final isLast = e.key == items.length - 1;
              return Column(
                children: [
                  e.value,
                  if (!isLast)
                    Divider(
                        color: textSecondary.withAlpha(20),
                        height: 1,
                        indent: 52),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color textPrimary, textSecondary;
  const _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    required this.textPrimary,
    required this.textSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: AppTheme.primary, size: 20),
      title: Text(label,
          style: TextStyle(
              color: textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w500)),
      trailing: Icon(Icons.chevron_right,
          color: textSecondary, size: 18),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 18, vertical: 2),
    );
  }
}

// Feature 13: Theme toggle switch menu item
class _MenuItemSwitch extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;
  final Color textPrimary, textSecondary;
  const _MenuItemSwitch({
    required this.icon,
    required this.label,
    required this.value,
    required this.onChanged,
    required this.textPrimary,
    required this.textSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primary, size: 20),
      title: Text(label,
          style: TextStyle(
              color: textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w500)),
      trailing: Switch.adaptive(
        value: value,
        onChanged: onChanged,
        activeColor: AppTheme.primary,
      ),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 18, vertical: 2),
    );
  }
}
