// lib/providers/auth_provider.dart

import 'package:flutter/material.dart';
import '../services/auth_service.dart';

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
    try {
      await _authService.login(email, password);
      _isLoggedIn = true;
      notifyListeners();
    } catch (e) {
      // ⭐ ADDED ERROR HANDLING ⭐
      // Re-throw the exception to be caught by the UI
      throw Exception('Login failed: ${e.toString()}');
    }
  }

  // Handles logout and token deletion
  Future<void> logout() async {
    await _authService.logout();
    _isLoggedIn = false;
    notifyListeners();
  }
}