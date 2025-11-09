// lib/models/run_model.dart
class Run {
  final String? id; // Mongoose _id (String in Flutter)
  final double distance;
  final int time; // In minutes
  final double averagePace;
  final double caloriesBurned;
  final DateTime startTime;
  final DateTime finishTime;
  final String? description; // Nullable
  //final int steps; // The new field

  Run({
    this.id,
    required this.distance,
    required this.time,
    required this.averagePace,
    required this.caloriesBurned,
    required this.startTime,
    required this.finishTime,
    //required this.steps,
    this.description,
  });

  // 1. ⭐ FACTORY CONSTRUCTOR (fromJson) - Used to RECEIVE data from API
  // This tells Dart how to convert a JSON Map into a Run object.
  factory Run.fromJson(Map<String, dynamic> json) {
    return Run(
      // The API sends '_id' and Mongoose fields, so map them here:
      id: json['_id'] as String?,
      distance: (json['distance'] as num).toDouble(),
      time: json['time'] as int,
      averagePace: (json['averagePace'] as num).toDouble(),
      caloriesBurned: (json['caloriesBurned'] as num).toDouble(),
      // Use DateTime.parse to convert the ISO string date from the backend
      startTime: DateTime.parse(json['startTime'] as String),
      finishTime: DateTime.parse(json['finishTime'] as String),
      //steps: json['steps'] as int,
      description: json['description'] as String?,
    );
  }

  // 2. ⭐ INSTANCE METHOD (toJson) - Used to SEND data to API
  // This tells Dart how to convert a Run object into a JSON Map.
  Map<String, dynamic> toJson() {
    return {
      // Note: We don't include 'id' here, as MongoDB generates it on the server
      'distance': distance,
      'time': time,
      'averagePace': averagePace,
      'caloriesBurned': caloriesBurned,
      // Use toIso8601String() to send the date in the format the backend expects
      'startTime': startTime.toIso8601String(),
      'finishTime': finishTime.toIso8601String(),
      //'steps': steps,
      'description': description,
    };
  }
}