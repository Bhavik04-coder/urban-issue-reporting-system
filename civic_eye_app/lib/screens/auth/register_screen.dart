import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../home/home_screen.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _mobileCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _mobileCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  int _strength(String p) {
    int s = 0;
    if (p.length >= 8) s++;
    if (p.contains(RegExp(r'[A-Z]'))) s++;
    if (p.contains(RegExp(r'[a-z]'))) s++;
    if (p.contains(RegExp(r'[0-9]'))) s++;
    if (p.contains(RegExp(r'[!@#$%^&*]'))) s++;
    return s;
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final error = await context.read<AuthProvider>().register(
          email: _emailCtrl.text,
          password: _passCtrl.text,
          fullName: _nameCtrl.text,
          mobile: _mobileCtrl.text,
        );
    if (!mounted) return;
    setState(() => _loading = false);
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(error),
        backgroundColor: AppTheme.accent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ));
    } else {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (_) => const HomeScreen()), (_) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pass = _passCtrl.text;
    final s = _strength(pass);
    final strengthColors = [
      Colors.transparent,
      AppTheme.accent,
      AppTheme.warning,
      AppTheme.warning,
      AppTheme.secondary,
      AppTheme.secondary,
    ];
    final strengthLabels = ['', 'Weak', 'Fair', 'Fair', 'Good', 'Strong'];

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.bgDark, Color(0xFF1A1A2E)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_ios_new,
                      color: AppTheme.textPrimary, size: 20),
                  padding: EdgeInsets.zero,
                ),
                const SizedBox(height: 24),
                const Text('Create\nAccount ✨',
                    style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                        height: 1.2))
                    .animate()
                    .slideX(begin: -0.2, duration: 500.ms)
                    .fadeIn(),
                const SizedBox(height: 8),
                const Text('Join CivicEye and help improve your city',
                    style: TextStyle(
                        fontSize: 15, color: AppTheme.textSecondary))
                    .animate(delay: 100.ms)
                    .fadeIn(),
                const SizedBox(height: 36),
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      _Field(
                        ctrl: _nameCtrl,
                        label: 'Full Name',
                        icon: Icons.person_outline,
                        validator: (v) {
                          if (v == null || v.trim().length < 2) {
                            return 'Enter your full name';
                          }
                          return null;
                        },
                      ).animate(delay: 200.ms).slideY(begin: 0.2).fadeIn(),
                      const SizedBox(height: 14),
                      _Field(
                        ctrl: _emailCtrl,
                        label: 'Email address',
                        icon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: (v) {
                          if (v == null || !v.contains('@')) {
                            return 'Enter a valid email';
                          }
                          return null;
                        },
                      ).animate(delay: 250.ms).slideY(begin: 0.2).fadeIn(),
                      const SizedBox(height: 14),
                      _Field(
                        ctrl: _mobileCtrl,
                        label: 'Mobile Number',
                        icon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                        validator: (v) {
                          if (v == null || !RegExp(r'^\d{10}$').hasMatch(v)) {
                            return 'Enter a valid 10-digit number';
                          }
                          return null;
                        },
                      ).animate(delay: 300.ms).slideY(begin: 0.2).fadeIn(),
                      const SizedBox(height: 14),
                      StatefulBuilder(builder: (ctx, setSt) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _Field(
                              ctrl: _passCtrl,
                              label: 'Password',
                              icon: Icons.lock_outline,
                              obscureText: _obscure,
                              suffix: IconButton(
                                icon: Icon(
                                    _obscure
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                    color: AppTheme.textSecondary,
                                    size: 20),
                                onPressed: () {
                                  setState(() => _obscure = !_obscure);
                                  setSt(() {});
                                },
                              ),
                              onChanged: (_) => setSt(() {}),
                              validator: (v) {
                                if (v == null || v.length < 8) {
                                  return 'Min 8 characters';
                                }
                                if (!v.contains(RegExp(r'[A-Z]'))) {
                                  return 'Add an uppercase letter';
                                }
                                if (!v.contains(RegExp(r'[0-9]'))) {
                                  return 'Add a number';
                                }
                                return null;
                              },
                            ),
                            if (pass.isNotEmpty) ...[
                              const SizedBox(height: 10),
                              Row(
                                children: List.generate(5, (i) {
                                  return Expanded(
                                    child: Container(
                                      height: 4,
                                      margin: EdgeInsets.only(
                                          right: i < 4 ? 4 : 0),
                                      decoration: BoxDecoration(
                                        color: i < s
                                            ? strengthColors[s]
                                            : AppTheme.surfaceLight,
                                        borderRadius: BorderRadius.circular(2),
                                      ),
                                    ),
                                  );
                                }),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                s > 0 ? strengthLabels[s] : '',
                                style: TextStyle(
                                    fontSize: 11,
                                    color: strengthColors[s],
                                    fontWeight: FontWeight.w600),
                              ),
                            ],
                          ],
                        );
                      }).animate(delay: 350.ms).slideY(begin: 0.2).fadeIn(),
                      const SizedBox(height: 14),
                      _Field(
                        ctrl: _confirmCtrl,
                        label: 'Confirm Password',
                        icon: Icons.lock_person_outlined,
                        obscureText: _obscure,
                        validator: (v) {
                          if (v != _passCtrl.text) {
                            return 'Passwords do not match';
                          }
                          return null;
                        },
                      ).animate(delay: 400.ms).slideY(begin: 0.2).fadeIn(),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: _GradBtn(
                      label: 'Create Account',
                      loading: _loading,
                      onTap: _register),
                ).animate(delay: 450.ms).slideY(begin: 0.3).fadeIn(),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Already have an account? ',
                        style: TextStyle(
                            color: AppTheme.textSecondary, fontSize: 14)),
                    GestureDetector(
                      onTap: () => Navigator.pushReplacement(context,
                          MaterialPageRoute(
                              builder: (_) => const LoginScreen())),
                      child: const Text('Sign In',
                          style: TextStyle(
                              color: AppTheme.primary,
                              fontSize: 14,
                              fontWeight: FontWeight.w700)),
                    ),
                  ],
                ).animate(delay: 500.ms).fadeIn(),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final TextEditingController ctrl;
  final String label;
  final IconData icon;
  final bool obscureText;
  final TextInputType? keyboardType;
  final Widget? suffix;
  final ValueChanged<String>? onChanged;
  final String? Function(String?)? validator;

  const _Field({
    required this.ctrl,
    required this.label,
    required this.icon,
    this.obscureText = false,
    this.keyboardType,
    this.suffix,
    this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: ctrl,
      obscureText: obscureText,
      keyboardType: keyboardType,
      onChanged: onChanged,
      validator: validator,
      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppTheme.textSecondary, size: 20),
        suffixIcon: suffix,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      ),
    );
  }
}

class _GradBtn extends StatelessWidget {
  final String label;
  final bool loading;
  final VoidCallback onTap;
  const _GradBtn(
      {required this.label, required this.loading, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: loading ? null : onTap,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
              colors: [AppTheme.primary, AppTheme.primaryDark]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: AppTheme.primary.withAlpha(80),
                blurRadius: 20,
                offset: const Offset(0, 8))
          ],
        ),
        child: Center(
          child: loading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.white))
              : Text(label,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700)),
        ),
      ),
    );
  }
}
