import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../models/report_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/report_provider.dart';
import '../../widgets/notification_bell.dart';
import '../../widgets/report_image_viewer.dart';
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
            actions: const [NotificationBell()],
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
      // Long press to show delete option
      onLongPress: () => _showDeleteDialog(context),
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
                const SizedBox(width: 8),
                // Edit button
                IconButton(
                  icon: const Icon(Icons.edit_outlined,
                      size: 20, color: AppTheme.primary),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  tooltip: 'Edit report',
                  onPressed: () => _showEditDialog(context),
                ),
                const SizedBox(width: 4),
                // Delete button
                IconButton(
                  icon: Icon(Icons.delete_outline_rounded,
                      size: 20, color: AppTheme.error),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => _showDeleteDialog(context),
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
            // Show images if available
            if (report.images.isNotEmpty) ...[
              const SizedBox(height: 10),
              ReportImageStrip(
                images: report.images,
                baseUrl: ApiService.baseUrl,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showEditDialog(BuildContext context) {
    if (report.status != 'Reported') {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              'Reports can only be edited while in "Reported" status. Current: ${report.status}'),
          backgroundColor: AppTheme.warning,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final titleCtrl = TextEditingController(text: report.title);
    final descCtrl = TextEditingController(text: report.description);
    String selectedUrgency = report.urgency;
    final formKey = GlobalKey<FormState>();
    bool isSaving = false;

    showDialog(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          backgroundColor: cardColor,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.edit_outlined,
                  color: AppTheme.primary, size: 20),
              const SizedBox(width: 10),
              Text('Edit Report',
                  style: TextStyle(
                      color: textPrimary, fontWeight: FontWeight.w700)),
            ],
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: titleCtrl,
                    style: TextStyle(color: textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Title',
                      labelStyle: TextStyle(color: textSecondary),
                      prefixIcon: Icon(Icons.title_rounded,
                          color: textSecondary, size: 18),
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Title cannot be empty';
                      if (v.trim().length < 5) return 'At least 5 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: descCtrl,
                    style: TextStyle(color: textPrimary, fontSize: 14),
                    maxLines: 3,
                    decoration: InputDecoration(
                      labelText: 'Description',
                      labelStyle: TextStyle(color: textSecondary),
                      prefixIcon: Icon(Icons.description_outlined,
                          color: textSecondary, size: 18),
                      alignLabelWithHint: true,
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Description cannot be empty';
                      if (v.trim().length < 10) return 'At least 10 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: selectedUrgency,
                    dropdownColor: cardColor,
                    style: TextStyle(color: textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Urgency',
                      labelStyle: TextStyle(color: textSecondary),
                      prefixIcon: Icon(Icons.priority_high_rounded,
                          color: textSecondary, size: 18),
                    ),
                    items: ['High', 'Medium', 'Low']
                        .map((u) => DropdownMenuItem(
                              value: u,
                              child: Text(u,
                                  style: TextStyle(color: textPrimary)),
                            ))
                        .toList(),
                    onChanged: (v) {
                      if (v != null) setState(() => selectedUrgency = v);
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: isSaving ? null : () => Navigator.pop(ctx),
              child: Text('Cancel',
                  style: TextStyle(color: textSecondary)),
            ),
            ElevatedButton.icon(
              icon: isSaving
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.check_rounded, size: 16),
              label: Text(isSaving ? 'Saving…' : 'Save'),
              onPressed: isSaving
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;
                      setState(() => isSaving = true);
                      await _editReport(
                        context,
                        title: titleCtrl.text.trim(),
                        description: descCtrl.text.trim(),
                        urgency: selectedUrgency,
                      );
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _editReport(
    BuildContext context, {
    required String title,
    required String description,
    required String urgency,
  }) async {
    final auth = context.read<AuthProvider>();
    if (auth.token == null || report.id == null) return;
    try {
      await ApiService.editOwnReport(
        auth.token!,
        report.id!,
        title: title,
        description: description,
        urgencyLevel: urgency,
      );
      if (auth.user != null) {
        await context
            .read<ReportProvider>()
            .loadUserReports(auth.user!.email, token: auth.token);
      }
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report updated successfully'),
            backgroundColor: AppTheme.secondary,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update: $e'),
            backgroundColor: AppTheme.accent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _showDeleteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Delete Report?',
            style: TextStyle(color: textPrimary, fontWeight: FontWeight.w700)),
        content: Text(
          'Are you sure you want to delete "${report.title}"? This action cannot be undone.',
          style: TextStyle(color: textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel',
                style: TextStyle(color: textSecondary)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await _deleteReport(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteReport(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    final reportProvider = context.read<ReportProvider>();
    
    if (auth.token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Authentication required'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }

    if (report.id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Invalid report ID'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }

    try {
      // Show loading indicator
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
              SizedBox(width: 12),
              Text('Deleting report...'),
            ],
          ),
          duration: const Duration(seconds: 30),
        ),
      );

      // Delete the report
      await ApiService.deleteOwnReport(report.id!, auth.token!);

      // Reload reports
      if (auth.user != null) {
        await reportProvider.loadUserReports(
          auth.user!.email,
          token: auth.token,
        );
      }

      // Hide loading and show success
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.check_circle_rounded, color: Colors.white),
              SizedBox(width: 12),
              Expanded(child: Text('Report deleted successfully')),
            ],
          ),
          backgroundColor: AppTheme.statusResolved,
          duration: const Duration(seconds: 3),
        ),
      );
    } catch (e) {
      // Hide loading and show error
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to delete report: ${e.toString()}'),
          backgroundColor: AppTheme.error,
          duration: const Duration(seconds: 5),
        ),
      );
    }
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
