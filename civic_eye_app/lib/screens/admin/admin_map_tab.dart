import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';

class AdminMapTab extends StatefulWidget {
  const AdminMapTab({super.key});

  @override
  State<AdminMapTab> createState() => _AdminMapTabState();
}

class _AdminMapTabState extends State<AdminMapTab> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  bool _loading = true;
  String _statusFilter = 'All';
  Map<String, int> _stats = {};
  List<Map<String, dynamic>> _issues = [];

  static const _defaultCenter = LatLng(19.0760, 72.8777); // Mumbai default

  @override
  void initState() {
    super.initState();
    _loadIssues();
  }

  Future<void> _loadIssues() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getMapIssues(
        statusFilter: _statusFilter == 'All' ? null : _statusFilter,
      );
      final issues = data['issues'] as List<dynamic>? ?? [];

      final markers = <Marker>{};
      final issueList = <Map<String, dynamic>>[];
      int pending = 0, inProgress = 0, resolved = 0;

      for (final issue in issues) {
        final m = issue as Map<String, dynamic>;
        final lat = (m['location_lat'] as num?)?.toDouble();
        final lng = (m['location_long'] as num?)?.toDouble();
        if (lat == null || lng == null) continue;

        final status = m['status'] as String? ?? 'Pending';
        final id = m['id'] as int? ?? 0;
        final title = m['title'] as String? ?? 'Issue';
        final urgency = m['urgency_level'] as String? ?? 'Medium';

        if (status == 'Resolved') resolved++;
        else if (status == 'In Progress') inProgress++;
        else pending++;

        issueList.add(m);

        if (!kIsWeb) {
          markers.add(
            Marker(
              markerId: MarkerId('issue_$id'),
              position: LatLng(lat, lng),
              icon: BitmapDescriptor.defaultMarkerWithHue(_markerColor(status)),
              infoWindow: InfoWindow(
                title: title,
                snippet: '$status • $urgency urgency',
              ),
            ),
          );
        }
      }

      if (mounted) {
        setState(() {
          _markers = markers;
          _issues = issueList;
          _stats = {
            'total': issues.length,
            'pending': pending,
            'inProgress': inProgress,
            'resolved': resolved,
          };
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  double _markerColor(String status) {
    switch (status) {
      case 'Resolved':
        return BitmapDescriptor.hueGreen;
      case 'In Progress':
        return BitmapDescriptor.hueCyan;
      case 'Rejected':
        return BitmapDescriptor.hueRed;
      default:
        return BitmapDescriptor.hueOrange;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppTheme.bgDark : AppTheme.bgLight;
    final cardColor = isDark ? AppTheme.surfaceCard : AppTheme.surfaceCardLight;
    final textPrimary = isDark ? AppTheme.textPrimary : AppTheme.textPrimaryLight;
    final textSecondary = isDark ? AppTheme.textSecondary : AppTheme.textSecondaryLight;

    return Scaffold(
      backgroundColor: bg,
      body: Column(
        children: [
          // Header
          Container(
            padding: EdgeInsets.fromLTRB(
                16, MediaQuery.of(context).padding.top + 12, 16, 12),
            color: bg,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Issue Map',
                    style: TextStyle(
                        color: textPrimary,
                        fontSize: 22,
                        fontWeight: FontWeight.w800)),
                const SizedBox(height: 10),
                // Filter chips
                SizedBox(
                  height: 36,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children:
                        ['All', 'Pending', 'In Progress', 'Resolved'].map((f) {
                      final sel = f == _statusFilter;
                      return GestureDetector(
                        onTap: () {
                          setState(() => _statusFilter = f);
                          _loadIssues();
                        },
                        child: AnimatedContainer(
                          duration: 200.ms,
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: sel ? AppTheme.primary : cardColor,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: sel
                                  ? AppTheme.primary
                                  : Colors.white.withAlpha(20),
                            ),
                          ),
                          child: Text(f,
                              style: TextStyle(
                                  color:
                                      sel ? Colors.white : textSecondary,
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
          ).animate().fadeIn(),

          // Map or list
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.primary))
                : kIsWeb
                    // Web: show issue list (Google Maps needs API key on web)
                    ? _IssueList(
                        issues: _issues,
                        cardColor: cardColor,
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                      )
                    // Native: full Google Map
                    : Stack(
                        children: [
                          GoogleMap(
                            initialCameraPosition: const CameraPosition(
                              target: _defaultCenter,
                              zoom: 11,
                            ),
                            markers: _markers,
                            onMapCreated: (c) {
                              _mapController = c;
                              assert(_mapController != null);
                            },
                            mapType: MapType.normal,
                            myLocationButtonEnabled: false,
                            zoomControlsEnabled: false,
                          ),
                          Positioned(
                            bottom: 24,
                            right: 16,
                            child: FloatingActionButton.small(
                              onPressed: _loadIssues,
                              backgroundColor: AppTheme.primary,
                              child: const Icon(Icons.refresh_rounded,
                                  color: Colors.white),
                            ),
                          ),
                        ],
                      ),
          ),

          // Stats bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: cardColor,
              border: Border(
                  top: BorderSide(
                      color: Colors.white.withAlpha(15), width: 1)),
            ),
            child: Row(
              children: [
                _StatChip('Total', '${_stats['total'] ?? 0}',
                    AppTheme.primary, textPrimary, textSecondary),
                _StatChip('Pending', '${_stats['pending'] ?? 0}',
                    AppTheme.statusPending, textPrimary, textSecondary),
                _StatChip('Active', '${_stats['inProgress'] ?? 0}',
                    AppTheme.statusInProgress, textPrimary, textSecondary),
                _StatChip('Done', '${_stats['resolved'] ?? 0}',
                    AppTheme.statusResolved, textPrimary, textSecondary),
              ],
            ),
          ).animate(delay: 200.ms).slideY(begin: 0.3).fadeIn(),
        ],
      ),
    );
  }
}

// ── Web fallback: issue list ──────────────────────────────────────────────────

class _IssueList extends StatelessWidget {
  final List<Map<String, dynamic>> issues;
  final Color cardColor, textPrimary, textSecondary;
  const _IssueList({
    required this.issues,
    required this.cardColor,
    required this.textPrimary,
    required this.textSecondary,
  });

  Color _statusColor(String s) {
    switch (s) {
      case 'Resolved':
        return AppTheme.statusResolved;
      case 'In Progress':
        return AppTheme.statusInProgress;
      default:
        return AppTheme.statusPending;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (issues.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.map_outlined,
                color: AppTheme.textSecondary, size: 48),
            const SizedBox(height: 12),
            Text('No issues to display',
                style: TextStyle(color: textSecondary, fontSize: 15)),
            const SizedBox(height: 6),
            Text('Add a Google Maps API key in web/index.html for map view',
                style: TextStyle(color: textSecondary, fontSize: 12),
                textAlign: TextAlign.center),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      itemCount: issues.length,
      itemBuilder: (_, i) {
        final m = issues[i];
        final status = m['status'] as String? ?? 'Pending';
        final sc = _statusColor(status);
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withAlpha(10)),
          ),
          child: Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                    color: sc, shape: BoxShape.circle),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(m['title'] as String? ?? '',
                        style: TextStyle(
                            color: textPrimary,
                            fontSize: 13,
                            fontWeight: FontWeight.w600)),
                    Text(
                      '${m['urgency_level'] ?? ''} • ${m['location_address'] ?? 'No address'}',
                      style:
                          TextStyle(color: textSecondary, fontSize: 11),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: sc.withAlpha(25),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(status,
                    style: TextStyle(
                        color: sc,
                        fontSize: 10,
                        fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ).animate(delay: (i * 30).ms).fadeIn();
      },
    );
  }
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

class _StatChip extends StatelessWidget {
  final String label, value;
  final Color color, textPrimary, textSecondary;
  const _StatChip(
      this.label, this.value, this.color, this.textPrimary, this.textSecondary);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value,
              style: TextStyle(
                  color: color, fontSize: 18, fontWeight: FontWeight.w800)),
          Text(label,
              style: TextStyle(color: textSecondary, fontSize: 10)),
        ],
      ),
    );
  }
}
