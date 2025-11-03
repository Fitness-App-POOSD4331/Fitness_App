// lib/services/auth_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String _baseUrl = 'http://129.212.182.110:5000/api/auth';
  static const String _tokenKey = 'jwt_token';

  // 1. Store Token
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    // LOGGING ADDED: Confirmation of storage
    print('I/flutter: [AuthService] Token SAVED to storage.');
  }

  // 2. Retrieve Token (used by all other protected services)
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    // LOGGING ADDED: Check if token is retrieved successfully
    print('I/flutter: [AuthService] Retrieved Token: ${token != null ? "Token Found (Length: ${token.length})" : "Token is NULL"}');
    return token;
  }

  // 3. Login Implementation
  Future<void> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    // ⭐ ADDED MORE DETAILED LOGGING ⭐
    print('I/flutter: [AuthService] Login Response Status Code: ${response.statusCode}');
    print('I/flutter: [AuthService] Login Response Body: ${response.body}');

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      
      // ⭐ CORRECTED TOKEN PARSING ⭐
      final token = responseData['data']?['token'];

      if (token != null) {
        await _saveToken(token); // Save the token from your Node.js response
      } else {
        throw Exception('Token is null in the response data');
      }
    } else {
      // Use the error message from your Node.js controller
      final errorBody = jsonDecode(response.body);
      throw Exception(errorBody['message'] ?? 'Login failed with status ${response.statusCode}');
    }
  }

  // 4. Logout Implementation
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    print('I/flutter: [AuthService] Token REMOVED from storage.');
  }
}
