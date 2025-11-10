// Helper functions for fitness calculations (pure functions, easy to test)
double stepsToFeet(int steps, double stepLengthFeet) => steps * stepLengthFeet;

double feetToMiles(double feet) => feet / 5280.0;

double secondsToMinutes(int seconds) => seconds / 60.0;

/// Returns pace in minutes per mile. If miles <= 0 returns double.infinity.
double paceMinutesPerMile(int seconds, double miles) {
  if (miles <= 0) return double.infinity;
  return (seconds / 60.0) / miles;
}

/// Select MET value based on pace (minutes per mile).
double selectMet(double paceMinPerMile) {
  if (paceMinPerMile >= 12) return 8.3;
  if (paceMinPerMile >= 10) return 9.8;
  if (paceMinPerMile >= 8.5) return 11.0;
  return 11.8;
}

/// Calculates calories burned from MET, weight (kg), and duration in seconds.
double caloriesFromMet(double met, double weightKg, int seconds) {
  return met * 3.5 * weightKg / 200 * (seconds / 60.0);
}
