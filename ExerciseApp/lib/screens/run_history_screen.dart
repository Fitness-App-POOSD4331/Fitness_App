// lib/screens/run_history_screen.dart
import 'package:flutter/material.dart';
import '../models/run_model.dart';
import '../services/run_service.dart';
import '../utils/formatters.dart';

class RunHistoryScreen extends StatefulWidget {
  const RunHistoryScreen({super.key});

  @override
  State<RunHistoryScreen> createState() => _RunHistoryScreenState();
}

class _RunHistoryScreenState extends State<RunHistoryScreen> {
  late Future<List<Run>> _runsFuture;
  final RunService _runService = RunService();

  @override
  void initState() {
    super.initState();
    _runsFuture = _runService.getRuns();
  }

  // Helper function to format time (e.g., 75 minutes -> 1h 15m)
  String _formatTime(int minutes) => formatTime(minutes);

  // Helper function to format pace (e.g., 5.3 -> 5:18 min/km or min/mile)
  String _formatPace(double pace) => formatPace(pace);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Run History')),
      body: FutureBuilder<List<Run>>(
        future: _runsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No runs logged yet.'));
          }

          final runs = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(8.0),
            itemCount: runs.length,
            itemBuilder: (context, index) {
              final run = runs[index];
              return Card(
                elevation: 4,
                margin: const EdgeInsets.symmetric(vertical: 8.0),
                child: ListTile(
                  leading: const Icon(Icons.directions_run, color: Colors.blueAccent),
                  title: Text(
                    'Run on ${run.startTime.month}/${run.startTime.day}/${run.startTime.year}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Distance: ${run.distance.toStringAsFixed(2)} miles'),
                      Text('Duration: ${_formatTime(run.time)}'),
                      Text('Pace: ${_formatPace(run.averagePace)} /mile'),
                      Text('Calories: ${run.caloriesBurned.round()}'),
                    ],
                  ),
                  /* trailing: Text(
                    '${run.steps} Steps',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                  ), */
                  onTap: () {
                    // TODO: Implement a detail view for the run
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Tapped on run ${run.id}')),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}