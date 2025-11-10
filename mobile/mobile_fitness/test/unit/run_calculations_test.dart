import 'package:flutter_test/flutter_test.dart';
import 'package:exerciseapp/utils/fitness_utils.dart';

void main() {
  test('steps -> feet -> miles conversion', () {
    final feet = stepsToFeet(10, 2.0);
    expect(feet, 20);

    final miles = feetToMiles(feet);
    expect(miles, closeTo(20 / 5280.0, 1e-12));
  });

  test('pace minutes per mile', () {
    // 30 minutes over 5 miles -> 6.0 min/mile
    final pace = paceMinutesPerMile(1800, 5.0);
    expect(pace, closeTo(6.0, 1e-12));
  });

  test('select MET by pace thresholds', () {
    expect(selectMet(13.0), 8.3);
    expect(selectMet(11.0), 9.8);
    expect(selectMet(9.0), 11.0);
    expect(selectMet(7.5), 11.8);
  });

  test('caloriesFromMet matches formula', () {
    final met = 9.8;
    final weightKg = 70.0;
    final seconds = 1800; // 30 minutes

    final calories = caloriesFromMet(met, weightKg, seconds);
    final expected = met * 3.5 * weightKg / 200 * (seconds / 60.0);
    expect(calories, closeTo(expected, 1e-12));
  });

  test('zero steps and zero distance handling', () {
    expect(stepsToFeet(0, 2.0), 0);
    expect(feetToMiles(0), 0);
    // pace should be infinity when miles == 0
    expect(paceMinutesPerMile(100, 0), double.infinity);
  });

  test('calories with zero weight or zero time returns zero', () {
    final met = 8.3;
    expect(caloriesFromMet(met, 0.0, 1800), 0.0);
    expect(caloriesFromMet(met, 70.0, 0), 0.0);
  });

  test('selectMet on exact threshold values', () {
    expect(selectMet(12.0), 8.3);
    expect(selectMet(10.0), 9.8);
    expect(selectMet(8.5), 11.0);
  });

  test('large values do not produce NaN', () {
    final feet = stepsToFeet(1000000000, 3.0);
    final miles = feetToMiles(feet);
    expect(miles.isFinite, true);

    final pace = paceMinutesPerMile(1000000000, miles == 0 ? 1 : miles);
    expect(pace.isFinite || pace == double.infinity, true);
  });
}
