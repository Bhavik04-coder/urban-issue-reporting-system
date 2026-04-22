import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import 'admin_dashboard_tab.dart';
import 'admin_reports_tab.dart';
import 'admin_map_tab.dart';
import 'admin_dept_tab.dart';
import 'dept_admin_reports_screen.dart';
import '../profile/profile_screen.dart';

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _idx = 0;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final role = auth.user?.role ?? 'user';
    final dept = auth.adminDepartment;
    final isDeptAdmin = auth.isDeptAdmin;

    // Dept admins get a dedicated reports tab instead of the generic one
    final tabs = isDeptAdmin
        ? const [
            AdminDashboardTab(),
            DeptAdminReportsScreen(),
            AdminMapTab(),
            AdminDeptTab(),
            ProfileScreen(),
          ]
        : const [
            AdminDashboardTab(),
            AdminReportsTab(),
            AdminMapTab(),
            AdminDeptTab(),
            ProfileScreen(),
          ];

    return Scaffold(
      body: Stack(
        children: [
          IndexedStack(index: _idx, children: tabs),
          // Role badge — top right corner
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            right: 16,
            child: _RoleBadge(role: role, department: dept),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.surfaceCard,
          border: Border(
              top: BorderSide(color: Colors.white.withAlpha(15), width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _idx,
          onDestinationSelected: (i) => setState(() => _idx = i),
          backgroundColor: Colors.transparent,
          elevation: 0,
          height: 68,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard_rounded),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.assignment_outlined),
              selectedIcon: Icon(Icons.assignment_rounded),
              label: 'Reports',
            ),
            NavigationDestination(
              icon: Icon(Icons.map_outlined),
              selectedIcon: Icon(Icons.map_rounded),
              label: 'Map',
            ),
            NavigationDestination(
              icon: Icon(Icons.bar_chart_outlined),
              selectedIcon: Icon(Icons.bar_chart_rounded),
              label: 'Depts',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final String role;
  final String? department;
  const _RoleBadge({required this.role, this.department});

  @override
  Widget build(BuildContext context) {
    if (role == 'user') return const SizedBox.shrink();

    Color color;
    String label;
    IconData icon;

    if (role == 'super_admin') {
      color = AppTheme.accent;
      label = 'Super Admin';
      icon = Icons.shield_rounded;
    } else {
      color = AppTheme.secondary;
      final deptShort = department?.replaceAll('_dept', '').replaceAll('_', ' ') ?? '';
      label = deptShort.isNotEmpty ? '${_cap(deptShort)} Admin' : 'Dept Admin';
      icon = Icons.admin_panel_settings_rounded;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(80)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 12),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  color: color,
                  fontSize: 10,
                  fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  String _cap(String s) =>
      s.split(' ').map((w) => w.isEmpty ? '' : '${w[0].toUpperCase()}${w.substring(1)}').join(' ');
}
