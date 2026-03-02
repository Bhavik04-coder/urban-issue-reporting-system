import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // Profile Header
          Center(
            child: Column(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      auth.userEmail?.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 40,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  auth.userEmail ?? 'User',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: auth.isAdmin
                        ? Colors.purple[50]
                        : Colors.blue[50],
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    auth.isAdmin ? 'Admin' : 'Citizen',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: auth.isAdmin
                          ? Colors.purple[700]
                          : Colors.blue[700],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Menu Items
          _buildMenuItem(
            icon: Icons.person,
            title: 'Edit Profile',
            onTap: () {},
          ),
          _buildMenuItem(
            icon: Icons.notifications,
            title: 'Notifications',
            onTap: () {},
          ),
          _buildMenuItem(
            icon: Icons.settings,
            title: 'Settings',
            onTap: () {},
          ),
          _buildMenuItem(
            icon: Icons.help,
            title: 'Help & Support',
            onTap: () {},
          ),
          const SizedBox(height: 16),
          _buildMenuItem(
            icon: Icons.logout,
            title: 'Logout',
            color: Colors.red,
            onTap: () {
              auth.logout();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? color,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: ListTile(
        leading: Icon(icon, color: color ?? const Color(0xFF475569)),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: color ?? const Color(0xFF1E293B),
          ),
        ),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
        onTap: onTap,
      ),
    );
  }
}
