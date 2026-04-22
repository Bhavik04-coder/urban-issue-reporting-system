import 'package:flutter/foundation.dart';
import '../core/api_service.dart';
import '../models/notification_model.dart';

class NotificationProvider with ChangeNotifier {
  List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  int _unreadCount = 0;

  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount => _unreadCount;

  Future<void> loadNotifications(String token) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await ApiService.getNotifications(token);
      _notifications = (data['notifications'] as List<dynamic>)
          .map((e) => NotificationModel.fromApi(e as Map<String, dynamic>))
          .toList();
      _unreadCount = data['unread_count'] as int? ?? 0;
    } catch (e) {
      debugPrint('loadNotifications error: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> markRead(String token, int notifId) async {
    try {
      await ApiService.markNotificationRead(token, notifId);
      final idx = _notifications.indexWhere((n) => n.id == notifId);
      if (idx != -1 && !_notifications[idx].isRead) {
        _notifications[idx] = _notifications[idx].copyWith(isRead: true);
        _unreadCount = (_unreadCount - 1).clamp(0, 9999);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('markRead error: $e');
    }
  }

  Future<void> markAllRead(String token) async {
    try {
      await ApiService.markAllNotificationsRead(token);
      _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
      _unreadCount = 0;
      notifyListeners();
    } catch (e) {
      debugPrint('markAllRead error: $e');
    }
  }
}
