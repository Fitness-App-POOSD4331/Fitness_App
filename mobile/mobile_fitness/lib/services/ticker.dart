import 'dart:async';

/// A simple ticker abstraction to allow tests to control the per-second
/// ticks without relying on real Timer.periodic instances.
abstract class Ticker {
  /// Start the ticker. The provided [onTick] callback will be called once per
  /// tick. Implementations should call [onTick] on a regular interval while
  /// the ticker is active.
  void start(void Function() onTick);

  /// Stop the ticker and release any resources.
  void stop();

  /// Whether the ticker is currently active.
  bool get isActive;
}

/// Production ticker that uses [Timer.periodic].
class RealTicker implements Ticker {
  Timer? _timer;
  bool _active = false;

  @override
  void start(void Function() onTick) {
    if (_active) return;
    _active = true;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      try {
        onTick();
      } catch (_) {}
    });
  }

  @override
  void stop() {
    _timer?.cancel();
    _timer = null;
    _active = false;
  }

  @override
  bool get isActive => _active;
}

/// A fake ticker suitable for tests. Call [tick] to simulate a single second
/// passing while the ticker is active.
class FakeTicker implements Ticker {
  void Function()? _onTick;
  bool _active = false;

  @override
  void start(void Function() onTick) {
    _onTick = onTick;
    _active = true;
  }

  /// Simulate a single tick (one second).
  void tick() {
    if (_active && _onTick != null) {
      _onTick!();
    }
  }

  @override
  void stop() {
    _active = false;
    _onTick = null;
  }

  @override
  bool get isActive => _active;
}
