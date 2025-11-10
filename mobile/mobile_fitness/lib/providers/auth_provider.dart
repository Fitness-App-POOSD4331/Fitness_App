// lib/providers/auth_provider.dart

import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
//import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  bool _isLoggedIn = false;

  bool get isLoggedIn => _isLoggedIn;

  // Constructor: Check initial login status when the app starts
  AuthProvider() {
    checkLoginStatus();
  }

  // Check if a token exists in local storage
  Future<void> checkLoginStatus() async {
    final token = await _authService.getToken();
    _isLoggedIn = token != null;
    notifyListeners();
  }

  // Handles the login API call and token storage
  Future<void> login(String email, String password) async {
    await _authService.login(email, password);
    _isLoggedIn = true;
    notifyListeners();
  }

  // Handles logout and token deletion
  Future<void> logout() async {
    await _authService.logout();
    _isLoggedIn = false;
    notifyListeners();
  }

  Future<void> sendPasswordResetEmail(String email) async {
    final url = Uri.parse('http://smallproject.shop:5001/api/auth/forgot-password');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({"email": email}),
    );

    if (response.statusCode != 200) {
      final json = jsonDecode(response.body);
      throw Exception(json['message'] ?? 'Failed to send reset email');
    }
  }


}