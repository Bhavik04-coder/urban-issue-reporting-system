import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../models/report_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/report_provider.dart';
import 'report_detail_screen.dart';

class MyReportsScreen extends StatefulWidget {
  const MyReportsScreen({super.key});

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen> {
  String _filter = 'All';

  // Feature 6: Search
  final _searchCtrl = TextEditingController();
  bool _searching = false;
  List<ReportModel>? _searchResults;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
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

  Future<void> _search(String query) async {
    if (query.trim().isEmpty) {
      setState(() => _searchResults = null);
      return;
    }
    final auth = context.read<AuthProvider>();
    if (auth.user == null) return;
    setState(() => _searching = true);
    try {
      final raw =
          await ApiService.searchUserReports(auth.user!.email, query.trim());
      setState(() {
        _searchResults = raw
            .map((e) => ReportModel.fromApi(e as Map<String, dynamic>))
            .toList();
      });
    } catch (_) {
      setState(() => _searchResults = []);
    } finally {
      setState(() => _searching = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppTheme.bgDark : AppTheme.bgLight;
    final cardColor =
        isDark ? AppTheme.surfaceCard : AppTheme.surfaceCardLight;
    final textPrimary =
        isDark ? AppTheme.textPrimary : AppTheme.textPrimaryLight;
    final textSecondary =
        isDark ? AppTheme.textSecondary : AppTheme.textSecondaryLight;

    final rp = context.watch<ReportProvider>();
    final all = rp.reports;

    List<ReportModel> displayed;
    if (_searchResults != null) {
      displayed = _searchResults!;
    } else if (_filter == 'All') {
      displayed = all;
    } else {
      displayed = all.where((r) => r.status == _filter).toList();
    }

    return Scaffold(
      backgroundColor: bg,
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverAppBar(
            pinned: true,
            backgroundColor: bg,
            automaticallyImplyLeading: false,
            title: Text('My Reports',
                style: TextStyle(color: textPrimary)),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(130),
              child: Column(
                children: [
                  // Stats row
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                    child: Row(
                      children: [
                        _MiniStat('Total', '${rp.stats['total'] ?? 0}',
                            AppTheme.primary),
                        const SizedBox(width: 8),
                        _MiniStat(
                            'Resolved',
                            '${rp.stats['resolved'] ?? 0}',
                            AppTheme.statusResolved),
                        const SizedBox(width: 8),
                        _MiniStat(
                            'Pending',
                            '${rp.stats['pending'] ?? 0}',
                            AppTheme.statusPending),
                      ],
                    ),
                  ),

                  // Feature 6: Search bar
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                    child: TextField(
                      controller: _searchCtrl,
                      onChanged: _search,
                      style: TextStyle(color: textPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Search by title, ID or description…',
                        hintStyle:
                            TextStyle(color: textSecondary, fontSize: 13),
                        prefixIcon: Icon(Icons.search_rounded,
                            color: textSecondary, size: 20),
                        suffixIcon: _searchCtrl.text.isNotEmpty
                            ? IconButton(
                                icon: Icon(Icons.clear_rounded,
                                    color: textSecondary, size: 18),
                                onPressed: () {
                                  _searchCtrl.clear();
                                  setState(() => _searchResults = null);
                                },
                              )
                            : null,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        isDense: true,
                      ),
                    ),
                  ),

                  // Filter chips
                  SizedBox(
                    height: 36,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      children: [
                        'All',
                        'Pending',
                        'In Progress',
                        'Resolved'
                      ].map((f) {
                        final sel = f == _filter &&
                            _searchResults == null;
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _filter = f;
                              _searchResults = null;
                              _searchCtrl.clear();
                            });
                          },
                          child: AnimatedContainer(
                            duration: 200.ms,
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: sel
                                  ? AppTheme.primary
                                  : cardColor,
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
                                        : textSecondary,
                                    fontSize: 12,
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
        body: _searching
            ? const Center(
                child: CircularProgressIndicator(
                    color: AppTheme.primary))
            : rp.isLoading && _searchResults == null
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.primary))
                : displayed.isEmpty
                    ? _EmptyState(
                        filter: _filter,
                        isSearch: _searchResults != null,
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        cardColor: cardColor,
                      )
                    : ListView.builder(
                        padding:
                            const EdgeInsets.fromLTRB(16, 12, 16, 100),
                        itemCount: displayed.length,
                        itemBuilder: (_, i) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _ReportTile(
                            report: displayed[i],
                            textPrimary: textPrimary,
                            textSecondary: textSecondary,
                            cardColor: cardColor,
                          ),
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
  final Color textPrimary, textSecondary, cardColor;
  const _ReportTile({
    required this.report,
    required this.textPrimary,
    required this.textSecondary,
    required this.cardColor,
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

  @override
  Widget build(BuildContext context) {
    final sc = _statusColor(report.status);
    final date = DateTime.tryParse(report.createdAt);
    final dateStr =
        date != null ? DateFormat('MMM d, yyyy').format(date) : '';

    return GestureDetector(
      // Feature 3: Tap to open detail screen
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ReportDetailScreen(report: report),
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(18),
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
                Expanded(
                  child: Text(report.title,
                      style: TextStyle(
                          color: textPrimary,
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
                style: TextStyle(
                    color: textSecondary, fontSize: 13)),
            const SizedBox(height: 12),
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
                Icon(Icons.calendar_today_outlined,
                    size: 12, color: textSecondary),
                const SizedBox(width: 4),
                Text(dateStr,
                    style: TextStyle(
                        color: textSecondary, fontSize: 11)),
                const SizedBox(width: 8),
                Icon(Icons.chevron_right_rounded,
                    size: 16, color: textSecondary),
              ],
            ),
            if (report.locationAddress != null &&
                report.locationAddress!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.location_on_outlined,
                      size: 13, color: textSecondary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(report.locationAddress!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                            color: textSecondary, fontSize: 12)),
                  ),
                ],
              ),
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

class _EmptyState extends StatelessWidget {
  final String filter;
  final bool isSearch;
  final Color textPrimary, textSecondary, cardColor;
  const _EmptyState({
    required this.filter,
    required this.isSearch,
    required this.textPrimary,
    required this.textSecondary,
    required this.cardColor,
  });

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
              color: cardColor,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Icon(
              isSearch ? Icons.search_off_rounded : Icons.inbox_outlined,
              color: textSecondary,
              size: 36,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            isSearch
                ? 'No results found'
                : filter == 'All'
                    ? 'No reports yet'
                    : 'No $filter reports',
            style: TextStyle(
                color: textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(
            isSearch
                ? 'Try a different search term'
                : filter == 'All'
                    ? 'Submit your first civic issue report'
                    : 'No reports with this status',
            style: TextStyle(color: textSecondary, fontSize: 13),
          ),
        ],
      ),
    );
  }
}
