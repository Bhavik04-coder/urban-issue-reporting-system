import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/report_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/report_provider.dart';

class MyReportsScreen extends StatefulWidget {
  const MyReportsScreen({super.key});

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  String _filter = 'All';

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  void _load() {
    final auth = context.read<AuthProvider>();
    if (auth.user != null) {
      context.read<ReportProvider>().loadUserReports(
            auth.user!.email,
            token: auth.token,
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    final rp = context.watch<ReportProvider>();
    final all = rp.reports;
    final filtered = _filter == 'All'
        ? all
        : all.where((r) => r.status == _filter).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverAppBar(
            pinned: true,
            backgroundColor: AppTheme.bgDark,
            automaticallyImplyLeading: false,
            title: const Text('My Reports'),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(100),
              child: Column(
                children: [
                  // Stats row
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: Row(
                      children: [
                        _MiniStat('Total', '${rp.stats['total'] ?? 0}',
                            AppTheme.primary),
                        const SizedBox(width: 8),
                        _MiniStat('Resolved', '${rp.stats['resolved'] ?? 0}',
                            AppTheme.statusResolved),
                        const SizedBox(width: 8),
                        _MiniStat('Pending', '${rp.stats['pending'] ?? 0}',
                            AppTheme.statusPending),
                      ],
                    ),
                  ),
                  // Filter chips
                  SizedBox(
                    height: 40,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      children: ['All', 'Pending', 'In Progress', 'Resolved']
                          .map((f) {
                        final sel = f == _filter;
                        return GestureDetector(
                          onTap: () => setState(() => _filter = f),
                          child: AnimatedContainer(
                            duration: 200.ms,
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: sel
                                  ? AppTheme.primary
                                  : AppTheme.surfaceCard,
                              borderRadius: BorderRadius.circular(20),
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
                                    fontSize: 13,
                                    fontWeight: sel
                                        ? FontWeight.w600
                                        : FontWeight.w400)),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
        ],
        body: rp.isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppTheme.primary))
            : filtered.isEmpty
                ? _EmptyState(filter: _filter)
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _ReportTile(report: filtered[i]),
                    ).animate(delay: (i * 60).ms).slideX(begin: 0.1).fadeIn(),
                  ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label, value;
  final Color color;
  const _MiniStat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withAlpha(40)),
        ),
        child: Column(
          children: [
            Text(value,
                style: TextStyle(
                    color: color,
                    fontSize: 20,
                    fontWeight: FontWeight.w800)),
            Text(label,
                style: const TextStyle(
                    color: AppTheme.textSecondary, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}

class _ReportTile extends StatelessWidget {
  final ReportModel report;
  const _ReportTile({required this.report});

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
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
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
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
          const SizedBox(height: 12),
          Row(
            children: [
              _Tag(report.category, AppTheme.primary),
              const SizedBox(width: 6),
              _Tag(report.urgency,
                  report.urgency == 'High'
                      ? AppTheme.accent
                      : report.urgency == 'Medium'
                          ? AppTheme.warning
                          : AppTheme.secondary),
              const Spacer(),
              Icon(Icons.calendar_today_outlined,
                  size: 12, color: AppTheme.textSecondary),
              const SizedBox(width: 4),
              Text(dateStr,
                  style: const TextStyle(
                      color: AppTheme.textSecondary, fontSize: 11)),
            ],
          ),
          if (report.locationAddress != null &&
              report.locationAddress!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on_outlined,
                    size: 13, color: AppTheme.textSecondary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(report.locationAddress!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          color: AppTheme.textSecondary, fontSize: 12)),
                ),
              ],
            ),
          ],
        ],
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

class _EmptyState extends StatelessWidget {
  final String filter;
  const _EmptyState({required this.filter});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.surfaceCard,
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Icon(Icons.inbox_outlined,
                color: AppTheme.textSecondary, size: 36),
          ),
          const SizedBox(height: 16),
          Text(
            filter == 'All' ? 'No reports yet' : 'No $filter reports',
            style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(
            filter == 'All'
                ? 'Submit your first civic issue report'
                : 'No reports with this status',
            style: const TextStyle(
                color: AppTheme.textSecondary, fontSize: 13),
          ),
        ],
      ),
    );
  }
}
