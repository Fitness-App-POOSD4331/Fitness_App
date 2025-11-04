// lib/providers/reg_provider.dart

import 'package:flutter/material.dart';
import '../services/reg_service.dart';

class RegProvider extends ChangeNotifier {
  final RegService _regService = RegService();
  bool _isRegistered = false;

  bool get isRegistered => _isRegistered;

  // Constructor: Empty for now
  RegProvider();

  // Check if a token exists in local storage
  Future<void> checkLoginStatus() async {
    final token = await _regService.getToken();
    _isRegistered = token != null;
    notifyListeners();
  }

  // Handles the register API call and token storage
  Future<void> register(String displayName, String email, String password, String userName, int weight, int height, int age, String sex) async {
    await _regService.register( displayName: displayName, email: email, password: password, userName: userName, weight: weight, height: height, age: age, sex: sex);
    _isRegistered = true;
    notifyListeners();
  }

  // Handles logout and token deletion
  Future<void> logout() async {
    //await _authService.logout();
    //_isLoggedIn = false;
    //notifyListeners();
  }
}