import 'package:flutter/material.dart';

class UserReportsScreen extends StatelessWidget {
  const UserReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Issues'),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Stats
          Row(
            children: [
              Expanded(child: _buildStatCard('0', 'Total', Colors.blue)),
              const SizedBox(width: 12),
              Expanded(child: _buildStatCard('0', 'Resolved', Colors.green)),
              const SizedBox(width: 12),
              Expanded(child: _buildStatCard('0', 'Pending', Colors.orange)),
            ],
          ),
          const SizedBox(height: 24),

          // Empty State
          Center(
            child: Column(
              children: [
                Icon(Icons.inbox, size: 64, color: Colors.grey[300]),
                const SizedBox(height: 16),
                Text(
                  'No reports yet',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your submitted issues will appear here',
                  style: TextStyle(color: Colors.grey[500]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String value, String label, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}
