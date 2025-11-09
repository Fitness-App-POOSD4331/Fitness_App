// lib/models/user_model.dart
class UserProfile {
  final String id;
  final String displayName;
  final String userName;
  final String email;
  final double weight;
  final double height;
  final int age;
  final String sex;
  final double bmi;
  final double totalDistance;
  final double caloriesBurned;
  final bool isEmailVerified;
  // Note: We exclude sensitive fields like 'password' and tokens.

  UserProfile({
    required this.id,
    required this.displayName,
    required this.userName,
    required this.email,
    required this.weight,
    required this.height,
    required this.age,
    required this.sex,
    required this.bmi,
    required this.totalDistance,
    required this.caloriesBurned,
    required this.isEmailVerified,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['_id'] as String,
      displayName: json['displayName'] as String,
      userName: json['userName'] as String,
      email: json['email'] as String,
      // Dart's 'num' handles both int/double from JSON, then we force to Double
      weight: (json['weight'] as num?)?.toDouble() ?? 0.0,
      height: (json['height'] as num?)?.toDouble() ?? 0.0,
      age: json['age'] as int? ?? 0,
      sex: json['sex'] as String,
      bmi: (json['bmi'] as num?)?.toDouble() ?? 0.0,
      totalDistance: (json['totalDistance'] as num?)?.toDouble() ?? 0.0,
      caloriesBurned: (json['caloriesBurned'] as num?)?.toDouble() ?? 0.0,
      isEmailVerified: json['isEmailVerified'] as bool? ?? false,
    );
  }
}

