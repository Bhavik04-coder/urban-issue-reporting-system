import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/report_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/report_provider.dart';

class AdminReportsTab extends StatefulWidget {
  const AdminReportsTab({super.key});

  @override
  State<AdminReportsTab> createState() => _AdminReportsTabState();
}

class _AdminReportsTabState extends State<AdminReportsTab> {
  String _filter = 'All';
  String _search = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = context.read<AuthProvider>().token;
      context.read<ReportProvider>().loadAllReports(token: token);
    });
  }

  @override
  Widget build(BuildContext context) {
    final rp = context.watch<ReportProvider>();
    var reports = rp.reports;

    if (_filter != 'All') {
      reports = reports.where((r) => r.status == _filter).toList();
    }
    if (_search.isNotEmpty) {
      reports = reports
          .where((r) =>
              r.title.toLowerCase().contains(_search.toLowerCase()) ||
              r.description.toLowerCase().contains(_search.toLowerCase()))
          .toList();
    }

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverAppBar(
            pinned: true,
            backgroundColor: AppTheme.bgDark,
            automaticallyImplyLeading: false,
            title: const Text('All Reports'),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(110),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Column(
                  children: [
                    // Search
                    TextField(
                      onChanged: (v) => setState(() => _search = v),
                      style: const TextStyle(
                          color: AppTheme.textPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Search reports...',
                        prefixIcon: const Icon(Icons.search,
                            color: AppTheme.textSecondary, size: 20),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        filled: true,
                        fillColor: AppTheme.surfaceCard,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Filter chips
                    SizedBox(
                      height: 36,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          'All',
                          'Pending',
                          'In Progress',
                          'Resolved',
                          'Rejected'
                        ].map((f) {
                          final sel = f == _filter;
                          return GestureDetector(
                            onTap: () => setState(() => _filter = f),
                            child: AnimatedContainer(
                              duration: 200.ms,
                              margin: const EdgeInsets.only(right: 8),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: sel
                                    ? AppTheme.primary
                                    : AppTheme.surfaceCard,
                                borderRadius: BorderRadius.circular(18),
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
                                      fontSize: 12,
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
        body: rp.isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppTheme.primary))
            : reports.isEmpty
                ? const Center(
                    child: Text('No reports found',
                        style: TextStyle(color: AppTheme.textSecondary)))
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                    itemCount: reports.length,
                    itemBuilder: (_, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _AdminReportCard(report: reports[i]),
                    ).animate(delay: (i * 40).ms).slideX(begin: 0.1).fadeIn(),
                  ),
      ),
    );
  }
}

class _AdminReportCard extends StatelessWidget {
  final ReportModel report;
  const _AdminReportCard({required this.report});

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

  @override
  Widget build(BuildContext context) {
    final sc = _statusColor(report.status);
    final date = DateTime.tryParse(report.createdAt);
    final dateStr =
        date != null ? DateFormat('MMM d, yyyy').format(date) : '';

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(report.title,
                          style: const TextStyle(
                              color: AppTheme.textPrimary,
                              fontSize: 15,
                              fontWeight: FontWeight.w700)),
                    ),
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
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        color: AppTheme.textSecondary, fontSize: 13)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _Tag(report.category, AppTheme.primary),
                    const SizedBox(width: 6),
                    _Tag(
                        report.urgency,
                        report.urgency == 'High'
                            ? AppTheme.accent
                            : report.urgency == 'Medium'
                                ? AppTheme.warning
                                : AppTheme.secondary),
                    const Spacer(),
                    Text(dateStr,
                        style: const TextStyle(
                            color: AppTheme.textSecondary, fontSize: 11)),
                  ],
                ),
                if (report.locationAddress != null &&
                    report.locationAddress!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 12, color: AppTheme.textSecondary),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(report.locationAddress!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 11)),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          // Action buttons
          Container(
            decoration: BoxDecoration(
              border: Border(
                  top: BorderSide(
                      color: Colors.white.withAlpha(10), width: 1)),
            ),
            child: Row(
              children: [
                _ActionBtn(
                  label: 'In Progress',
                  color: AppTheme.statusInProgress,
                  onTap: () => _updateStatus(context, 'In Progress'),
                ),
                Container(
                    width: 1,
                    height: 36,
                    color: Colors.white.withAlpha(10)),
                _ActionBtn(
                  label: 'Resolve',
                  color: AppTheme.statusResolved,
                  onTap: () => _updateStatus(context, 'Resolved'),
                ),
                Container(
                    width: 1,
                    height: 36,
                    color: Colors.white.withAlpha(10)),
                _ActionBtn(
                  label: 'Reject',
                  color: AppTheme.statusRejected,
                  onTap: () => _updateStatus(context, 'Rejected'),
                ),
                Container(
                    width: 1,
                    height: 36,
                    color: Colors.white.withAlpha(10)),
                _ActionBtn(
                  label: 'Delete',
                  color: AppTheme.accent,
                  icon: Icons.delete_outline,
                  onTap: () => _confirmDelete(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _updateStatus(BuildContext context, String status) async {
    final auth = context.read<AuthProvider>();
    final error = await context
        .read<ReportProvider>()
        .updateStatus(report.id!, status, auth.token!);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(error == null ? 'Status updated to $status' : 'Error: $error'),
        backgroundColor: error == null ? AppTheme.statusResolved : AppTheme.accent,
        behavior: SnackBarBehavior.floating,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ));
    }
  }

  void _confirmDelete(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceCard,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete Report',
            style: TextStyle(color: AppTheme.textPrimary)),
        content: const Text('This action cannot be undone.',
            style: TextStyle(color: AppTheme.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel',
                style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accent),
            onPressed: () async {
              final token = context.read<AuthProvider>().token!;
              Navigator.pop(context);
              await context
                  .read<ReportProvider>()
                  .deleteReport(report.id!, token);
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;
  final VoidCallback onTap;

  const _ActionBtn(
      {required this.label,
      required this.color,
      this.icon,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: TextButton(
        onPressed: onTap,
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: const RoundedRectangleBorder(),
        ),
        child: icon != null
            ? Icon(icon, color: color, size: 18)
            : Text(label,
                style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight: FontWeight.w600)),
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
