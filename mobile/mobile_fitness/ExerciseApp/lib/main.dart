// lib/main.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/run_tracker_screen.dart'; // You can change this to a Home Screen later

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => AuthProvider(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Exercise App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      // Use Consumer to react to the isLoggedIn state
      home: Consumer<AuthProvider>(
        builder: (context, auth, child) {
          // If logged in, show the Run Tracker (or Home Screen)
          if (auth.isLoggedIn) {
            return const RunTrackerScreen();
          }
          // If not logged in, show the Login Screen
          return const LoginScreen();
        },
      ),
    );
  }
}