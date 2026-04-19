import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/draft_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/report_provider.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();

  String _category = 'Road Maintenance';
  String _urgency = 'Medium';
  XFile? _image;
  bool _submitting = false;
  bool _fetchingLocation = false;
  double _locationLat = 0.0;
  double _locationLong = 0.0;

  static const _categories = [
    'Road Maintenance',
    'Water Supply',
    'Sanitation',
    'Electricity',
    'Public Works',
    'Other',
  ];

  static const _urgencies = ['Low', 'Medium', 'High'];

  static const _categoryIcons = {
    'Road Maintenance': Icons.construction_rounded,
    'Water Supply': Icons.water_drop_outlined,
    'Sanitation': Icons.delete_outline_rounded,
    'Electricity': Icons.bolt_rounded,
    'Public Works': Icons.account_balance_outlined,
    'Other': Icons.report_problem_outlined,
  };

  static const _urgencyColors = {
    'Low': AppTheme.secondary,
    'Medium': AppTheme.warning,
    'High': AppTheme.accent,
  };

  @override
  void initState() {
    super.initState();
    _loadDraftIfAny();
  }

  @override
  void dispose() {
    _saveDraftSync();
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _locationCtrl.dispose();
    super.dispose();
  }

  // Feature 10: Draft saving
  Future<void> _loadDraftIfAny() async {
    final draft = await DraftService.loadDraft();
    if (draft != null && mounted) {
      final savedAt = draft['saved_at'] as String?;
      if (savedAt != null) {
        final age = DateTime.now().difference(DateTime.parse(savedAt));
        if (age.inDays < 7) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) _showDraftRestorePrompt(draft);
          });
        }
      }
    }
  }

  void _saveDraftSync() {
    if (_titleCtrl.text.isEmpty && _descCtrl.text.isEmpty) return;
    DraftService.saveDraft(
      title: _titleCtrl.text,
      description: _descCtrl.text,
      category: _category,
      urgency: _urgency,
      location: _locationCtrl.text,
      lat: _locationLat,
      lng: _locationLong,
    );
  }

  void _showDraftRestorePrompt(Map<String, dynamic> draft) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceCard,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Restore Draft?',
            style: TextStyle(color: AppTheme.textPrimary)),
        content: const Text(
          'You have an unsaved report draft. Would you like to restore it?',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () {
              DraftService.clearDraft();
              Navigator.pop(context);
            },
            child: const Text('Discard',
                style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _titleCtrl.text = draft['title'] as String? ?? '';
                _descCtrl.text = draft['description'] as String? ?? '';
                _locationCtrl.text = draft['location'] as String? ?? '';
                _category =
                    draft['category'] as String? ?? 'Road Maintenance';
                _urgency = draft['urgency'] as String? ?? 'Medium';
                _locationLat =
                    (draft['lat'] as num?)?.toDouble() ?? 0.0;
                _locationLong =
                    (draft['lng'] as num?)?.toDouble() ?? 0.0;
              });
              Navigator.pop(context);
            },
            child: const Text('Restore'),
          ),
        ],
      ),
    );
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(
        source: ImageSource.gallery, imageQuality: 80);
    if (file != null) setState(() => _image = file);
  }

  Future<void> _fetchLocation() async {
    setState(() => _fetchingLocation = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _showSnack('Location services are disabled. Please enable them.');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showSnack('Location permission denied.');
          return;
        }
      }
      if (permission == LocationPermission.deniedForever) {
        _showSnack(
            'Location permission permanently denied. Enable it in settings.');
        return;
      }

      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      setState(() {
        _locationLat = pos.latitude;
        _locationLong = pos.longitude;
        _locationCtrl.text =
            '${pos.latitude.toStringAsFixed(5)}, ${pos.longitude.toStringAsFixed(5)}';
      });
    } catch (e) {
      _showSnack('Could not get location: $e');
    } finally {
      setState(() => _fetchingLocation = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);

    final auth = context.read<AuthProvider>();
    final result = await context.read<ReportProvider>().submitReport(
          token: auth.token!,
          userName: auth.user!.fullName,
          userMobile: auth.user!.mobile,
          userEmail: auth.user!.email,
          title: _titleCtrl.text.trim(),
          description: _descCtrl.text.trim(),
          category: _category,
          urgency: _urgency,
          locationAddress: _locationCtrl.text.trim().isEmpty
              ? null
              : _locationCtrl.text.trim(),
          locationLat: _locationLat,
          locationLong: _locationLong,
        );
    if (!mounted) return;

    if (result == null) {
      // Feature 2: Upload image if one was selected
      if (_image != null) {
        try {
          final reportId = context.read<ReportProvider>().lastSubmittedId;
          if (reportId != null && !kIsWeb) {
            await ApiService.uploadReportImage(
              auth.token!,
              reportId,
              File(_image!.path),
            );
          }
        } catch (_) {
          // Image upload failure is non-fatal
        }
      }
      // Feature 10: Clear draft on successful submission
      await DraftService.clearDraft();
      if (!mounted) return;
      setState(() => _submitting = false);
      _showSuccess();
      _reset();
    } else {
      setState(() => _submitting = false);
      _showSnack(result, isError: true);
    }
  }

  void _reset() {
    _titleCtrl.clear();
    _descCtrl.clear();
    _locationCtrl.clear();
    setState(() {
      _category = 'Road Maintenance';
      _urgency = 'Medium';
      _image = null;
      _locationLat = 0.0;
      _locationLong = 0.0;
    });
  }

  void _showSnack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppTheme.accent : AppTheme.secondary,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  void _showSuccess() {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        backgroundColor: AppTheme.surfaceCard,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppTheme.secondary.withAlpha(30),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded,
                    color: AppTheme.secondary, size: 40),
              ).animate().scale(duration: 400.ms, curve: Curves.elasticOut),
              const SizedBox(height: 20),
              const Text('Report Submitted!',
                  style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 20,
                      fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              const Text(
                'Your issue has been recorded and will be reviewed by the concerned department.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: AppTheme.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Done'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: CustomScrollView(
        slivers: [
          const SliverAppBar(
            pinned: true,
            backgroundColor: AppTheme.bgDark,
            title: Text('Report an Issue'),
            automaticallyImplyLeading: false,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category picker
                    const _SectionLabel(label: 'Category'),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 48,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _categories.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(width: 8),
                        itemBuilder: (_, i) {
                          final cat = _categories[i];
                          final selected = cat == _category;
                          return GestureDetector(
                            onTap: () =>
                                setState(() => _category = cat),
                            child: AnimatedContainer(
                              duration: 200.ms,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 10),
                              decoration: BoxDecoration(
                                color: selected
                                    ? AppTheme.primary
                                    : AppTheme.surfaceCard,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: selected
                                      ? AppTheme.primary
                                      : Colors.white.withAlpha(15),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    _categoryIcons[cat] ??
                                        Icons.report_problem_outlined,
                                    size: 16,
                                    color: selected
                                        ? Colors.white
                                        : AppTheme.textSecondary,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(cat,
                                      style: TextStyle(
                                          color: selected
                                              ? Colors.white
                                              : AppTheme.textSecondary,
                                          fontSize: 13,
                                          fontWeight: selected
                                              ? FontWeight.w600
                                              : FontWeight.w400)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ).animate(delay: 100.ms).fadeIn(),

                    const SizedBox(height: 24),

                    // Title
                    const _SectionLabel(label: 'Issue Title'),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _titleCtrl,
                      style: const TextStyle(
                          color: AppTheme.textPrimary, fontSize: 15),
                      decoration: const InputDecoration(
                        hintText: 'e.g. Large pothole on Main Street',
                        prefixIcon: Icon(Icons.title_rounded,
                            color: AppTheme.textSecondary, size: 20),
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 20, vertical: 18),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().length < 5) {
                          return 'Title must be at least 5 characters';
                        }
                        return null;
                      },
                    ).animate(delay: 150.ms).slideY(begin: 0.1).fadeIn(),

                    const SizedBox(height: 20),

                    // Description
                    const _SectionLabel(label: 'Description'),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _descCtrl,
                      maxLines: 4,
                      style: const TextStyle(
                          color: AppTheme.textPrimary, fontSize: 15),
                      decoration: const InputDecoration(
                        hintText: 'Describe the issue in detail...',
                        prefixIcon: Padding(
                          padding: EdgeInsets.only(bottom: 60),
                          child: Icon(Icons.description_outlined,
                              color: AppTheme.textSecondary, size: 20),
                        ),
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 20, vertical: 18),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().length < 10) {
                          return 'Please provide more detail (min 10 chars)';
                        }
                        return null;
                      },
                    ).animate(delay: 200.ms).slideY(begin: 0.1).fadeIn(),

                    const SizedBox(height: 20),

                    // Location
                    const _SectionLabel(label: 'Location'),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _locationCtrl,
                            style: const TextStyle(
                                color: AppTheme.textPrimary, fontSize: 15),
                            decoration: const InputDecoration(
                              hintText: 'Street address or tap GPS',
                              prefixIcon: Icon(Icons.location_on_outlined,
                                  color: AppTheme.textSecondary, size: 20),
                              contentPadding: EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 18),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: _fetchingLocation ? null : _fetchLocation,
                          child: AnimatedContainer(
                            duration: 200.ms,
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: _locationLat != 0.0
                                  ? AppTheme.secondary.withAlpha(40)
                                  : AppTheme.surfaceCard,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: _locationLat != 0.0
                                    ? AppTheme.secondary
                                    : Colors.white.withAlpha(15),
                              ),
                            ),
                            child: _fetchingLocation
                                ? const Padding(
                                    padding: EdgeInsets.all(14),
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: AppTheme.secondary),
                                  )
                                : Icon(
                                    Icons.my_location_rounded,
                                    color: _locationLat != 0.0
                                        ? AppTheme.secondary
                                        : AppTheme.textSecondary,
                                    size: 22,
                                  ),
                          ),
                        ),
                      ],
                    ).animate(delay: 250.ms).slideY(begin: 0.1).fadeIn(),

                    if (_locationLat != 0.0) ...[
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.check_circle_outline,
                              size: 13, color: AppTheme.secondary),
                          const SizedBox(width: 4),
                          Text(
                            'GPS: ${_locationLat.toStringAsFixed(4)}, ${_locationLong.toStringAsFixed(4)}',
                            style: const TextStyle(
                                color: AppTheme.secondary, fontSize: 11),
                          ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 24),

                    // Urgency
                    const _SectionLabel(label: 'Urgency Level'),
                    const SizedBox(height: 12),
                    Row(
                      children: _urgencies.map((u) {
                        final selected = u == _urgency;
                        final color = _urgencyColors[u]!;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _urgency = u),
                            child: AnimatedContainer(
                              duration: 200.ms,
                              margin: EdgeInsets.only(
                                  right: u != 'High' ? 10 : 0),
                              padding: const EdgeInsets.symmetric(
                                  vertical: 14),
                              decoration: BoxDecoration(
                                color: selected
                                    ? color.withAlpha(40)
                                    : AppTheme.surfaceCard,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: selected
                                      ? color
                                      : Colors.white.withAlpha(15),
                                  width: selected ? 2 : 1,
                                ),
                              ),
                              child: Column(
                                children: [
                                  Icon(
                                    u == 'High'
                                        ? Icons.warning_rounded
                                        : u == 'Medium'
                                            ? Icons.info_outline
                                            : Icons.check_circle_outline,
                                    color: selected
                                        ? color
                                        : AppTheme.textSecondary,
                                    size: 22,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(u,
                                      style: TextStyle(
                                          color: selected
                                              ? color
                                              : AppTheme.textSecondary,
                                          fontSize: 13,
                                          fontWeight: selected
                                              ? FontWeight.w700
                                              : FontWeight.w400)),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ).animate(delay: 300.ms).fadeIn(),

                    const SizedBox(height: 24),

                    // Image
                    const _SectionLabel(label: 'Attach Photo (optional)'),
                    const SizedBox(height: 12),
                    GestureDetector(
                      onTap: _pickImage,
                      child: AnimatedContainer(
                        duration: 300.ms,
                        height: _image != null ? 200 : 120,
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceCard,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: _image != null
                                ? AppTheme.primary.withAlpha(80)
                                : Colors.white.withAlpha(15),
                            width: _image != null ? 2 : 1,
                          ),
                        ),
                        child: _image != null
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(17),
                                child: Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    kIsWeb
                                        ? Image.network(_image!.path,
                                            fit: BoxFit.cover)
                                        : Image.file(File(_image!.path),
                                            fit: BoxFit.cover),
                                    Positioned(
                                      top: 8,
                                      right: 8,
                                      child: GestureDetector(
                                        onTap: () => setState(
                                            () => _image = null),
                                        child: Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: Colors.black
                                                .withAlpha(150),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.close,
                                              color: Colors.white,
                                              size: 16),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : const Column(
                                mainAxisAlignment:
                                    MainAxisAlignment.center,
                                children: [
                                  Icon(
                                      Icons.add_photo_alternate_outlined,
                                      color: AppTheme.textSecondary,
                                      size: 32),
                                  SizedBox(height: 8),
                                  Text('Tap to add photo',
                                      style: TextStyle(
                                          color: AppTheme.textSecondary,
                                          fontSize: 13)),
                                ],
                              ),
                      ),
                    ).animate(delay: 350.ms).fadeIn(),

                    const SizedBox(height: 32),

                    // Submit
                    SizedBox(
                      width: double.infinity,
                      child: GestureDetector(
                        onTap: _submitting ? null : _submit,
                        child: Container(
                          height: 56,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                AppTheme.primary,
                                AppTheme.primaryDark
                              ],
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primary.withAlpha(80),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Center(
                            child: _submitting
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white))
                                : const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.send_rounded,
                                          color: Colors.white, size: 20),
                                      SizedBox(width: 10),
                                      Text('Submit Report',
                                          style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 16,
                                              fontWeight:
                                                  FontWeight.w700)),
                                    ],
                                  ),
                          ),
                        ),
                      ),
                    ).animate(delay: 400.ms).slideY(begin: 0.3).fadeIn(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(label,
        style: const TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 15,
            fontWeight: FontWeight.w600));
  }
}
