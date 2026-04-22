import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/notification_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/notification_provider.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final token = context.read<AuthProvider>().token;
    if (token != null) {
      await context.read<NotificationProvider>().loadNotifications(token);
    }
  }

  @override
  Widget build(BuildContext context) {
    final np = context.watch<NotificationProvider>();
    final token = context.read<AuthProvider>().token;

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        backgroundColor: AppTheme.bgDark,
        title: const Text('Notifications',
            style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (np.unreadCount > 0)
            TextButton(
              onPressed: () {
                if (token != null) {
                  context.read<NotificationProvider>().markAllRead(token);
                }
              },
              child: const Text('Mark all read',
                  style: TextStyle(color: AppTheme.primary, fontSize: 12)),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppTheme.primary,
        backgroundColor: AppTheme.surfaceCard,
        child: np.isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppTheme.primary))
            : np.notifications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.notifications_none_rounded,
                            color: AppTheme.textSecondary.withAlpha(80), size: 64),
                        const SizedBox(height: 16),
                        const Text('No notifications yet',
                            style: TextStyle(
                                color: AppTheme.textSecondary, fontSize: 16)),
                        const SizedBox(height: 8),
                        const Text('You\'ll be notified about report updates here',
                            style: TextStyle(
                                color: AppTheme.textSecondary, fontSize: 13)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                    itemCount: np.notifications.length,
                    itemBuilder: (_, i) {
                      final n = np.notifications[i];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: _NotifCard(
                          notif: n,
                          onTap: () {
                            if (!n.isRead && token != null) {
                              context.read<NotificationProvider>().markRead(token, n.id);
                            }
                          },
                        ),
                      ).animate(delay: (i * 40).ms).slideX(begin: 0.1).fadeIn();
                    },
                  ),
      ),
    );
  }
}

class _NotifCard extends StatelessWidget {
  final NotificationModel notif;
  final VoidCallback onTap;

  const _NotifCard({required this.notif, required this.onTap});

  Color _typeColor() {
    switch (notif.type) {
      case 'resolved':
        return AppTheme.statusResolved;
      case 'urgent':
      case 'priority_change':
        return AppTheme.accent;
      case 'status_change':
        return AppTheme.statusInProgress;
      default:
        return AppTheme.primary;
    }
  }

  IconData _typeIcon() {
    switch (notif.type) {
      case 'resolved':
        return Icons.check_circle_rounded;
      case 'urgent':
        return Icons.warning_rounded;
      case 'priority_change':
        return Icons.flag_rounded;
      case 'status_change':
        return Icons.update_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = _typeColor();
    final timeStr = DateFormat('MMM d, h:mm a').format(notif.createdAt);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: notif.isRead
              ? AppTheme.surfaceCard
              : AppTheme.surfaceCard.withAlpha(255),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: notif.isRead
                ? Colors.white.withAlpha(10)
                : c.withAlpha(60),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: c.withAlpha(25),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_typeIcon(), color: c, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 13,
                            fontWeight: notif.isRead
                                ? FontWeight.w500
                                : FontWeight.w700,
                          ),
                        ),
                      ),
                      if (!notif.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: c,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notif.message,
                    style: const TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    timeStr,
                    style: TextStyle(
                        color: AppTheme.textSecondary.withAlpha(150), fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
