import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class RegService {
  final String _baseUrl = 'http://129.212.182.110:5000/api/auth'; // change for production
  static const String _tokenKey = 'jwt_token';

  // 1. Store Token
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // 2. Retrieve Token (used by all other protected services)
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }


  Future<void> register({
    required String displayName,
    required String email,
    required String password,
    required String userName,
    required int weight,
    required int height,
    required int age,
    required String sex
    
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
        "weight" : weight,
        "height": height,
        "age": age,
        "sex": sex
      }),
    );

    final json = jsonDecode(response.body);

    if (response.statusCode != 200 || json['success'] != true) {
      throw Exception(json['message'] ?? 'Registration failed');
    }

    final token = json['data']['token'];
    await _saveToken(token);
  }
}