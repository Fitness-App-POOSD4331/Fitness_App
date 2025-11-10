// lib/services/user_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import 'auth_service.dart';

class UserService {
  // Base URL for API - using the fixed IP address
  static const String _baseUrl = 'http://smallproject.shop:5001/api';
  final AuthService _authService = AuthService();

  // Helper to get headers with JWT token
  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('Authentication required');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // 1. GET: Fetch the current user's profile data
  Future<UserProfile> getProfile() async {
    final headers = await _getAuthHeaders();
    final response = await http.get(
      // We'll use the /api/users/profile route
      Uri.parse('$_baseUrl/users/profile'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body)['data'];
      return UserProfile.fromJson(data);
    } else {
      throw Exception('Failed to fetch user profile.');
    }
  }

  // 2. GET: Fetch overall run statistics (from the run controller route)
  Future<Map<String, dynamic>> getRunSummaryStats() async {
    final headers = await _getAuthHeaders();
    final response = await http.get(
      // We'll use the /api/runs/stats/summary route
      Uri.parse('$_baseUrl/runs/stats/summary'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data']; // Returns the stats object
    } else {
      throw Exception('Failed to fetch run statistics.');
    }
  }

  // Future<void> updateProfile(...) // Placeholder for future update logic
}