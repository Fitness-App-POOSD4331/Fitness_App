import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class RegService {
  final String _baseUrl = 'http://smallproject.shop:5001/api/auth'; // change for production
  static const String _tokenKey = 'jwt_token';

  // Store Token
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // Retrieve Token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Register user
  Future<http.Response> register({
    required String displayName,
    required String email,
    required String password,
    required String userName,
    required int weight,
    required int height,
    required int age,
    required String sex,
  }) async {
    final url = Uri.parse('$_baseUrl/register');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        "displayName": displayName,
        "email": email,
        "password": password,
        "userName": userName,
        "weight": weight,
        "height": height,
        "age": age,
        "sex": sex,
      }),
    );

    final json = jsonDecode(response.body);

    // Accept 200 and 201 as success
    if ((response.statusCode != 200 && response.statusCode != 201) || json['success'] != true) {
      throw Exception(json['message'] ?? 'Registration failed');
    }

    // Save token if provided
    final token = json['data']?['token'];
    if (token != null) {
      await _saveToken(token);
    }

    return response; // Return response for the provider to check statusCode
  }
}
