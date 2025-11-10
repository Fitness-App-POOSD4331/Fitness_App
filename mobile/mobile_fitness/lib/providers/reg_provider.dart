// lib/providers/reg_provider.dart
import 'package:flutter/material.dart';
import '../services/reg_service.dart';
import 'package:http/http.dart' as http;

class RegProvider extends ChangeNotifier {
  final RegService _regService = RegService();
  bool _isRegistered = false;

  bool get isRegistered => _isRegistered;

  RegProvider();

  // Handles the register API call and token storage
  Future<http.Response> register(
    String displayName,
    String email,
    String password,
    String userName,
    int weight,
    int height,
    int age,
    String sex,
  ) async {
    final response = await _regService.register(
      displayName: displayName,
      email: email,
      password: password,
      userName: userName,
      weight: weight,
      height: height,
      age: age,
      sex: sex,
    );

    // Consider the registration successful if statusCode is 200 or 201
    if (response.statusCode == 200 || response.statusCode == 201) {
      _isRegistered = true;
    } else {
      _isRegistered = false;
    }

    notifyListeners();
    return response;
  }

  // Optional: check for existing token
  Future<void> checkLoginStatus() async {
    final token = await _regService.getToken();
    _isRegistered = token != null;
    notifyListeners();
  }
}

