import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:exerciseapp/screens/run_screen.dart';
import 'package:exerciseapp/services/pedometer_adapter.dart';
import 'package:exerciseapp/services/ticker.dart';

void main() {
  testWidgets('RunTrackingScreen responds to FakePedometerAdapter events',
      (WidgetTester tester) async {
    // Ensure a realistic test window size to avoid layout overflows in tests
    final binding = TestWidgetsFlutterBinding.ensureInitialized();
    binding.window.physicalSizeTestValue = const Size(1080, 1920);
    binding.window.devicePixelRatioTestValue = 1.0;
    final adapter = FakePedometerAdapter();
    final fakeTicker = FakeTicker();

    await tester.pumpWidget(
      MaterialApp(
        home: RunTrackingScreen(
          pedometerAdapter: adapter,
          injectedUserWeight: 70.0,
          // Inject a fake ticker so tests can deterministically advance time
          ticker: fakeTicker,
        ),
      ),
    );

    // Start the step tracking subscription (the widget doesn't subscribe
    // automatically on init; tests should start it explicitly).
    final state = tester.state(find.byType(RunTrackingScreen));
    (state as dynamic).startStepTracking();
    await tester.pump();

    // Emit baseline and then 10 steps
    adapter.add(1000);
    await tester.pump();

    adapter.add(1010);
    // Simulate one second passing via the fake ticker
    fakeTicker.tick();
    await tester.pump();

    final expectedMiles = (10 * 2.0) / 5280.0;
    final expectedText = '${expectedMiles.toStringAsFixed(3)} miles';
    expect(find.textContaining(expectedText), findsOneWidget);

    // Clean up
    await adapter.close();
    await tester.pumpWidget(Container());
    await tester.pumpAndSettle();
    binding.window.clearPhysicalSizeTestValue();
    binding.window.clearDevicePixelRatioTestValue();
  });
}
