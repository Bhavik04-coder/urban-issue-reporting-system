import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  XFile? _image;
  Uint8List? _imageBytes; // cached bytes — works on web + mobile
  String _urgency = 'Medium';
  bool _submitting = false;
  bool _fetchingLocation = false;
  double _locationLat = 0.0;
  double _locationLong = 0.0;
  String? _locationAddress;

  static const _urgencies = ['Low', 'Medium', 'High'];
  static const _urgencyColors = {
    'Low': AppTheme.secondary,
    'Medium': AppTheme.warning,
    'High': AppTheme.accent,
  };

  static const _deptIcons = {
    'road_dept': Icons.construction_rounded,
    'water_dept': Icons.water_drop_outlined,
    'sanitation_dept': Icons.delete_outline_rounded,
    'electricity_dept': Icons.bolt_rounded,
    'other': Icons.report_problem_outlined,
  };

  static const _deptNames = {
    'road_dept': 'Road Department',
    'water_dept': 'Water Department',
    'sanitation_dept': 'Sanitation Department',
    'electricity_dept': 'Electricity Department',
    'other': 'General',
  };

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (file != null) {
        final bytes = await file.readAsBytes();
        setState(() {
          _image = file;
          _imageBytes = bytes;
        });
      }
    } catch (e) {
      _showSnack('Could not pick image: $e', isError: true);
    }
  }

  void _showImageSourceSheet() {
    // On web, camera is not supported — go straight to gallery
    if (kIsWeb) {
      _pickImage(ImageSource.gallery);
      return;
    }
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.textSecondary.withAlpha(60),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              const Text('Add Photo',
                  style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 17,
                      fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withAlpha(30),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.camera_alt_rounded,
                      color: AppTheme.primary),
                ),
                title: const Text('Take a Photo',
                    style: TextStyle(color: AppTheme.textPrimary)),
                subtitle: const Text('Use your camera',
                    style: TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12)),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.secondary.withAlpha(30),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.photo_library_rounded,
                      color: AppTheme.secondary),
                ),
                title: const Text('Choose from Gallery',
                    style: TextStyle(color: AppTheme.textPrimary)),
                subtitle: const Text('Pick an existing photo',
                    style: TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12)),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                },
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _fetchLocation() async {
    setState(() => _fetchingLocation = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _showSnack('Location services are disabled.');
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
        _showSnack('Location permission permanently denied. Enable in settings.');
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);
      setState(() {
        _locationLat = pos.latitude;
        _locationLong = pos.longitude;
        _locationAddress =
            '${pos.latitude.toStringAsFixed(5)}, ${pos.longitude.toStringAsFixed(5)}';
      });
    } catch (e) {
      _showSnack('Could not get location: $e');
    } finally {
      setState(() => _fetchingLocation = false);
    }
  }

  Future<void> _submit() async {
    if (_image == null) {
      _showSnack('Please add a photo of the issue.', isError: true);
      return;
    }
    if (_locationLat == 0.0 && _locationLong == 0.0) {
      _showSnack('Please capture your GPS location.', isError: true);
      return;
    }

    setState(() => _submitting = true);
    try {
      final auth = context.read<AuthProvider>();

      // Read image bytes — works on all platforms including web
      final bytes = await _image!.readAsBytes();
      if (bytes.isEmpty) {
        throw 'Image file is empty or could not be read.';
      }

      // Determine filename — fallback for web where name may be empty
      final rawName = _image!.name;
      // On web the name might be a blob URL — extract just the filename part
      String filename;
      if (rawName.isEmpty) {
        filename = 'report_image.jpg';
      } else if (rawName.contains('/') || rawName.contains('\\')) {
        filename = rawName.split(RegExp(r'[/\\]')).last;
        if (filename.isEmpty) filename = 'report_image.jpg';
      } else {
        filename = rawName;
      }
      // Ensure it has an extension
      if (!filename.contains('.')) filename = '$filename.jpg';

      debugPrint('📸 Submitting image: $filename, bytes: ${bytes.length}, '
          'lat: $_locationLat, lng: $_locationLong');

      final result = await ApiService.submitSmartReport(
        token: auth.token!,
        imageBytes: bytes,
        imageFilename: filename,
        locationLat: _locationLat,
        locationLong: _locationLong,
        locationAddress: _locationAddress,
        urgency: _urgency,
      );

      if (!mounted) return;
      setState(() => _submitting = false);
      _showSuccess(result);
    } catch (e) {
      if (!mounted) return;
      setState(() => _submitting = false);
      debugPrint('❌ Submit error: $e');
      _showSnack(e.toString(), isError: true);
    }
  }

  void _reset() {
    setState(() {
      _image = null;
      _imageBytes = null;
      _urgency = 'Medium';
      _locationLat = 0.0;
      _locationLong = 0.0;
      _locationAddress = null;
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

  void _showSuccess(Map<String, dynamic> result) {
    final ai = result['ai_result'] as Map<String, dynamic>? ?? {};
    final dept = ai['department'] as String? ?? 'other';
    final detectedIssue = ai['detected_issue'] as String? ?? 'issue';
    final confidence = ai['confidence'] as num? ?? 0;
    final title = ai['title'] as String? ?? 'Civic Issue';

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Dialog(
        backgroundColor: AppTheme.surfaceCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(28),
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
              const SizedBox(height: 16),
              // AI result card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withAlpha(20),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: AppTheme.primary.withAlpha(50), width: 1),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(
                          _deptIcons[dept] ?? Icons.report_problem_outlined,
                          color: AppTheme.primary,
                          size: 22,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(title,
                                  style: const TextStyle(
                                      color: AppTheme.textPrimary,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14)),
                              Text(
                                _deptNames[dept] ?? dept,
                                style: const TextStyle(
                                    color: AppTheme.textSecondary,
                                    fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Icon(Icons.psychology_rounded,
                            color: AppTheme.secondary, size: 14),
                        const SizedBox(width: 6),
                        Text(
                          'AI detected: $detectedIssue  •  ${confidence.toStringAsFixed(0)}% confidence',
                          style: const TextStyle(
                              color: AppTheme.secondary, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'The issue has been auto-assigned to the right department.',
                textAlign: TextAlign.center,
                style:
                    TextStyle(color: AppTheme.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _reset();
                  },
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
    final locationCaptured = _locationLat != 0.0;

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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Header hint ──────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppTheme.primary.withAlpha(30),
                          AppTheme.secondary.withAlpha(20),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                          color: AppTheme.primary.withAlpha(40), width: 1),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.auto_awesome_rounded,
                            color: AppTheme.primary, size: 20),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Just snap a photo and share your location — our AI will identify the issue and route it to the right department.',
                            style: TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 13,
                                height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(duration: 400.ms),

                  const SizedBox(height: 28),

                  // ── Step 1: Photo ────────────────────────────────────
                  _StepLabel(
                      step: '1',
                      label: 'Take or Upload a Photo',
                      done: _image != null),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: _showImageSourceSheet,
                    child: AnimatedContainer(
                      duration: 300.ms,
                      height: _image != null ? 220 : 140,
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceCard,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _image != null
                              ? AppTheme.primary.withAlpha(100)
                              : Colors.white.withAlpha(15),
                          width: _image != null ? 2 : 1,
                        ),
                      ),
                      child: _image != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(19),
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  _imageBytes != null
                                      ? Image.memory(_imageBytes!,
                                          fit: BoxFit.cover)
                                      : Image.network(_image!.path,
                                          fit: BoxFit.cover),
                                  // Change photo button
                                  Positioned(
                                    bottom: 10,
                                    right: 10,
                                    child: GestureDetector(
                                      onTap: _showImageSourceSheet,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: Colors.black.withAlpha(160),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.edit_rounded,
                                                color: Colors.white,
                                                size: 14),
                                            SizedBox(width: 4),
                                            Text('Change',
                                                style: TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 12)),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary.withAlpha(20),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                      Icons.add_a_photo_rounded,
                                      color: AppTheme.primary,
                                      size: 30),
                                ),
                                const SizedBox(height: 10),
                                const Text('Tap to add photo',
                                    style: TextStyle(
                                        color: AppTheme.textPrimary,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                const Text('Camera or gallery',
                                    style: TextStyle(
                                        color: AppTheme.textSecondary,
                                        fontSize: 12)),
                              ],
                            ),
                    ),
                  ).animate(delay: 100.ms).slideY(begin: 0.1).fadeIn(),

                  const SizedBox(height: 28),

                  // ── Step 2: Location ─────────────────────────────────
                  _StepLabel(
                      step: '2',
                      label: 'Capture Your Location',
                      done: locationCaptured),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: _fetchingLocation ? null : _fetchLocation,
                    child: AnimatedContainer(
                      duration: 250.ms,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: locationCaptured
                            ? AppTheme.secondary.withAlpha(20)
                            : AppTheme.surfaceCard,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: locationCaptured
                              ? AppTheme.secondary
                              : Colors.white.withAlpha(15),
                          width: locationCaptured ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: locationCaptured
                                  ? AppTheme.secondary.withAlpha(30)
                                  : AppTheme.primary.withAlpha(20),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: _fetchingLocation
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: AppTheme.secondary),
                                  )
                                : Icon(
                                    locationCaptured
                                        ? Icons.location_on_rounded
                                        : Icons.my_location_rounded,
                                    color: locationCaptured
                                        ? AppTheme.secondary
                                        : AppTheme.primary,
                                    size: 22,
                                  ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: locationCaptured
                                ? Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text('Location captured',
                                          style: TextStyle(
                                              color: AppTheme.secondary,
                                              fontWeight: FontWeight.w700,
                                              fontSize: 14)),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${_locationLat.toStringAsFixed(5)}, ${_locationLong.toStringAsFixed(5)}',
                                        style: const TextStyle(
                                            color: AppTheme.textSecondary,
                                            fontSize: 12),
                                      ),
                                    ],
                                  )
                                : const Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('Tap to get GPS location',
                                          style: TextStyle(
                                              color: AppTheme.textPrimary,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14)),
                                      SizedBox(height: 2),
                                      Text('Required for report',
                                          style: TextStyle(
                                              color: AppTheme.textSecondary,
                                              fontSize: 12)),
                                    ],
                                  ),
                          ),
                          if (locationCaptured)
                            GestureDetector(
                              onTap: _fetchLocation,
                              child: const Icon(Icons.refresh_rounded,
                                  color: AppTheme.textSecondary, size: 18),
                            ),
                        ],
                      ),
                    ),
                  ).animate(delay: 150.ms).slideY(begin: 0.1).fadeIn(),

                  const SizedBox(height: 28),

                  // ── Step 3: Urgency ──────────────────────────────────
                  _StepLabel(step: '3', label: 'Urgency Level', done: true),
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
                            margin:
                                EdgeInsets.only(right: u != 'High' ? 10 : 0),
                            padding: const EdgeInsets.symmetric(vertical: 14),
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
                  ).animate(delay: 200.ms).fadeIn(),

                  const SizedBox(height: 36),

                  // ── Submit button ────────────────────────────────────
                  SizedBox(
                    width: double.infinity,
                    child: GestureDetector(
                      onTap: _submitting ? null : _submit,
                      child: AnimatedContainer(
                        duration: 200.ms,
                        height: 58,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: (_image != null && locationCaptured)
                                ? [AppTheme.primary, AppTheme.primaryDark]
                                : [
                                    AppTheme.surfaceLight,
                                    AppTheme.surfaceLight
                                  ],
                          ),
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: (_image != null && locationCaptured)
                              ? [
                                  BoxShadow(
                                    color: AppTheme.primary.withAlpha(80),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  )
                                ]
                              : [],
                        ),
                        child: Center(
                          child: _submitting
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.white))
                              : Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.auto_awesome_rounded,
                                      color: (_image != null &&
                                              locationCaptured)
                                          ? Colors.white
                                          : AppTheme.textSecondary,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 10),
                                    Text(
                                      'Analyse & Submit',
                                      style: TextStyle(
                                          color: (_image != null &&
                                                  locationCaptured)
                                              ? Colors.white
                                              : AppTheme.textSecondary,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ),
                  ).animate(delay: 250.ms).slideY(begin: 0.3).fadeIn(),

                  const SizedBox(height: 12),
                  const Center(
                    child: Text(
                      'AI will auto-detect the issue type and assign the right department',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: AppTheme.textSecondary, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Shared widgets ─────────────────────────────────────────────────────────────

class _StepLabel extends StatelessWidget {
  final String step;
  final String label;
  final bool done;

  const _StepLabel(
      {required this.step, required this.label, required this.done});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        AnimatedContainer(
          duration: 300.ms,
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            color: done ? AppTheme.secondary : AppTheme.primary,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: done
                ? const Icon(Icons.check_rounded,
                    color: Colors.white, size: 14)
                : Text(step,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700)),
          ),
        ),
        const SizedBox(width: 10),
        Text(label,
            style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 15,
                fontWeight: FontWeight.w600)),
      ],
    );
  }
}
