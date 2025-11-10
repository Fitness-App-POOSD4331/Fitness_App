// lib/screens/run_tracker_screen.dart
import 'package:flutter/material.dart';
import 'package:pedometer/pedometer.dart';
import '../models/run_model.dart';
import '../services/run_service.dart';

class RunTrackerScreen extends StatefulWidget {
  const RunTrackerScreen({super.key});

  @override
  State<RunTrackerScreen> createState() => _RunTrackerScreenState();
}

class _RunTrackerScreenState extends State<RunTrackerScreen> {
  late Stream<StepCount> _stepCountStream;
  int _steps = 0;
  DateTime _startTime = DateTime.now();
  final RunService _apiService = RunService();

  @override
  void initState() {
    super.initState();
    _startPedometerStream();
  }

  void _startPedometerStream() {
    // Check if step count is supported and start listening
    _stepCountStream = Pedometer.stepCountStream;
    _stepCountStream.listen(
      _onStepCount,
      onError: _onStepCountError,
      cancelOnError: true,
    );
    _startTime = DateTime.now();
  }

  void _onStepCount(StepCount event) {
    // Pedometer gives cumulative steps since boot,
    // so we must calculate the difference for the run.
    // For simplicity, this example just tracks total steps
    // from when the stream started. You may need more complex
    // logic based on your use case (e.g., getting the initial step count).
    setState(() {
      _steps = event.steps;
    });
  }

  void _onStepCountError(error) {
    print('Pedometer Error: $error');
    // Inform the user if the sensor is unavailable or permission is denied
    setState(() {
      _steps = 0;
    });
  }

  Future<void> _endRunAndSubmit() async {
    final finishTime = DateTime.now();

    // 1. Create the Run model (using dummy data for other fields)
    final newRun = Run(
      id: '', // Server assigns ID
      distance: 5.2, // e.g., from GPS service
      time: 35, // e.g., 35 minutes
      averagePace: 6.73,
      caloriesBurned: 450,
      startTime: _startTime,
      finishTime: finishTime,
      steps: _steps, // <-- The key data from the pedometer
    );

    // 2. Submit to the server
    try {
      await _apiService.createRun(newRun);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Run and steps saved successfully!')),
      );
      // Reset tracker state
      setState(() {
        _steps = 0;
        _startTime = DateTime.now();
      });
      _startPedometerStream();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving run: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Run Tracker')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text('Total Steps This Run:', style: TextStyle(fontSize: 24)),
            Text('$_steps', style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _endRunAndSubmit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 20),
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
              child: const Text('End Run & Submit Data', style: TextStyle(fontSize: 18)),
            ),
          ],
        ),
      ),
    );
  }
}