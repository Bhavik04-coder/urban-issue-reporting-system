import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Feature 10: Offline draft saving for report forms.
class DraftService {
  static const _key = 'report_draft';

  static Future<void> saveDraft({
    required String title,
    required String description,
    required String category,
    required String urgency,
    required String location,
    required double lat,
    required double lng,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode({
        'title': title,
        'description': description,
        'category': category,
        'urgency': urgency,
        'location': location,
        'lat': lat,
        'lng': lng,
        'saved_at': DateTime.now().toIso8601String(),
      }),
    );
  }

  static Future<Map<String, dynamic>?> loadDraft() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearDraft() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }

  static Future<bool> hasDraft() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey(_key);
  }
}
