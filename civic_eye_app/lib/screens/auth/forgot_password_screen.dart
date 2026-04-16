import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  final _tokenCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _loading = false;
  bool _tokenSent = false;
  bool _obscurePass = true;
  String? _devToken; // shown in dev mode

  @override
  void dispose() {
    _emailCtrl.dispose();
    _tokenCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendToken() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) {
      _snack('Please enter your email');
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await ApiService.forgotPassword(email);
      setState(() {
        _tokenSent = true;
        _devToken = res['dev_token'] as String?;
        if (_devToken != null) _tokenCtrl.text = _devToken!;
      });
      _snack('Reset token sent! (dev token pre-filled below)',
          isError: false);
    } catch (e) {
      _snack(e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _resetPassword() async {
    final token = _tokenCtrl.text.trim();
    final pass = _passCtrl.text;
    final confirm = _confirmCtrl.text;

    if (token.isEmpty || pass.isEmpty) {
      _snack('Please fill all fields');
      return;
    }
    if (pass != confirm) {
      _snack('Passwords do not match');
      return;
    }

    setState(() => _loading = true);
    try {
      await ApiService.resetPassword(token, pass);
      if (mounted) {
        _snack('Password reset successfully!', isError: false);
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.pop(context);
      }
    } catch (e) {
      _snack(e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _snack(String msg, {bool isError = true}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppTheme.accent : AppTheme.secondary,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppTheme.bgDark : AppTheme.bgLight;
    final textPrimary =
        isDark ? AppTheme.textPrimary : AppTheme.textPrimaryLight;
    final textSecondary =
        isDark ? AppTheme.textSecondary : AppTheme.textSecondaryLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Reset Password',
            style: TextStyle(color: textPrimary)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Center(
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withAlpha(20),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.lock_reset_rounded,
                    color: AppTheme.primary, size: 40),
              ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
            ),
            const SizedBox(height: 24),

            Text(
              _tokenSent ? 'Enter Reset Token' : 'Forgot Password?',
              style: TextStyle(
                  color: textPrimary,
                  fontSize: 24,
                  fontWeight: FontWeight.w800),
            ).animate().fadeIn(),
            const SizedBox(height: 8),
            Text(
              _tokenSent
                  ? 'Enter the token sent to your email and choose a new password.'
                  : 'Enter your email address and we\'ll send you a reset token.',
              style: TextStyle(color: textSecondary, fontSize: 14),
            ).animate(delay: 100.ms).fadeIn(),

            const SizedBox(height: 32),

            if (!_tokenSent) ...[
              // Email field
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                style: TextStyle(color: textPrimary),
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: Icon(Icons.email_outlined,
                      color: textSecondary, size: 20),
                ),
              ).animate(delay: 200.ms).slideY(begin: 0.2).fadeIn(),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _sendToken,
                  child: _loading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Send Reset Token'),
                ),
              ).animate(delay: 300.ms).slideY(begin: 0.2).fadeIn(),
            ] else ...[
              // Token field
              TextField(
                controller: _tokenCtrl,
                style: TextStyle(color: textPrimary, fontFamily: 'monospace'),
                decoration: InputDecoration(
                  labelText: 'Reset Token',
                  prefixIcon: Icon(Icons.vpn_key_outlined,
                      color: textSecondary, size: 20),
                ),
              ).animate(delay: 200.ms).slideY(begin: 0.2).fadeIn(),
              const SizedBox(height: 16),

              // New password
              TextField(
                controller: _passCtrl,
                obscureText: _obscurePass,
                style: TextStyle(color: textPrimary),
                decoration: InputDecoration(
                  labelText: 'New Password',
                  prefixIcon: Icon(Icons.lock_outline,
                      color: textSecondary, size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePass
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      color: textSecondary,
                      size: 20,
                    ),
                    onPressed: () =>
                        setState(() => _obscurePass = !_obscurePass),
                  ),
                ),
              ).animate(delay: 250.ms).slideY(begin: 0.2).fadeIn(),
              const SizedBox(height: 16),

              // Confirm password
              TextField(
                controller: _confirmCtrl,
                obscureText: _obscurePass,
                style: TextStyle(color: textPrimary),
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  prefixIcon: Icon(Icons.lock_outline,
                      color: textSecondary, size: 20),
                ),
              ).animate(delay: 300.ms).slideY(begin: 0.2).fadeIn(),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _resetPassword,
                  child: _loading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Reset Password'),
                ),
              ).animate(delay: 350.ms).slideY(begin: 0.2).fadeIn(),

              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () =>
                      setState(() => _tokenSent = false),
                  child: Text('← Back to email entry',
                      style: TextStyle(color: textSecondary)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
