import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../providers/theme_provider.dart';

/// Demo screen to showcase all theme colors
/// Access via: Navigator.push(context, MaterialPageRoute(builder: (_) => ThemeDemoScreen()))
class ThemeDemoScreen extends StatelessWidget {
  const ThemeDemoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppTheme.bgDark : AppTheme.bgLight;
    final textPrimary = isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        title: Text('Theme Colors', style: TextStyle(color: textPrimary)),
        backgroundColor: bg,
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: () => context.read<ThemeProvider>().toggleTheme(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Section(
            title: '🇮🇳 Indian Flag Colors',
            textPrimary: textPrimary,
            children: [
              _ColorTile('Saffron', AppTheme.saffron, 'Courage & Sacrifice'),
              _ColorTile('Saffron Dark', AppTheme.saffronDark, 'Hover/Pressed'),
              _ColorTile('Saffron Light', AppTheme.saffronLight, 'Highlights'),
              const SizedBox(height: 8),
              _ColorTile('White', AppTheme.white, 'Peace & Truth'),
              _ColorTile('Off White', AppTheme.whiteOff, 'Backgrounds'),
              const SizedBox(height: 8),
              _ColorTile('Green', AppTheme.green, 'Growth & Prosperity'),
              _ColorTile('Green Dark', AppTheme.greenDark, 'Emphasis'),
              _ColorTile('Green Light', AppTheme.greenLight, 'Success'),
              const SizedBox(height: 8),
              _ColorTile('Blue', AppTheme.blue, 'Justice & Progress'),
              _ColorTile('Blue Dark', AppTheme.blueDark, 'Depth'),
              _ColorTile('Blue Light', AppTheme.blueLight, 'Info'),
            ],
          ),
          const SizedBox(height: 24),
          _Section(
            title: '🎨 Semantic Colors',
            textPrimary: textPrimary,
            children: [
              _ColorTile('Primary', AppTheme.primary, 'Main actions'),
              _ColorTile('Secondary', AppTheme.secondary, 'Success/Complete'),
              _ColorTile('Accent', AppTheme.accent, 'Info/Links'),
              _ColorTile('Warning', AppTheme.warning, 'Caution'),
              _ColorTile('Error', AppTheme.error, 'Errors/Danger'),
            ],
          ),
          const SizedBox(height: 24),
          _Section(
            title: '📊 Status Colors',
            textPrimary: textPrimary,
            children: [
              _ColorTile('Pending', AppTheme.statusPending, 'Awaiting review'),
              _ColorTile('In Progress', AppTheme.statusInProgress, 'Active work'),
              _ColorTile('Resolved', AppTheme.statusResolved, 'Completed'),
              _ColorTile('Rejected', AppTheme.statusRejected, 'Issues'),
            ],
          ),
          const SizedBox(height: 24),
          _Section(
            title: '🏛️ Department Colors',
            textPrimary: textPrimary,
            children: [
              _ColorTile('Road Dept', AppTheme.deptRoad, 'Potholes, roads'),
              _ColorTile('Water Dept', AppTheme.deptWater, 'Water supply'),
              _ColorTile('Electricity', AppTheme.deptElec, 'Streetlights'),
              _ColorTile('Sanitation', AppTheme.deptSanit, 'Garbage'),
            ],
          ),
          const SizedBox(height: 24),
          _Section(
            title: '🎭 Theme Surfaces',
            textPrimary: textPrimary,
            children: [
              _ColorTile(
                'Background',
                isDark ? AppTheme.bgDark : AppTheme.bgLight,
                'Screen background',
              ),
              _ColorTile(
                'Surface',
                isDark ? AppTheme.surfaceDark : AppTheme.surfaceLight,
                'Base surface',
              ),
              _ColorTile(
                'Surface Card',
                isDark ? AppTheme.surfaceCardDark : AppTheme.surfaceCardLight,
                'Elevated cards',
              ),
              _ColorTile(
                'Text Primary',
                isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
                'Main text',
              ),
              _ColorTile(
                'Text Secondary',
                isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                'Hints, labels',
              ),
            ],
          ),
          const SizedBox(height: 24),
          _Section(
            title: '🔘 Buttons',
            textPrimary: textPrimary,
            children: [
              ElevatedButton(
                onPressed: () {},
                child: const Text('Primary Button'),
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.secondary,
                ),
                child: const Text('Secondary Button'),
              ),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.saffron),
                ),
                child: Text('Outlined Button',
                    style: TextStyle(color: textPrimary)),
              ),
            ],
          ),
          const SizedBox(height: 100),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final Color textPrimary;
  final List<Widget> children;

  const _Section({
    required this.title,
    required this.textPrimary,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }
}

class _ColorTile extends StatelessWidget {
  final String name;
  final Color color;
  final String description;

  const _ColorTile(this.name, this.color, this.description);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight;
    final subtextColor = isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withAlpha(100)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: color.withAlpha(80),
                  blurRadius: 8,
                  spreadRadius: 1,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  description,
                  style: TextStyle(
                    color: subtextColor,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '#${color.value.toRadixString(16).substring(2).toUpperCase()}',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 11,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }
}
