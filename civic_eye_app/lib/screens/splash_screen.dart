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
    // Minimum splash display time
    await Future.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;

    // Wait for auth provider to finish restoring session
    final auth = context.read<AuthProvider>();
    while (auth.isLoading) {
      await Future.delayed(const Duration(milliseconds: 50));
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
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primary, AppTheme.secondary],
                ),
                borderRadius: BorderRadius.circular(26),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withAlpha(100),
                    blurRadius: 30,
                    spreadRadius: 6,
                  ),
                ],
              ),
              child: const Icon(Icons.location_city_rounded,
                  size: 44, color: Colors.white),
            )
                .animate()
                .scale(duration: 600.ms, curve: Curves.elasticOut),
            const SizedBox(height: 24),
            const Text(
              'CivicEye',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 32,
                fontWeight: FontWeight.w800,
                letterSpacing: 1,
              ),
            ).animate(delay: 200.ms).fadeIn(duration: 400.ms),
            const SizedBox(height: 8),
            const Text(
              'Smart Urban Issue Reporting',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
            ).animate(delay: 300.ms).fadeIn(duration: 400.ms),
            const SizedBox(height: 48),
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: AppTheme.primary,
              ),
            ).animate(delay: 400.ms).fadeIn(),
          ],
        ),
      ),
    );
  }
}
