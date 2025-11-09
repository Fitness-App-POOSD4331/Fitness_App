// lib/providers/run_provider.dart
import 'package:flutter/material.dart';
import '../models/run_model.dart';
import '../services/run_service.dart';

class RunProvider extends ChangeNotifier {
  final RunService _runService = RunService();
  List<Run> _runs = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Run> get runs => _runs;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetches the list of runs for the authenticated user
  Future<void> fetchRuns() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _runs = await _runService.getRuns();
      // Sort runs by startTime descending (most recent first)
      _runs.sort((a, b) => b.startTime.compareTo(a.startTime));
    } catch (e) {
      _errorMessage = 'Failed to fetch runs: ${e.toString()}';
      print('RunProvider Error: $_errorMessage');
      _runs = []; // Clear old data on error
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Logs the run in the database
  Future<void> logRun(Run newRun) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      newRun = await _runService.createRun(newRun);
      
    } catch (e) {
      _errorMessage = 'Failed to log run: ${e.toString()}';
      print('RunProvider Error: $_errorMessage');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateRunDescription(String runId, String newDescription) async {
    try {
      final updatedRun = await _runService.updateRunDescription(runId, newDescription);
      final index = _runs.indexWhere((run) => run.id == runId);
      if (index != -1) {
        _runs[index] = updatedRun;
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'Failed to update run: $e';
      notifyListeners();
    }
  }

  Future<void> deleteRun(String runId) async {
    try {
      await _runService.deleteRun(runId);
      _runs.removeWhere((run) => run.id == runId);
      notifyListeners();
   } catch (e) {
      _errorMessage = 'Failed to delete run: $e';
      notifyListeners();
   }
  }

}

