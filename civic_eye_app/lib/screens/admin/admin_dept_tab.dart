import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';

class AdminDeptTab extends StatefulWidget {
  const AdminDeptTab({super.key});

  @override
  State<AdminDeptTab> createState() => _AdminDeptTabState();
}

class _AdminDeptTabState extends State<AdminDeptTab> {
  List<Map<String, dynamic>> _departments = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getDepartmentSummary();
      final depts = data['departments'] as List<dynamic>? ?? [];
      setState(() {
        _departments = depts
            .map((d) => d as Map<String, dynamic>)
            .toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
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

    return Scaffold(
      backgroundColor: bg,
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppTheme.primary,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              backgroundColor: bg,
              automaticallyImplyLeading: false,
              title: Text('Department Performance',
                  style: TextStyle(color: textPrimary)),
            ),

            if (_loading)
              const SliverFillRemaining(
                child: Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.primary)),
              )
            else if (_departments.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.business_outlined,
                          color: textSecondary, size: 48),
                      const SizedBox(height: 12),
                      Text('No department data yet',
                          style: TextStyle(color: textSecondary)),
                    ],
                  ),
                ),
              )
            else ...[
              // Bar chart
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: _BarChartCard(
                    departments: _departments,
                    cardColor: cardColor,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                  ),
                ).animate(delay: 100.ms).slideY(begin: 0.2).fadeIn(),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 16)),

              // Department cards
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) {
                    final dept = _departments[i];
                    return Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                      child: _DeptCard(
                        dept: dept,
                        cardColor: cardColor,
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                      ),
                    ).animate(delay: (i * 80).ms).slideX(begin: 0.1).fadeIn();
                  },
                  childCount: _departments.length,
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

class _BarChartCard extends StatelessWidget {
  final List<Map<String, dynamic>> departments;
  final Color cardColor, textPrimary, textSecondary;

  const _BarChartCard({
    required this.departments,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
  });

  static const _colors = [
    AppTheme.primary,
    AppTheme.secondary,
    AppTheme.accent,
    AppTheme.warning,
    AppTheme.deptWater,
  ];

  @override
  Widget build(BuildContext context) {
    final groups = departments.asMap().entries.map((e) {
      final i = e.key;
      final d = e.value;
      final total = (d['total_issues'] as num?)?.toDouble() ?? 0;
      final resolved = (d['resolved'] as num?)?.toDouble() ?? 0;
      final color = _colors[i % _colors.length];

      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: total,
            color: color.withAlpha(80),
            width: 14,
            borderRadius: BorderRadius.circular(4),
          ),
          BarChartRodData(
            toY: resolved,
            color: color,
            width: 14,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      );
    }).toList();

    final maxY = departments.fold<double>(
      1,
      (prev, d) =>
          ((d['total_issues'] as num?)?.toDouble() ?? 0) > prev
              ? (d['total_issues'] as num).toDouble()
              : prev,
    );

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Issues by Department',
              style: TextStyle(
                  color: textPrimary,
                  fontSize: 15,
                  fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Row(
            children: [
              _Legend('Total', textSecondary.withAlpha(120)),
              const SizedBox(width: 12),
              _Legend('Resolved', AppTheme.primary),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 160,
            child: BarChart(
              BarChartData(
                maxY: maxY * 1.2,
                barGroups: groups,
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (_) => FlLine(
                    color: textSecondary.withAlpha(30),
                    strokeWidth: 1,
                  ),
                ),
                borderData: FlBorderData(show: false),
                titlesData: FlTitlesData(
                  leftTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final i = value.toInt();
                        if (i >= departments.length) {
                          return const SizedBox.shrink();
                        }
                        final name =
                            (departments[i]['name'] as String? ?? '')
                                .split(' ')
                                .first;
                        return Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(name,
                              style: TextStyle(
                                  color: textSecondary, fontSize: 9)),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  final String label;
  final Color color;
  const _Legend(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
                color: color, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 4),
        Text(label,
            style: TextStyle(color: color, fontSize: 11)),
      ],
    );
  }
}

// ── Department Card ───────────────────────────────────────────────────────────

class _DeptCard extends StatelessWidget {
  final Map<String, dynamic> dept;
  final Color cardColor, textPrimary, textSecondary;

  const _DeptCard({
    required this.dept,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
  });

  @override
  Widget build(BuildContext context) {
    final name = dept['name'] as String? ?? 'Unknown';
    final total = (dept['total_issues'] as num?)?.toInt() ?? 0;
    final resolved = (dept['resolved'] as num?)?.toInt() ?? 0;
    final pending = (dept['pending'] as num?)?.toInt() ?? 0;
    final inProgress = (dept['progress'] as num?)?.toInt() ?? 0;
    final efficiency = (dept['efficiency'] as num?)?.toDouble() ?? 0.0;

    return Container(
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
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withAlpha(25),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.business_rounded,
                    color: AppTheme.primary, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name,
                        style: TextStyle(
                            color: textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.w700)),
                    Text('$total total issues',
                        style: TextStyle(
                            color: textSecondary, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _efficiencyColor(efficiency).withAlpha(25),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${efficiency.toStringAsFixed(1)}%',
                  style: TextStyle(
                      color: _efficiencyColor(efficiency),
                      fontSize: 13,
                      fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: efficiency / 100,
              backgroundColor: textSecondary.withAlpha(30),
              valueColor: AlwaysStoppedAnimation<Color>(
                  _efficiencyColor(efficiency)),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _Stat('Resolved', resolved, AppTheme.statusResolved,
                  textSecondary),
              _Stat('Pending', pending, AppTheme.statusPending,
                  textSecondary),
              _Stat('Active', inProgress, AppTheme.statusInProgress,
                  textSecondary),
            ],
          ),
        ],
      ),
    );
  }

  Color _efficiencyColor(double e) {
    if (e >= 75) return AppTheme.statusResolved;
    if (e >= 50) return AppTheme.warning;
    return AppTheme.accent;
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final int value;
  final Color color, textSecondary;
  const _Stat(this.label, this.value, this.color, this.textSecondary);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text('$value',
              style: TextStyle(
                  color: color,
                  fontSize: 16,
                  fontWeight: FontWeight.w700)),
          Text(label,
              style: TextStyle(color: textSecondary, fontSize: 10)),
        ],
      ),
    );
  }
}
