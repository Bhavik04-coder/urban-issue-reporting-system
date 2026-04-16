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

        // Count stats
        if (status == 'Resolved') {
          resolved++;
        } else if (status == 'In Progress') {
          inProgress++;
        } else {
          pending++;
        }

        final color = _markerColor(status);

        markers.add(
          Marker(
            markerId: MarkerId('issue_$id'),
            position: LatLng(lat, lng),
            icon: BitmapDescriptor.defaultMarkerWithHue(color),
            infoWindow: InfoWindow(
              title: title,
              snippet: '$status • $urgency urgency',
            ),
          ),
        );
      }

      if (mounted) {
        setState(() {
          _markers = markers;
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
    final cardColor =
        isDark ? AppTheme.surfaceCard : AppTheme.surfaceCardLight;
    final textPrimary =
        isDark ? AppTheme.textPrimary : AppTheme.textPrimaryLight;
    final textSecondary =
        isDark ? AppTheme.textSecondary : AppTheme.textSecondaryLight;

    return Scaffold(
      backgroundColor: bg,
      body: Stack(
        children: [
          // Map
          GoogleMap(
            initialCameraPosition: const CameraPosition(
              target: _defaultCenter,
              zoom: 11,
            ),
            markers: _markers,
            onMapCreated: (c) {
              _mapController = c;
              // Suppress unused warning — controller used for future camera moves
              assert(_mapController != null);
            },
            mapType: MapType.normal,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
          ),

          // Top overlay: title + filter chips
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 56, 16, 12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    bg,
                    bg.withAlpha(200),
                    Colors.transparent,
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
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
                      children: ['All', 'Pending', 'In Progress', 'Resolved']
                          .map((f) {
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
                                    color: sel ? Colors.white : textSecondary,
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
          ),

          // Bottom stats card
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(40),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: _loading
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(8),
                        child: CircularProgressIndicator(
                            color: AppTheme.primary, strokeWidth: 2),
                      ),
                    )
                  : Row(
                      children: [
                        _StatChip('Total', '${_stats['total'] ?? 0}',
                            AppTheme.primary, textPrimary, textSecondary),
                        _StatChip('Pending', '${_stats['pending'] ?? 0}',
                            AppTheme.statusPending, textPrimary, textSecondary),
                        _StatChip(
                            'Active',
                            '${_stats['inProgress'] ?? 0}',
                            AppTheme.statusInProgress,
                            textPrimary,
                            textSecondary),
                        _StatChip(
                            'Done',
                            '${_stats['resolved'] ?? 0}',
                            AppTheme.statusResolved,
                            textPrimary,
                            textSecondary),
                      ],
                    ),
            ).animate(delay: 200.ms).slideY(begin: 0.3).fadeIn(),
          ),

          // Loading overlay
          if (_loading)
            const Center(
              child: CircularProgressIndicator(color: AppTheme.primary),
            ),

          // Refresh FAB
          Positioned(
            bottom: 120,
            right: 16,
            child: FloatingActionButton.small(
              onPressed: _loadIssues,
              backgroundColor: AppTheme.primary,
              child: const Icon(Icons.refresh_rounded, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

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
