import 'dart:async';
import 'package:pedometer/pedometer.dart' as ped;

/// Adapter interface to abstract the pedometer plugin for easier testing.
abstract class PedometerAdapter {
  /// Stream that emits step count-like events. Events should have a `.steps`
  /// property (we use a lightweight StepCountEvent for fakes).
  Stream<dynamic>? get stepCountStream;
}

/// Production adapter that forwards the real plugin stream.
class RealPedometerAdapter implements PedometerAdapter {
  @override
  Stream<dynamic>? get stepCountStream => ped.Pedometer.stepCountStream;
}

/// Lightweight step count event used by the fake adapter in tests.
class StepCountEvent {
  final int steps;
  final DateTime timeStamp;
  StepCountEvent(this.steps, this.timeStamp);
}

/// Fake adapter for tests. Use [add] to emit events and [close] to finish.
class FakePedometerAdapter implements PedometerAdapter {
  final StreamController<dynamic> _controller = StreamController<dynamic>();

  @override
  Stream<dynamic>? get stepCountStream => _controller.stream;

  void add(int steps) => _controller.add(StepCountEvent(steps, DateTime.now()));

  Future<void> close() => _controller.close();
}
