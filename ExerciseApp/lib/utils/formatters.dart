// Pure formatting helpers used by UI screens. Kept small and testable.
String formatTime(int minutes) {
  if (minutes < 60) return '${minutes}m';
  final hours = minutes ~/ 60;
  final remainingMinutes = minutes % 60;
  return '${hours}h ${remainingMinutes}m';
}

String formatPace(double pace) {
  final minutes = pace.floor();
  final seconds = ((pace - minutes) * 60).round();
  return '${minutes.toString().padLeft(1, '0')}:${seconds.toString().padLeft(2, '0')}';
}
