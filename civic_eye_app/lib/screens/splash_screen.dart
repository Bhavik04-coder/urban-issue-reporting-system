import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'home/home_screen.dart';
import 'admin/admin_shell.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    // Wait for a minimum time to show splash
    await Future.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;

    // Now wait for auth provider to finish restoring session
    final auth = context.read<AuthProvider>();
    while (auth.isLoading) {
      await Future.delayed(const Duration(milliseconds: 100));
    }

    if (!mounted) return;
    _go(auth.isLoggedIn
        ? (auth.isAdmin ? const AdminShell() : const HomeScreen())
        : const LoginScreen());
  }

  void _go(Widget screen) {
    Navigator.pushReplacement(
        context, MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primary, AppTheme.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withAlpha(100),
                    blurRadius: 40,
                    spreadRadius: 10,
                  ),
                ],
              ),
              child: const Icon(Icons.location_city_rounded,
                  size: 52, color: Colors.white),
            )
                .animate()
                .scale(duration: 600.ms, curve: Curves.elasticOut)
                .fadeIn(duration: 400.ms),
            const SizedBox(height: 24),
            const Text(
              'CivicEye',
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
                letterSpacing: 1.5,
              ),
            )
                .animate(delay: 300.ms)
                .slideY(begin: 0.3, duration: 500.ms, curve: Curves.easeOut)
                .fadeIn(duration: 500.ms),
            const SizedBox(height: 8),
            const Text(
              'Smart Urban Issue Reporting',
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
                letterSpacing: 0.5,
              ),
            ).animate(delay: 500.ms).fadeIn(duration: 500.ms),
            const SizedBox(height: 60),
            const SizedBox(
              width: 36,
              height: 36,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppTheme.primary,
              ),
            ).animate(delay: 600.ms).fadeIn(duration: 400.ms),
            const SizedBox(height: 16),
            const Text(
              'Initializing...',
              style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                  letterSpacing: 0.5),
            ).animate(delay: 700.ms).fadeIn(duration: 400.ms),
          ],
        ),
      ),
    );
  }
}
