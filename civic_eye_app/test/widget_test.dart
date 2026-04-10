import 'package:flutter_test/flutter_test.dart';
import 'package:civic_eye_app/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CivicEyeApp());
    expect(find.byType(CivicEyeApp), findsOneWidget);
  });
}
