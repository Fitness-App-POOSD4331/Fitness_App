// lib/services/run_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/run_model.dart';
import 'auth_service.dart';

class RunService {
  static const String _baseUrl = 'http://129.212.182.110:5000/api/runs';
  final AuthService _authService = AuthService();

  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Authentication required');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token', // JWT is added here
    };
  }

  // 1. POST: Add a Run (includes steps)
  Future<Run> createRun(Run run) async {
    final headers = await _getAuthHeaders();

    final response = await http.post(
      Uri.parse(_baseUrl),
      headers: headers,
      body: jsonEncode(run.toJson()), // Run model has the steps data
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body)['data'];
      return Run.fromJson(data);
    } else {
      final errorBody = jsonDecode(response.body);
      throw Exception(errorBody['message'] ?? 'Failed to create run');
    }
  }

  // 2. GET: Search/Get Runs
  Future<List<Run>> getRuns({String? searchKeyword}) async {
    final headers = await _getAuthHeaders();

    Uri uri = Uri.parse(_baseUrl);
    if (searchKeyword != null && searchKeyword.isNotEmpty) {
      // Implements the search query parameter we discussed
      uri = uri.replace(queryParameters: {'search': searchKeyword});
    }

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final runsJson = data['data'] as List;
      return runsJson.map((json) => Run.fromJson(json)).toList();
    } else {
      throw Exception('Failed to fetch runs.');
    }
  }

  // 3. DELETE: Delete a Run (safe deletion implemented in backend)
  Future<void> deleteRun(String runId) async {
    final headers = await _getAuthHeaders();

    final response = await http.delete(
      Uri.parse('$_baseUrl/$runId'),
      headers: headers,
    );

    if (response.statusCode != 200) {
      final errorBody = jsonDecode(response.body);
      throw Exception(errorBody['message'] ?? 'Failed to delete run');
    }
  }
}