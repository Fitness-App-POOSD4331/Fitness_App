import 'package:flutter_test/flutter_test.dart';
import 'package:exerciseapp/models/run_model.dart';
import 'package:exerciseapp/models/user_model.dart';
import 'package:exerciseapp/utils/formatters.dart';

void main() {
  group('Run model serialization', () {
    test('toJson and fromJson round-trip', () {
      final start = DateTime.utc(2023, 3, 1, 12, 0, 0);
      final finish = start.add(Duration(minutes: 30));

      final run = Run(
        id: 'abc123',
        distance: 5.2,
        time: 30,
        averagePace: 6.73,
        caloriesBurned: 420.0,
        startTime: start,
        finishTime: finish,
      );

      final json = run.toJson();
      // toJson does not include id; simulate server response when reading
      final serverMap = Map<String, dynamic>.from(json);
      serverMap['_id'] = 'abc123';
      serverMap['startTime'] = start.toIso8601String();
      serverMap['finishTime'] = finish.toIso8601String();

      final parsed = Run.fromJson(serverMap);
      expect(parsed.id, 'abc123');
      expect(parsed.distance, run.distance);
      expect(parsed.time, run.time);
      expect(parsed.averagePace, run.averagePace);
      expect(parsed.caloriesBurned, run.caloriesBurned);
      expect(parsed.startTime.toUtc(), start);
      expect(parsed.finishTime.toUtc(), finish);
    });
  });

  group('UserProfile.fromJson', () {
    test('parses numeric fields and applies defaults', () {
      final map = {
        '_id': 'u1',
        'displayName': 'Test User',
        'userName': 'tester',
        'email': 'a@b.com',
        // weight omitted -> default 0.0
        'height': 170,
        'age': 28,
        'sex': 'M',
        // bmi omitted
        // totalDistance omitted
        // caloriesBurned omitted
        'isEmailVerified': true,
      };

      final profile = UserProfile.fromJson(map);
      expect(profile.id, 'u1');
      expect(profile.displayName, 'Test User');
      expect(profile.weight, 0.0);
      expect(profile.height, 170.0);
      expect(profile.age, 28);
      expect(profile.isEmailVerified, true);
    });
  });

  test('formatters produce expected strings', () {
    expect(formatTime(45), '45m');
    expect(formatTime(75), '1h 15m');

    expect(formatPace(5.3), '5:18');
    expect(formatPace(6.0), '6:00');
  });
}
