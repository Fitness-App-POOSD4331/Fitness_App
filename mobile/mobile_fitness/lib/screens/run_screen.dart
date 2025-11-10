import 'package:flutter/material.dart';
import 'dart:io' show Platform;
import 'dart:async';
import '../services/ticker.dart';
import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode;
import '../services/pedometer_adapter.dart';
import '../models/run_model.dart';
import '../services/user_service.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/run_provider.dart';
import '../screens/login_screen.dart';
import '../screens/profile_screen.dart';

class RunTrackingScreen extends StatefulWidget {
  const RunTrackingScreen({
    super.key,
    this.stepCountStream,
    this.injectedUserWeight,
    this.autoStartTimer = true,
    this.pedometerAdapter,
    this.ticker,
    this.isTesting = false,
  });

  final bool autoStartTimer;
  final Stream<dynamic>? stepCountStream;
  final PedometerAdapter? pedometerAdapter;
  final Ticker? ticker;
  final double? injectedUserWeight;
  final bool isTesting;

  @override
  State<RunTrackingScreen> createState() => _RunTrackingScreenState();
}

class _RunTrackingScreenState extends State<RunTrackingScreen>
    with SingleTickerProviderStateMixin {
  bool isRunning = false;
  double currentDistanceFeet = 0;
  double currentDistanceMiles = 0;
  double sessionFeet = 0;
  double sessionMiles = 0;
  double? userWeight;
  String? userSex;
  DateTime? startTime;
  DateTime? endTime;
  StreamSubscription<dynamic>? _stepCountSubscription;
  PedometerAdapter? realAdapter;
  int _steps = 0;
  int? _initialSteps;
  int runTotalSteps = 0;
  double averageStepLength = 2.0;
  Ticker? _activeTicker;
  int _seconds = 0;
  bool _isRunning = false;
  final TextEditingController _descriptionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadProfile();
    requestPermissions();
  }

  void _loadProfile() async {
    if (widget.injectedUserWeight != null) {
      userWeight = widget.injectedUserWeight;
      return;
    }

    try {
      final profile = await UserService().getProfile();
      userWeight = profile.weight;
      userSex = profile.sex;
    } catch (e) {
      if (kDebugMode) print('Warning: failed to load profile: $e');
    }
  }

  Future<void> requestPermissions() async {
    if (kIsWeb) return;
    if (!Platform.isAndroid) return;

    var status = await Permission.activityRecognition.request();

    if (status.isDenied) {
      _showPermissionDialog();
    }
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Permission Required"),
          content: const Text(
            "This app needs Activity Recognition permission to track your steps.",
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text("Cancel"),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                requestPermissions();
              },
              child: const Text("Try Again"),
            ),
          ],
        );
      },
    );
  }

  void _startTimer() {
    if (_isRunning) return;
    _isRunning = true;
    if (kDebugMode) print('RunTrackingScreen: starting timer');
    final Ticker ticker = widget.ticker ?? RealTicker();
    _activeTicker = ticker;
    ticker.start(() {
      if (!mounted) return;
      setState(() {
        _seconds++;
      });
    });
  }

  void _stopTimer() {
    if (_activeTicker != null) {
      if (kDebugMode) print('RunTrackingScreen: stopping timer');
      _activeTicker?.stop();
      _activeTicker = null;
    }
    _isRunning = false;
  }

  void _resetTimer() {
    _stopTimer();
    setState(() {
      _seconds = 0;
    });
  }

  String get formattedTime {
    int minutes = _seconds ~/ 60;
    int seconds = _seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void startStepTracking() {
    if (widget.autoStartTimer) {
      _startTimer();
    }

    if (kIsWeb) return;

    Stream<dynamic>? stream;
    if (widget.pedometerAdapter != null) {
      stream = widget.pedometerAdapter!.stepCountStream;
    } else if (widget.stepCountStream != null) {
      stream = widget.stepCountStream;
    } else {
      if (kDebugMode) {
        print('RunTrackingScreen: no pedometer provided — skipping pedometer subscription (debug)');
      }
      stream = null;
    }

    if(!widget.isTesting) {
      realAdapter = RealPedometerAdapter();
      stream = realAdapter!.stepCountStream;
    }

    if (stream != null) {
      _stepCountSubscription = stream.listen(
        onStepCount,
        onError: onStepCountError,
      );
      if (kDebugMode) print('RunTrackingScreen: subscribed to step stream');
    }
  }

  void stopStepTracking() {
    _initialSteps = null;
    if (_stepCountSubscription != null) {
      if (kDebugMode) print('RunTrackingScreen: cancelling step subscription');
      _stepCountSubscription?.cancel();
      _stepCountSubscription = null;
    }
  }

  void onStepCount(dynamic event) {
    setState(() {
      _steps = event.steps;
      _initialSteps ??= _steps;
      final stepsSinceStart = _steps - _initialSteps!;
      final newDistanceFeet = stepsSinceStart * averageStepLength;
      final newDistanceMiles = newDistanceFeet / 5280.0;
      currentDistanceFeet = newDistanceFeet;
      currentDistanceMiles = newDistanceMiles;
    });
  }

  void onStepCountError(error) {
    if (kDebugMode) print("Step Count Error: $error");
  }

  void startRun() {
    setState(() {
      isRunning = true;
      if (currentDistanceFeet == 0) {
        startTime = DateTime.now();
      }
    });
    startStepTracking();
  }

  void stopRun() {
    setState(() {
      isRunning = false;
    });
    _stopTimer();
    stopStepTracking();
    endTime = DateTime.now();
  }

  void resetRun() {
    setState(() {
      _initialSteps = null;
      _steps = 0;
      currentDistanceFeet = 0;
      currentDistanceMiles = 0;
      startTime = null;
      endTime = null;
      _descriptionController.clear();
      stopStepTracking();
      _resetTimer();
    });
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    if (_activeTicker != null) {
      if (kDebugMode) print('RunTrackingScreen: disposing - cancelling ticker');
      _activeTicker?.stop();
      _activeTicker = null;
    }
    if (_stepCountSubscription != null) {
      if (kDebugMode) print('RunTrackingScreen: disposing - cancelling step subscription');
      _stepCountSubscription?.cancel();
      _stepCountSubscription = null;
    }
    super.dispose();
  }

  double calculateMiles() => currentDistanceFeet / 5280;

  double calculatePace() {
    if (currentDistanceFeet == 0) return 0;
    return (_seconds.toDouble() / 60) / calculateMiles();
  }

  double calculateCalories() {
    double met;
    double paceMinPerMile = calculatePace();
    if (paceMinPerMile >= 12) {
      met = 8.3;
    } else if (paceMinPerMile >= 10) {
      met = 9.8;
    } else if (paceMinPerMile >= 8.5) {
      met = 11.0;
    } else {
      met = 11.8;
    }
    if (userWeight == null) return 0.0;
    return met * 3.5 * userWeight! / 200 * (_seconds / 60.0);
  }

  void logRunData() async {
    print('Logging run: Distance: $currentDistanceMiles miles');
    final runProvider = Provider.of<RunProvider>(context, listen: false);

    double sendTime = double.parse(_seconds.toStringAsFixed(2));
    double sendCals = double.parse(calculateCalories().toStringAsFixed(2));

    final run = Run(
      distance: currentDistanceMiles,
      time: sendTime,
      averagePace: calculatePace(),
      caloriesBurned: sendCals,
      startTime: startTime!,
      finishTime: endTime!,
      //description: _descriptionController.text.trim(),
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Run logged succesfully')),
    );

    await runProvider.logRun(run);
    resetRun();

    //Navigate to the profile screen after logging a run
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ProfileScreen()),);

  }

  String formatTime(int seconds) {
    int hours = seconds ~/ 3600;
    int minutes = (seconds % 3600) ~/ 60;
    int secs = seconds % 60;
    return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF4A90E2),
              Color(0xFF7AB8F5),
              Color(0xFFA8D5FF),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Custom AppBar
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                    const Expanded(
                      child: Text(
                        'Sky Run Tracker',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    IconButton(
                      tooltip: 'Logout',
                      icon: const Icon(Icons.logout, color: Colors.white),
                      onPressed: () async {
                        final auth = Provider.of<AuthProvider>(context, listen: false);
                        try {
                          await auth.logout();
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Logged out')),
                            );
                            Navigator.of(context).pushAndRemoveUntil(
                              MaterialPageRoute(builder: (_) => const LoginScreen()),
                              (route) => false,
                            );
                          }
                        } catch (e) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Logout failed: ${e.toString()}')),
                            );
                          }
                        }
                      },
                    ),
                  ],
                ),
              ),

              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Stats Cards
                      Expanded(
                        flex: 3,
                        child: Row(
                          children: [
                            // Distance Card
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.9),
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 10,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(20.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.straighten, size: 48, color: Color(0xFF4A90E2)),
                                      const SizedBox(height: 12),
                                      const Text('Distance',
                                          style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w500,
                                              color: Colors.grey)),
                                      const SizedBox(height: 8),
                                      // <-- FIXED: combined number + unit in one Text
                                      Text(
                                        '${currentDistanceMiles.toStringAsFixed(3)} miles',
                                        style: const TextStyle(
                                          fontSize: 32,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF4A90E2),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            // Time Card
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.9),
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 10,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(20.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.timer, size: 48, color: Color(0xFF4A90E2)),
                                      const SizedBox(height: 12),
                                      const Text('Time',
                                          style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w500,
                                              color: Colors.grey)),
                                      const SizedBox(height: 8),
                                      Text(
                                        formattedTime,
                                        style: const TextStyle(
                                          fontSize: 32,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF4A90E2),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      const SizedBox(height: 20),

                      // Action Buttons
                      Column(
                        children: [
                          SizedBox(
                            width: double.infinity,
                            height: 60,
                            child: ElevatedButton(
                              onPressed: isRunning ? stopRun : startRun,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isRunning ? Colors.red : Colors.green,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 5,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(isRunning ? Icons.stop : Icons.play_arrow, size: 28),
                                  const SizedBox(width: 8),
                                  Text(
                                    isRunning ? 'Stop Run' : 'Start Run',
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: SizedBox(
                                  height: 55,
                                  child: OutlinedButton(
                                    onPressed: !isRunning ? resetRun : null,
                                    style: OutlinedButton.styleFrom(
                                      backgroundColor: Colors.white.withOpacity(0.9),
                                      side: BorderSide(
                                        color: !isRunning ? Colors.red : Colors.grey,
                                        width: 2,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                    ),
                                    child: const Text(
                                      'Reset',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: SizedBox(
                                  height: 55,
                                  child: ElevatedButton(
                                    onPressed: !isRunning && (currentDistanceFeet > 0)
                                        ? logRunData
                                        : null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF4A90E2),
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      elevation: 3,
                                    ),
                                    child: const Text(
                                      'Log Run',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
