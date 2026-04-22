import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../models/report_model.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/notification_bell.dart';
import '../../widgets/report_image_viewer.dart';

class ReportDetailScreen extends StatefulWidget {
  final ReportModel report;
  const ReportDetailScreen({super.key, required this.report});

  @override
  State<ReportDetailScreen> createState() => _ReportDetailScreenState();
}

class _ReportDetailScreenState extends State<ReportDetailScreen> {
  Map<String, dynamic>? _timeline;
  bool _loading = true;
  bool _confirmed = false;
  int _confirmCount = 0;
  bool _confirmLoading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final token = context.read<AuthProvider>().token;
    try {
      final data =
          await ApiService.getReportTimeline(widget.report.id!);
      Map<String, dynamic>? confirmStatus;
      if (token != null) {
        try {
          confirmStatus = await ApiService.getConfirmStatus(
              token, widget.report.id!);
        } catch (_) {}
      }
      if (mounted) {
        setState(() {
          _timeline = data;
          _confirmed = confirmStatus?['confirmed'] as bool? ?? false;
          _confirmCount = (confirmStatus?['confirmation_count'] as int?) ??
              (data['confirmation_count'] as int? ?? 0);
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggleConfirm() async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;
    setState(() => _confirmLoading = true);
    try {
      if (_confirmed) {
        await ApiService.unconfirmReport(token, widget.report.id!);
        setState(() {
          _confirmed = false;
          _confirmCount = (_confirmCount - 1).clamp(0, 9999);
        });
      } else {
        final res =
            await ApiService.confirmReport(token, widget.report.id!);
        setState(() {
          _confirmed = true;
          _confirmCount = res['confirmation_count'] as int? ?? _confirmCount + 1;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppTheme.accent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _confirmLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor =
        isDark ? AppTheme.surfaceCard : AppTheme.surfaceCardLight;
    final textPrimary =
        isDark ? AppTheme.textPrimary : AppTheme.textPrimaryLight;
    final textSecondary =
        isDark ? AppTheme.textSecondary : AppTheme.textSecondaryLight;
    final bg = isDark ? AppTheme.bgDark : AppTheme.bgLight;

    final details = _timeline?['complaint_details'] as Map<String, dynamic>?;
    final timelineEvents =
        _timeline?['timeline'] as List<dynamic>? ?? [];

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        title: Text(
          'Report #${widget.report.id?.toString().padLeft(5, '0') ?? '?'}',
          style: TextStyle(color: textPrimary),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          const NotificationBell(),
          // Feature 8: Confirm / Upvote button
          _confirmLoading
              ? const Padding(
                  padding: EdgeInsets.all(12),
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppTheme.primary),
                  ),
                )
              : TextButton.icon(
                  onPressed: _toggleConfirm,
                  icon: Icon(
                    _confirmed
                        ? Icons.thumb_up_rounded
                        : Icons.thumb_up_outlined,
                    color: _confirmed ? AppTheme.primary : textSecondary,
                    size: 18,
                  ),
                  label: Text(
                    '$_confirmCount',
                    style: TextStyle(
                      color: _confirmed ? AppTheme.primary : textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Status badge ──────────────────────────────────
                  _StatusBanner(
                    status: details?['status'] as String? ??
                        widget.report.status,
                    cardColor: cardColor,
                  ).animate().fadeIn(),

                  const SizedBox(height: 16),

                  // ── Details card ──────────────────────────────────
                  _DetailsCard(
                    report: widget.report,
                    details: details,
                    cardColor: cardColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                  ).animate(delay: 100.ms).slideY(begin: 0.1).fadeIn(),

                  const SizedBox(height: 16),

                  // ── Images ────────────────────────────────────────
                  if (widget.report.images.isNotEmpty)
                    _ImagesCard(
                      images: widget.report.images,
                      cardColor: cardColor,
                      textPrimary: textPrimary,
                    ).animate(delay: 150.ms).slideY(begin: 0.1).fadeIn(),

                  if (widget.report.images.isNotEmpty)
                    const SizedBox(height: 16),

                  // ── Location mini-map placeholder ─────────────────
                  if ((widget.report.latitude ?? 0) != 0 ||
                      (widget.report.longitude ?? 0) != 0)
                    _LocationCard(
                      lat: widget.report.latitude ?? 0,
                      lng: widget.report.longitude ?? 0,
                      address: widget.report.locationAddress,
                      cardColor: cardColor,
                      textPrimary: textPrimary,
                      textSecondary: textSecondary,
                    ).animate(delay: 200.ms).slideY(begin: 0.1).fadeIn(),

                  const SizedBox(height: 16),

                  // ── Timeline stepper ──────────────────────────────
                  _TimelineStepper(
                    events: timelineEvents,
                    cardColor: cardColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                  ).animate(delay: 300.ms).slideY(begin: 0.1).fadeIn(),
                ],
              ),
            ),
    );
  }
}

// ── Status Banner ─────────────────────────────────────────────────────────────

class _StatusBanner extends StatelessWidget {
  final String status;
  final Color cardColor;
  const _StatusBanner({required this.status, required this.cardColor});

  Color _color() {
    switch (status) {
      case 'Resolved':
        return AppTheme.statusResolved;
      case 'In Progress':
        return AppTheme.statusInProgress;
      case 'Rejected':
        return AppTheme.statusRejected;
      default:
        return AppTheme.statusPending;
    }
  }

  IconData _icon() {
    switch (status) {
      case 'Resolved':
        return Icons.check_circle_rounded;
      case 'In Progress':
        return Icons.pending_rounded;
      case 'Rejected':
        return Icons.cancel_rounded;
      default:
        return Icons.schedule_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = _color();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: c.withAlpha(20),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.withAlpha(60)),
      ),
      child: Row(
        children: [
          Icon(_icon(), color: c, size: 28),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Status',
                  style: TextStyle(color: c.withAlpha(180), fontSize: 11)),
              Text(status,
                  style: TextStyle(
                      color: c,
                      fontSize: 18,
                      fontWeight: FontWeight.w800)),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Details Card ──────────────────────────────────────────────────────────────

class _DetailsCard extends StatelessWidget {
  final ReportModel report;
  final Map<String, dynamic>? details;
  final Color cardColor, textPrimary, textSecondary;

  const _DetailsCard({
    required this.report,
    required this.details,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
  });

  @override
  Widget build(BuildContext context) {
    final dept = details?['department'] as String? ??
        report.department ??
        'Not assigned';
    final date = DateTime.tryParse(report.createdAt);
    final dateStr =
        date != null ? DateFormat('MMM d, yyyy • h:mm a').format(date) : '';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(report.title,
              style: TextStyle(
                  color: textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text(report.description,
              style: TextStyle(color: textSecondary, fontSize: 14, height: 1.5)),
          const SizedBox(height: 16),
          _Row(Icons.category_outlined, 'Category', report.category,
              textPrimary, textSecondary),
          _Row(Icons.priority_high_rounded, 'Urgency', report.urgency,
              textPrimary, textSecondary),
          _Row(Icons.business_rounded, 'Department', dept, textPrimary,
              textSecondary),
          _Row(Icons.calendar_today_outlined, 'Submitted', dateStr,
              textPrimary, textSecondary),
          if (report.aiConfidence != null)
            _Row(
              Icons.psychology_rounded,
              'AI Confidence',
              '${report.aiConfidence!.toStringAsFixed(1)}%',
              textPrimary,
              textSecondary,
            ),
          if (report.priority != 'Normal')
            _Row(
              Icons.flag_rounded,
              'Priority',
              report.priority,
              textPrimary,
              textSecondary,
            ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color textPrimary, textSecondary;
  const _Row(this.icon, this.label, this.value, this.textPrimary,
      this.textSecondary);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppTheme.primary, size: 16),
          const SizedBox(width: 10),
          SizedBox(
            width: 90,
            child: Text(label,
                style: TextStyle(color: textSecondary, fontSize: 12)),
          ),
          Expanded(
            child: Text(value,
                style: TextStyle(
                    color: textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

// ── Images Card ───────────────────────────────────────────────────────────────

class _ImagesCard extends StatelessWidget {
  final List<String> images;
  final Color cardColor;
  final Color textPrimary;

  const _ImagesCard({
    required this.images,
    required this.cardColor,
    required this.textPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.photo_library_rounded,
                  color: AppTheme.primary, size: 18),
              const SizedBox(width: 8),
              Text('Photos (${images.length})',
                  style: TextStyle(
                      color: textPrimary,
                      fontSize: 15,
                      fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 12),
          ReportImageStrip(
            images: images,
            baseUrl: ApiService.baseUrl,
          ),
        ],
      ),
    );
  }
}

// ── Location Card ─────────────────────────────────────────────────────────────

class _LocationCard extends StatelessWidget {
  final double lat, lng;
  final String? address;
  final Color cardColor, textPrimary, textSecondary;

  const _LocationCard({
    required this.lat,
    required this.lng,
    required this.address,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
  });

  Future<void> _openInMaps() async {
    // Try Google Maps app first, fall back to browser
    final googleMapsUrl =
        Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    if (await canLaunchUrl(googleMapsUrl)) {
      await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.location_on_rounded,
                  color: AppTheme.accent, size: 18),
              const SizedBox(width: 8),
              Text('Location',
                  style: TextStyle(
                      color: textPrimary,
                      fontSize: 15,
                      fontWeight: FontWeight.w700)),
              const Spacer(),
              GestureDetector(
                onTap: _openInMaps,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withAlpha(25),
                    borderRadius: BorderRadius.circular(20),
                    border:
                        Border.all(color: AppTheme.primary.withAlpha(60)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.open_in_new_rounded,
                          color: AppTheme.primary, size: 13),
                      SizedBox(width: 4),
                      Text('Open in Maps',
                          style: TextStyle(
                              color: AppTheme.primary,
                              fontSize: 11,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Tappable map preview card
          GestureDetector(
            onTap: _openInMaps,
            child: Container(
              height: 130,
              decoration: BoxDecoration(
                color: AppTheme.primary.withAlpha(15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.primary.withAlpha(40)),
              ),
              child: Stack(
                children: [
                  // Background grid pattern to suggest a map
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CustomPaint(
                      size: const Size(double.infinity, 130),
                      painter: _MapGridPainter(),
                    ),
                  ),
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.accent,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.accent.withAlpha(100),
                                blurRadius: 12,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Icon(Icons.location_on_rounded,
                              color: Colors.white, size: 22),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${lat.toStringAsFixed(5)}, ${lng.toStringAsFixed(5)}',
                          style: TextStyle(
                              color: textSecondary,
                              fontSize: 11,
                              fontFamily: 'monospace'),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tap to view on Google Maps',
                          style: TextStyle(
                              color: AppTheme.primary,
                              fontSize: 11,
                              fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (address != null && address!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(Icons.place_outlined, color: textSecondary, size: 14),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(address!,
                      style:
                          TextStyle(color: textSecondary, fontSize: 12)),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

/// Simple grid painter to give the map card a map-like feel
class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.primary.withAlpha(12)
      ..strokeWidth = 1;

    const step = 20.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ── Timeline Stepper ──────────────────────────────────────────────────────────

class _TimelineStepper extends StatelessWidget {
  final List<dynamic> events;
  final Color cardColor, textPrimary, textSecondary;

  const _TimelineStepper({
    required this.events,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
  });

  // Steps in order — Rejected is handled separately as an alternate end state
  static const _steps = [
    'Submitted',
    'Assigned',
    'In Progress',
    'Resolved',
  ];

  @override
  Widget build(BuildContext context) {
    // Build a map of event name → event data for quick lookup
    final eventMap = <String, Map<String, dynamic>>{};
    for (final e in events) {
      final ev = e as Map<String, dynamic>;
      final name = ev['event'] as String? ?? '';
      if (name.isNotEmpty) eventMap[name] = ev;
    }

    final hasRejected = eventMap.containsKey('Rejected');

    // Determine which steps to show: if rejected, replace Resolved with Rejected
    final displaySteps = hasRejected
        ? ['Submitted', 'Assigned', 'Rejected']
        : _steps;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.timeline_rounded,
                  color: AppTheme.primary, size: 18),
              const SizedBox(width: 8),
              Text('Status Timeline',
                  style: TextStyle(
                      color: textPrimary,
                      fontSize: 15,
                      fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 20),
          ...displaySteps.asMap().entries.map((entry) {
            final i = entry.key;
            final step = entry.value;
            final ev = eventMap[step];
            final evStatus = ev?['status'] as String? ?? '';
            final isCompleted = evStatus == 'completed';
            final isInProgress = evStatus == 'in_progress';
            final isLast = i == displaySteps.length - 1;
            final isRejectedStep = step == 'Rejected';

            Color dotColor;
            IconData dotIcon;
            if (isCompleted) {
              dotColor = isRejectedStep
                  ? AppTheme.statusRejected
                  : AppTheme.statusResolved;
              dotIcon = isRejectedStep
                  ? Icons.cancel_rounded
                  : Icons.check_circle_rounded;
            } else if (isInProgress) {
              dotColor = AppTheme.statusInProgress;
              dotIcon = Icons.pending_rounded;
            } else {
              dotColor = textSecondary.withAlpha(80);
              dotIcon = Icons.radio_button_unchecked_rounded;
            }

            // Format timestamp
            String? timestamp;
            final ts = ev?['timestamp'] as String?;
            if (ts != null) {
              final dt = DateTime.tryParse(ts);
              if (dt != null) {
                timestamp = DateFormat('MMM d, h:mm a').format(dt.toLocal());
              }
            }

            // Progress note from dept admin
            final note = ev?['description'] as String?;

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Icon(dotIcon, color: dotColor, size: 22),
                    if (!isLast)
                      Container(
                        width: 2,
                        height: note != null && note.isNotEmpty ? 52 : 40,
                        color: isCompleted
                            ? (isRejectedStep
                                ? AppTheme.statusRejected.withAlpha(60)
                                : AppTheme.statusResolved.withAlpha(80))
                            : textSecondary.withAlpha(30),
                      ),
                  ],
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(step,
                            style: TextStyle(
                                color: isCompleted || isInProgress
                                    ? textPrimary
                                    : textSecondary,
                                fontSize: 14,
                                fontWeight: isCompleted || isInProgress
                                    ? FontWeight.w600
                                    : FontWeight.w400)),
                        if (note != null && note.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(note,
                                style: TextStyle(
                                    color: isCompleted || isInProgress
                                        ? textSecondary
                                        : textSecondary.withAlpha(120),
                                    fontSize: 12,
                                    height: 1.4)),
                          ),
                        if (timestamp != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(timestamp,
                                style: TextStyle(
                                    color: textSecondary.withAlpha(160),
                                    fontSize: 11)),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }
}
