import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/report_model.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._internal();
  static Database? _db;

  DatabaseHelper._internal();

  Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    if (kIsWeb) {
      return openDatabase('civic_eye_web.db', version: 1, onCreate: _onCreate);
    }
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'civic_eye.db');
    return openDatabase(path, version: 1, onCreate: _onCreate);
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        urgency TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        department TEXT,
        location_address TEXT,
        latitude REAL,
        longitude REAL,
        image_path TEXT,
        ai_label TEXT,
        ai_confidence REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    ''');

    await db.execute('''
      CREATE TABLE activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        user_id INTEGER,
        action TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
      )
    ''');

    // Seed default admin
    await db.insert('users', {
      'email': 'admin@civiceye.com',
      'password_hash': 'Admin@123',
      'full_name': 'System Admin',
      'mobile': '9999999999',
      'is_admin': 1,
      'created_at': DateTime.now().toIso8601String(),
    });
  }

  // ── Users ──────────────────────────────────────────────
  Future<int> insertUser(UserModel user) async {
    final db = await database;
    return db.insert('users', user.toMap(), conflictAlgorithm: ConflictAlgorithm.abort);
  }

  Future<UserModel?> getUserByEmail(String email) async {
    final db = await database;
    final rows = await db.query('users', where: 'email = ?', whereArgs: [email]);
    if (rows.isEmpty) return null;
    return UserModel.fromMap(rows.first);
  }

  Future<UserModel?> getUserById(int id) async {
    final db = await database;
    final rows = await db.query('users', where: 'id = ?', whereArgs: [id]);
    if (rows.isEmpty) return null;
    return UserModel.fromMap(rows.first);
  }

  Future<int> updateUser(UserModel user) async {
    final db = await database;
    return db.update('users', user.toMap(), where: 'id = ?', whereArgs: [user.id]);
  }

  // ── Reports ────────────────────────────────────────────
  Future<int> insertReport(ReportModel report) async {
    final db = await database;
    return db.insert('reports', report.toMap());
  }

  Future<List<ReportModel>> getReportsByUser(int userId) async {
    final db = await database;
    final rows = await db.query('reports',
        where: 'user_id = ?', whereArgs: [userId], orderBy: 'created_at DESC');
    return rows.map(ReportModel.fromMap).toList();
  }

  Future<List<ReportModel>> getAllReports() async {
    final db = await database;
    final rows = await db.query('reports', orderBy: 'created_at DESC');
    return rows.map(ReportModel.fromMap).toList();
  }

  Future<ReportModel?> getReportById(int id) async {
    final db = await database;
    final rows = await db.query('reports', where: 'id = ?', whereArgs: [id]);
    if (rows.isEmpty) return null;
    return ReportModel.fromMap(rows.first);
  }

  Future<int> updateReport(ReportModel report) async {
    final db = await database;
    return db.update('reports', report.toMap(), where: 'id = ?', whereArgs: [report.id]);
  }

  Future<int> updateReportStatus(int id, String status) async {
    final db = await database;
    return db.update('reports', {
      'status': status,
      'updated_at': DateTime.now().toIso8601String(),
    }, where: 'id = ?', whereArgs: [id]);
  }

  Future<int> deleteReport(int id) async {
    final db = await database;
    return db.delete('reports', where: 'id = ?', whereArgs: [id]);
  }

  Future<Map<String, int>> getAdminStats() async {
    final db = await database;
    final total = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM reports')) ?? 0;
    final resolved = Sqflite.firstIntValue(await db.rawQuery("SELECT COUNT(*) FROM reports WHERE status='Resolved'")) ?? 0;
    final pending = Sqflite.firstIntValue(await db.rawQuery("SELECT COUNT(*) FROM reports WHERE status='Pending'")) ?? 0;
    final inProgress = Sqflite.firstIntValue(await db.rawQuery("SELECT COUNT(*) FROM reports WHERE status='In Progress'")) ?? 0;
    return {'total': total, 'resolved': resolved, 'pending': pending, 'inProgress': inProgress};
  }

  Future<Map<String, int>> getUserStats(int userId) async {
    final db = await database;
    final total = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM reports WHERE user_id=?', [userId])) ?? 0;
    final resolved = Sqflite.firstIntValue(await db.rawQuery("SELECT COUNT(*) FROM reports WHERE user_id=? AND status='Resolved'", [userId])) ?? 0;
    final pending = Sqflite.firstIntValue(await db.rawQuery("SELECT COUNT(*) FROM reports WHERE user_id=? AND status='Pending'", [userId])) ?? 0;
    return {'total': total, 'resolved': resolved, 'pending': pending};
  }

  // ── Activity Logs ──────────────────────────────────────
  Future<void> logActivity(int? reportId, int? userId, String action, String desc) async {
    final db = await database;
    await db.insert('activity_logs', {
      'report_id': reportId,
      'user_id': userId,
      'action': action,
      'description': desc,
      'created_at': DateTime.now().toIso8601String(),
    });
  }
}
