import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../models/report_model.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/notification_bell.dart';
import '../../widgets/report_image_viewer.dart';

class DeptAdminReportsScreen extends StatefulWidget {
  const DeptAdminReportsScreen({super.key});

  @override
  State<DeptAdminReportsScreen> createState() => _DeptAdminReportsScreenState();
}

class _DeptAdminReportsScreenState extends State<DeptAdminReportsScreen> {
  List<ReportModel> _reports = [];
  bool _loading = true;
  String _statusFilter = 'All';
  String _priorityFilter = 'All';
  String _search = '';
  Map<String, int> _stats = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;
    setState(() => _loading = true);
    try {
      final data = await ApiService.getDeptAdminReports(
        token,
        statusFilter: _statusFilter == 'All' ? null : _statusFilter,
        priorityFilter: _priorityFilter == 'All' ? null : _priorityFilter,
      );
      final list = (data['reports'] as List<dynamic>)
          .map((e) => ReportModel.fromApi(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _reports = list;
        _stats = {
          'total': list.length,
          'resolved': list.where((r) => r.status == 'Resolved').length,
          'pending': list.where((r) => r.status == 'Reported' || r.status == 'Pending').length,
          'inProgress': list.where((r) => r.status == 'In Progress').length,
          'urgent': list.where((r) => r.priority == 'Urgent' || r.priority == 'Critical').length,
        };
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Failed to load: $e'),
          backgroundColor: AppTheme.accent,
        ));
      }
    }
  }

  List<ReportModel> get _filtered {
    var list = _reports;
    if (_search.isNotEmpty) {
      list = list
          .where((r) =>
              r.title.toLowerCase().contains(_search.toLowerCase()) ||
              r.description.toLowerCase().contains(_search.toLowerCase()) ||
              (r.locationAddress ?? '').toLowerCase().contains(_search.toLowerCase()))
          .toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final dept = auth.adminDepartment ?? 'Department';
    final deptLabel = dept
        .replaceAll('_dept', '')
        .replaceAll('_', ' ')
        .split(' ')
        .map((w) => w.isEmpty ? '' : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverAppBar(
            pinned: true,
            backgroundColor: AppTheme.bgDark,
            automaticallyImplyLeading: false,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$deptLabel Reports',
                    style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.w700)),
                Text('${_stats['total'] ?? 0} total issues',
                    style: const TextStyle(
                        color: AppTheme.textSecondary, fontSize: 11)),
              ],
            ),
            actions: const [NotificationBell()],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(160),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Column(
                  children: [
                    // Stats row
                    Row(
                      children: [
                        _MiniStat('Total', _stats['total'] ?? 0, AppTheme.primary),
                        _MiniStat('Pending', _stats['pending'] ?? 0, AppTheme.statusPending),
                        _MiniStat('Active', _stats['inProgress'] ?? 0, AppTheme.statusInProgress),
                        _MiniStat('Done', _stats['resolved'] ?? 0, AppTheme.statusResolved),
                        if ((_stats['urgent'] ?? 0) > 0)
                          _MiniStat('Urgent', _stats['urgent'] ?? 0, AppTheme.accent),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Search
                    TextField(
                      onChanged: (v) => setState(() => _search = v),
                      style: const TextStyle(
                          color: AppTheme.textPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Search by title, description, location...',
                        prefixIcon: const Icon(Icons.search,
                            color: AppTheme.textSecondary, size: 20),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        filled: true,
                        fillColor: AppTheme.surfaceCard,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Status filter
                    SizedBox(
                      height: 32,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: ['All', 'Reported', 'In Progress', 'Resolved', 'Rejected']
                            .map((f) {
                          final sel = f == _statusFilter;
                          return GestureDetector(
                            onTap: () {
                              setState(() => _statusFilter = f);
                              _load();
                            },
                            child: AnimatedContainer(
                              duration: 200.ms,
                              margin: const EdgeInsets.only(right: 8),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 4),
                              decoration: BoxDecoration(
                                color: sel ? AppTheme.primary : AppTheme.surfaceCard,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: sel
                                      ? AppTheme.primary
                                      : Colors.white.withAlpha(15),
                                ),
                              ),
                              child: Text(f,
                                  style: TextStyle(
                                      color: sel
                                          ? Colors.white
                                          : AppTheme.textSecondary,
                                      fontSize: 11,
                                      fontWeight: sel
                                          ? FontWeight.w600
                                          : FontWeight.w400)),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
        body: _loading
            ? const Center(
                child: CircularProgressIndicator(color: AppTheme.primary))
            : RefreshIndicator(
                onRefresh: _load,
                color: AppTheme.primary,
                backgroundColor: AppTheme.surfaceCard,
                child: _filtered.isEmpty
                    ? const Center(
                        child: Text('No reports found',
                            style: TextStyle(color: AppTheme.textSecondary)))
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                        itemCount: _filtered.length,
                        itemBuilder: (_, i) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _DeptReportCard(
                            report: _filtered[i],
                            onStatusChanged: _load,
                          ),
                        ).animate(delay: (i * 40).ms).slideX(begin: 0.1).fadeIn(),
                      ),
              ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  const _MiniStat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 6),
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withAlpha(40)),
        ),
        child: Column(
          children: [
            Text('$value',
                style: TextStyle(
                    color: color,
                    fontSize: 16,
                    fontWeight: FontWeight.w800)),
            Text(label,
                style: const TextStyle(
                    color: AppTheme.textSecondary, fontSize: 9)),
          ],
        ),
      ),
    );
  }
}

class _DeptReportCard extends StatelessWidget {
  final ReportModel report;
  final VoidCallback onStatusChanged;

  const _DeptReportCard({
    required this.report,
    required this.onStatusChanged,
  });

  Color _statusColor(String s) {
    switch (s) {
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

  Color _priorityColor(String p) {
    switch (p) {
      case 'Urgent':
        return AppTheme.accent;
      case 'Critical':
        return const Color(0xFFFF6B35);
      case 'High':
        return AppTheme.warning;
      default:
        return AppTheme.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final sc = _statusColor(report.status);
    final pc = _priorityColor(report.priority);
    final isUrgent = report.priority == 'Urgent' || report.priority == 'Critical';
    final date = DateTime.tryParse(report.createdAt);
    final dateStr = date != null ? DateFormat('MMM d, yyyy • h:mm a').format(date) : '';

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isUrgent ? pc.withAlpha(80) : Colors.white.withAlpha(10),
          width: isUrgent ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Urgent banner
          if (isUrgent)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: pc.withAlpha(30),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
              ),
              child: Row(
                children: [
                  Icon(Icons.warning_rounded, color: pc, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    '${report.priority.toUpperCase()} PRIORITY — Act immediately!',
                    style: TextStyle(
                        color: pc, fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title + status
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(report.title,
                          style: const TextStyle(
                              color: AppTheme.textPrimary,
                              fontSize: 15,
                              fontWeight: FontWeight.w700)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: sc.withAlpha(25),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(report.status,
                          style: TextStyle(
                              color: sc,
                              fontSize: 11,
                              fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(report.description,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 13,
                        height: 1.4)),
                const SizedBox(height: 12),

                // Tags row
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    _Tag(report.category, AppTheme.primary),
                    _Tag(report.urgency,
                        report.urgency == 'High' || report.urgency == 'Urgent'
                            ? AppTheme.accent
                            : report.urgency == 'Medium'
                                ? AppTheme.warning
                                : AppTheme.secondary),
                    if (report.priority != 'Normal')
                      _Tag('⚑ ${report.priority}', pc),
                  ],
                ),
                const SizedBox(height: 12),

                // Date
                Row(
                  children: [
                    const Icon(Icons.access_time_rounded,
                        size: 12, color: AppTheme.textSecondary),
                    const SizedBox(width: 4),
                    Text(dateStr,
                        style: const TextStyle(
                            color: AppTheme.textSecondary, fontSize: 11)),
                  ],
                ),

                // Location
                if (report.locationAddress != null &&
                    report.locationAddress!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _LocationRow(
                    address: report.locationAddress!,
                    lat: report.latitude,
                    lng: report.longitude,
                  ),
                ] else if (report.latitude != null && report.longitude != null) ...[
                  const SizedBox(height: 8),
                  _LocationRow(
                    address: '${report.latitude!.toStringAsFixed(5)}, ${report.longitude!.toStringAsFixed(5)}',
                    lat: report.latitude,
                    lng: report.longitude,
                  ),
                ],

                // Images
                if (report.images.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.photo_library_outlined,
                          size: 14, color: AppTheme.textSecondary),
                      const SizedBox(width: 6),
                      Text('${report.images.length} photo(s)',
                          style: const TextStyle(
                              color: AppTheme.textSecondary, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ReportImageStrip(
                    images: report.images,
                    baseUrl: ApiService.baseUrl,
                  ),
                ],

                // Reporter info
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.bgDark.withAlpha(80),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.person_outline,
                          size: 14, color: AppTheme.textSecondary),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          '${report.userName ?? 'Unknown'} • ${report.userEmail ?? ''}',
                          style: const TextStyle(
                              color: AppTheme.textSecondary, fontSize: 11),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Action buttons
          Container(
            decoration: BoxDecoration(
              border: Border(
                  top: BorderSide(color: Colors.white.withAlpha(10))),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    _ActionBtn(
                      label: 'In Progress',
                      color: AppTheme.statusInProgress,
                      onTap: () => _updateStatus(context, 'In Progress'),
                    ),
                    Container(width: 1, height: 36, color: Colors.white.withAlpha(10)),
                    _ActionBtn(
                      label: 'Resolve ✓',
                      color: AppTheme.statusResolved,
                      onTap: () => _showResolveDialog(context),
                    ),
                    Container(width: 1, height: 36, color: Colors.white.withAlpha(10)),
                    _ActionBtn(
                      label: 'Reject',
                      color: AppTheme.statusRejected,
                      onTap: () => _updateStatus(context, 'Rejected'),
                    ),
                  ],
                ),
                // Show completed work images if available
                if (report.completedWorkImages.isNotEmpty) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.statusResolved.withAlpha(15),
                      border: Border(
                        top: BorderSide(color: Colors.white.withAlpha(10)),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.check_circle_rounded,
                                color: AppTheme.statusResolved, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              'Work Completed (${report.completedWorkImages.length} photo${report.completedWorkImages.length > 1 ? 's' : ''})',
                              style: const TextStyle(
                                color: AppTheme.statusResolved,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ReportImageStrip(
                          images: report.completedWorkImages,
                          baseUrl: ApiService.baseUrl,
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _updateStatus(BuildContext context, String newStatus) async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;
    try {
      await ApiService.deptAdminUpdateStatus(token, report.id!, newStatus);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(newStatus == 'Resolved'
              ? '✅ Issue resolved! Reporter has been notified.'
              : 'Status updated to $newStatus'),
          backgroundColor: newStatus == 'Resolved'
              ? AppTheme.statusResolved
              : AppTheme.statusInProgress,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ));
        onStatusChanged();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: $e'),
          backgroundColor: AppTheme.accent,
        ));
      }
    }
  }

  void _showResolveDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => _ResolveDialog(
        report: report,
        onResolved: onStatusChanged,
      ),
    );
  }
}

class _LocationRow extends StatelessWidget {
  final String address;
  final double? lat;
  final double? lng;

  const _LocationRow({required this.address, this.lat, this.lng});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (lat != null && lng != null) {
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              backgroundColor: AppTheme.surfaceCard,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              title: const Text('Location Details',
                  style: TextStyle(color: AppTheme.textPrimary)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withAlpha(15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.primary.withAlpha(40)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.map_outlined,
                                color: AppTheme.primary, size: 18),
                            SizedBox(width: 8),
                            Text('GPS Coordinates',
                                style: TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontWeight: FontWeight.w600)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Lat: ${lat!.toStringAsFixed(6)}\nLng: ${lng!.toStringAsFixed(6)}',
                          style: const TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 13,
                              fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Address:',
                      style: TextStyle(
                          color: AppTheme.textSecondary, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(address,
                      style: const TextStyle(
                          color: AppTheme.textPrimary, fontSize: 13)),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close',
                      style: TextStyle(color: AppTheme.primary)),
                ),
              ],
            ),
          );
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.primary.withAlpha(10),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.primary.withAlpha(30)),
        ),
        child: Row(
          children: [
            const Icon(Icons.location_on_rounded,
                size: 14, color: AppTheme.primary),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                address,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    color: AppTheme.textPrimary, fontSize: 12),
              ),
            ),
            if (lat != null && lng != null) ...[
              const SizedBox(width: 6),
              const Icon(Icons.open_in_new_rounded,
                  size: 12, color: AppTheme.primary),
            ],
          ],
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final String label;
  final Color color;
  const _Tag(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 10, fontWeight: FontWeight.w600)),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionBtn(
      {required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: TextButton(
        onPressed: onTap,
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: const RoundedRectangleBorder(),
        ),
        child: Text(label,
            style: TextStyle(
                color: color, fontSize: 11, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

class _ResolveDialog extends StatefulWidget {
  final ReportModel report;
  final VoidCallback onResolved;

  const _ResolveDialog({required this.report, required this.onResolved});

  @override
  State<_ResolveDialog> createState() => _ResolveDialogState();
}

class _ResolveDialogState extends State<_ResolveDialog> {
  bool _uploading = false;
  XFile? _selectedImage;
  Uint8List? _selectedImageBytes;

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (pickedFile != null) {
        final bytes = await pickedFile.readAsBytes();
        setState(() {
          _selectedImage = pickedFile;
          _selectedImageBytes = bytes;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Failed to pick image: $e'),
          backgroundColor: AppTheme.accent,
        ));
      }
    }
  }

  Future<void> _resolve() async {
    if (_selectedImage == null || _selectedImageBytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please select a completed work image'),
        backgroundColor: AppTheme.accent,
      ));
      return;
    }

    setState(() => _uploading = true);
    final token = context.read<AuthProvider>().token;
    if (token == null) return;

    try {
      // Determine filename
      final rawName = _selectedImage!.name;
      String filename;
      if (rawName.isEmpty) {
        filename = 'completed_work.jpg';
      } else if (rawName.contains('/') || rawName.contains('\\')) {
        filename = rawName.split(RegExp(r'[/\\]')).last;
        if (filename.isEmpty) filename = 'completed_work.jpg';
      } else {
        filename = rawName;
      }
      if (!filename.contains('.')) filename = '$filename.jpg';

      // Upload completed work image
      await ApiService.uploadCompletedWorkImage(
        token,
        widget.report.id!,
        _selectedImageBytes!,
        filename,
      );

      // Update status to Resolved
      await ApiService.deptAdminUpdateStatus(token, widget.report.id!, 'Resolved');

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('✅ Issue resolved with completion photo! Reporter has been notified.'),
          backgroundColor: AppTheme.statusResolved,
          behavior: SnackBarBehavior.floating,
        ));
        widget.onResolved();
      }
    } catch (e) {
      setState(() => _uploading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: $e'),
          backgroundColor: AppTheme.accent,
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppTheme.surfaceCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Row(
        children: [
          Icon(Icons.check_circle_outline, color: AppTheme.statusResolved, size: 24),
          SizedBox(width: 8),
          Text('Resolve Issue',
              style: TextStyle(color: AppTheme.textPrimary, fontSize: 18)),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Upload a photo of the completed work to resolve this issue.',
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 16),
          if (_selectedImageBytes != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.memory(
                _selectedImageBytes!,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 12),
          ],
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _uploading ? null : _pickImage,
              icon: Icon(
                _selectedImage == null ? Icons.add_photo_alternate : Icons.change_circle,
                color: AppTheme.primary,
              ),
              label: Text(
                _selectedImage == null ? 'Select Photo' : 'Change Photo',
                style: const TextStyle(color: AppTheme.primary),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                side: const BorderSide(color: AppTheme.primary),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _uploading ? null : () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
        ),
        ElevatedButton(
          onPressed: _uploading ? null : _resolve,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.statusResolved,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: _uploading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('Resolve', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}
