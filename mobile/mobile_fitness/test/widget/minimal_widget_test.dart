import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('minimal widget test - renders MaterialApp', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: Center(child: Text('hello')))));

    expect(find.text('hello'), findsOneWidget);
  });
}
