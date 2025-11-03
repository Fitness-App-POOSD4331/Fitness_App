// lib/screens/run_tracker_screen.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Import for PlatformException
import 'package:pedometer/pedometer.dart';
import 'package:permission_handler/permission_handler.dart';
import '../models/run_model.dart';
import '../services/run_service.dart';

class RunTrackerScreen extends StatefulWidget {
  const RunTrackerScreen({super.key});

  @override
  State<RunTrackerScreen> createState() => _RunTrackerScreenState();
}

class _RunTrackerScreenState extends State<RunTrackerScreen> {
  StreamSubscription<StepCount>? _stepSubscription;
  int _initialSteps = -1;
  int _steps = 0;

  DateTime _startTime = DateTime.now();
  final RunService _apiService = RunService();
  PermissionStatus _permissionStatus = PermissionStatus.denied;
  // ⭐ 1. STATE TO TRACK SENSOR AVAILABILITY ⭐
  bool _isSensorAvailable = true;

  @override
  void initState() {
    super.initState();
    _requestActivityPermission();
  }

  @override
  void dispose() {
    _stepSubscription?.cancel();
    super.dispose();
  }

  Future<void> _requestActivityPermission() async {
    final status = await Permission.activityRecognition.request();
    if (!mounted) return;

    setState(() {
      _permissionStatus = status;
    });

    if (status.isGranted) {
      _startPedometerStream();
    }
  }

  void _startPedometerStream() {
    _stepSubscription?.cancel();
    _stepSubscription = Pedometer.stepCountStream.listen(
      _onStepCount,
      onError: _onStepCountError,
      cancelOnError: true,
    );
    _startTime = DateTime.now();
  }

  void _onStepCount(StepCount event) {
    if (!mounted) return;
    if (_initialSteps < 0) {
      _initialSteps = event.steps;
    }
    setState(() {
      _steps = event.steps - _initialSteps;
    });
  }

  // ⭐ 2. CATCH THE SPECIFIC HARDWARE ERROR ⭐
  void _onStepCountError(error) {
    print('Pedometer Error: $error');
    if (error is PlatformException && error.code == '1') {
      if (mounted) {
        setState(() {
          _isSensorAvailable = false;
        });
      }
    } else {
       if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Pedometer Error: $error')),
        );
      }
    }
  }

  Future<void> _endRunAndSubmit() async {
    if (_steps < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You need more than 10 steps to save a run!')),
      );
      return;
    }
    final newRun = _createMockRun();
    try {
      await _apiService.createRun(newRun);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Run and steps saved successfully!')),
      );
      setState(() {
        _steps = 0;
        _initialSteps = -1;
        _startTime = DateTime.now();
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving run: ${e.toString()}')),
      );
    }
  }
  
  Run _createMockRun() {
    final finishTime = DateTime.now();
    final duration = finishTime.difference(_startTime);
    final timeInMinutes = duration.inSeconds / 60;
    const stepsPerKilometer = 1250;
    const caloriesPerStep = 0.04;
    final distanceInKm = _steps / stepsPerKilometer;
    final calories = _steps * caloriesPerStep;
    final pace = distanceInKm > 0 ? timeInMinutes / distanceInKm : 0;
    return Run(
      id: '',
      distance: double.parse(distanceInKm.toStringAsFixed(2)),
      time: duration.inSeconds,
      averagePace: double.parse(pace.toStringAsFixed(2)),
      caloriesBurned: double.parse(calories.toStringAsFixed(2)),
      startTime: _startTime,
      finishTime: finishTime,
      steps: _steps,
      description: 'Run with $_steps steps from web app',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Run Tracker')),
      body: Center(
        child: _buildBody(),
      ),
    );
  }

  // ⭐ 3. BODY NOW HANDLES SENSOR UNAVAILABLE STATE ⭐
  Widget _buildBody() {
    // First, check for the hardware sensor
    if (!_isSensorAvailable) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 60, color: Colors.red),
            SizedBox(height: 16),
            Text(
              'Step Counter Not Available',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 16),
            Text(
              'Sorry, your device does not have the required hardware sensor for step counting.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }
    
    // Then, check for permissions
    if (_permissionStatus.isGranted) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          const Text('Steps This Run:', style: TextStyle(fontSize: 24)),
          Text('$_steps', style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold)),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: _endRunAndSubmit,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 20),
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('End Run & Submit'),
          ),
        ],
      );
    }

    // Finally, show permission UI if needed
    return _buildPermissionDeniedUI(
      isPermanentlyDenied: _permissionStatus.isPermanentlyDenied,
    );
  }

  Widget _buildPermissionDeniedUI({bool isPermanentlyDenied = false}) {
    final title = isPermanentlyDenied ? 'Permission Permanently Denied' : 'Activity Permission Required';
    final content = isPermanentlyDenied
        ? 'To use the step tracker, you must manually enable the Physical Activity permission in your phone settings.'
        : 'This feature requires permission to access your physical activity data to count your steps. Please grant the permission to continue.';
    final buttonText = isPermanentlyDenied ? 'Open Settings' : 'Grant Permission';
    final onPressed = isPermanentlyDenied ? openAppSettings : _requestActivityPermission;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
          const SizedBox(height: 16),
          Text(content, textAlign: TextAlign.center),
          const SizedBox(height: 24),
          ElevatedButton(onPressed: onPressed, child: Text(buttonText)),
        ],
      ),
    );
  }
}
