import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final initials = user?.fullName
            .split(' ')
            .take(2)
            .map((e) => e.isNotEmpty ? e[0].toUpperCase() : '')
            .join() ??
        'U';

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: AppTheme.bgDark,
            automaticallyImplyLeading: false,
            title: const Text('Profile'),
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
                  Text(user?.fullName ?? 'User',
                      style: const TextStyle(
                          color: AppTheme.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.w700))
                      .animate(delay: 100.ms)
                      .fadeIn(),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '',
                      style: const TextStyle(
                          color: AppTheme.textSecondary, fontSize: 14))
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
                  _InfoCard(user: user)
                      .animate(delay: 300.ms)
                      .slideY(begin: 0.2)
                      .fadeIn(),

                  const SizedBox(height: 20),

                  // Menu
                  _MenuSection(
                    title: 'Account',
                    items: [
                      _MenuItem(
                        icon: Icons.edit_outlined,
                        label: 'Edit Profile',
                        onTap: () => _showEditDialog(context, auth),
                      ),
                      _MenuItem(
                        icon: Icons.lock_outline,
                        label: 'Change Password',
                        onTap: () {},
                      ),
                    ],
                  ).animate(delay: 350.ms).slideY(begin: 0.2).fadeIn(),

                  const SizedBox(height: 16),

                  _MenuSection(
                    title: 'App',
                    items: [
                      _MenuItem(
                        icon: Icons.notifications_outlined,
                        label: 'Notifications',
                        onTap: () {},
                      ),
                      _MenuItem(
                        icon: Icons.help_outline,
                        label: 'Help & Support',
                        onTap: () {},
                      ),
                      _MenuItem(
                        icon: Icons.info_outline,
                        label: 'About CivicEye',
                        onTap: () => _showAbout(context),
                      ),
                    ],
                  ).animate(delay: 400.ms).slideY(begin: 0.2).fadeIn(),

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
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceCard,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Edit Profile',
            style: TextStyle(color: AppTheme.textPrimary)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(
                  labelText: 'Full Name',
                  prefixIcon: Icon(Icons.person_outline,
                      color: AppTheme.textSecondary, size: 20)),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: mobileCtrl,
              style: const TextStyle(color: AppTheme.textPrimary),
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                  labelText: 'Mobile',
                  prefixIcon: Icon(Icons.phone_outlined,
                      color: AppTheme.textSecondary, size: 20)),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel',
                style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () async {
              await auth.updateProfile(
                  fullName: nameCtrl.text, mobile: mobileCtrl.text);
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
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
}

class _InfoCard extends StatelessWidget {
  final dynamic user;
  const _InfoCard({required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Column(
        children: [
          _InfoRow(Icons.email_outlined, 'Email', user?.email ?? '-'),
          const Divider(color: Color(0xFF2A2A4A), height: 24),
          _InfoRow(Icons.phone_outlined, 'Mobile', user?.mobile ?? '-'),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoRow(this.icon, this.label, this.value);

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
                style: const TextStyle(
                    color: AppTheme.textSecondary, fontSize: 11)),
            Text(value,
                style: const TextStyle(
                    color: AppTheme.textPrimary,
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
  final List<_MenuItem> items;
  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 10),
          child: Text(title,
              style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.8)),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppTheme.surfaceCard,
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
                    const Divider(
                        color: Color(0xFF2A2A4A),
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
  const _MenuItem(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: AppTheme.primary, size: 20),
      title: Text(label,
          style: const TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.chevron_right,
          color: AppTheme.textSecondary, size: 18),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 18, vertical: 2),
    );
  }
}
