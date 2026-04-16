import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Handles local notifications for status update alerts.
/// FCM integration requires Firebase project setup (google-services.json /
/// GoogleService-Info.plist). This service works standalone for local
/// notifications and is ready to wire up FCM once Firebase is configured.
class NotificationService {
  static final _plugin = FlutterLocalNotificationsPlugin();
  static bool _initialized = false;

  static Future<void> init() async {
    if (_initialized) return;
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings =
        InitializationSettings(android: android, iOS: ios);
    await _plugin.initialize(settings);
    _initialized = true;
  }

  static Future<void> showStatusUpdate({
    required int reportId,
    required String title,
    required String newStatus,
  }) async {
    if (!_initialized) await init();

    const androidDetails = AndroidNotificationDetails(
      'status_updates',
      'Status Updates',
      channelDescription: 'Notifications when your report status changes',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    const iosDetails = DarwinNotificationDetails();
    const details =
        NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _plugin.show(
      reportId,
      'Report #${reportId.toString().padLeft(5, '0')} Updated',
      'Status changed to: $newStatus',
      details,
    );
  }

  static Future<void> showGeneral({
    required int id,
    required String title,
    required String body,
  }) async {
    if (!_initialized) await init();

    const androidDetails = AndroidNotificationDetails(
      'general',
      'General',
      channelDescription: 'General app notifications',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );
    const iosDetails = DarwinNotificationDetails();
    const details =
        NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _plugin.show(id, title, body, details);
  }
}
