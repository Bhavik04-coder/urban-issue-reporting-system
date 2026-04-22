import 'package:flutter/material.dart';
import '../core/theme.dart';

/// A horizontal strip of image thumbnails. Tapping opens a full-screen viewer.
class ReportImageStrip extends StatelessWidget {
  final List<String> images;
  final String baseUrl;

  const ReportImageStrip({
    super.key,
    required this.images,
    required this.baseUrl,
  });

  String _fullUrl(String path) {
    if (path.startsWith('http')) return path;
    return '$baseUrl$path';
  }

  @override
  Widget build(BuildContext context) {
    if (images.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 80,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: images.length,
        itemBuilder: (_, i) {
          final url = _fullUrl(images[i]);
          return GestureDetector(
            onTap: () => _openViewer(context, i),
            child: Container(
              width: 80,
              height: 80,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white.withAlpha(20)),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(
                  url,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: AppTheme.surfaceLight,
                    child: const Icon(Icons.broken_image_outlined,
                        color: AppTheme.textSecondary, size: 28),
                  ),
                  loadingBuilder: (_, child, progress) {
                    if (progress == null) return child;
                    return Container(
                      color: AppTheme.surfaceLight,
                      child: const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppTheme.primary),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _openViewer(BuildContext context, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _FullScreenImageViewer(
          images: images.map(_fullUrl).toList(),
          initialIndex: initialIndex,
        ),
      ),
    );
  }
}

class _FullScreenImageViewer extends StatefulWidget {
  final List<String> images;
  final int initialIndex;

  const _FullScreenImageViewer({
    required this.images,
    required this.initialIndex,
  });

  @override
  State<_FullScreenImageViewer> createState() => _FullScreenImageViewerState();
}

class _FullScreenImageViewerState extends State<_FullScreenImageViewer> {
  late PageController _controller;
  late int _current;

  @override
  void initState() {
    super.initState();
    _current = widget.initialIndex;
    _controller = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          '${_current + 1} / ${widget.images.length}',
          style: const TextStyle(color: Colors.white, fontSize: 14),
        ),
        centerTitle: true,
      ),
      body: PageView.builder(
        controller: _controller,
        itemCount: widget.images.length,
        onPageChanged: (i) => setState(() => _current = i),
        itemBuilder: (_, i) {
          return InteractiveViewer(
            child: Center(
              child: Image.network(
                widget.images[i],
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.broken_image_outlined,
                          color: Colors.white54, size: 64),
                      SizedBox(height: 12),
                      Text('Image not available',
                          style: TextStyle(color: Colors.white54)),
                    ],
                  ),
                ),
                loadingBuilder: (_, child, progress) {
                  if (progress == null) return child;
                  return const Center(
                    child: CircularProgressIndicator(color: Colors.white),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
