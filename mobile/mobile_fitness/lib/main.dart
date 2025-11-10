// lib/main.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/reg_provider.dart';
import 'providers/run_provider.dart';
import 'screens/login_screen.dart';
//import 'screens/run_screen.dart'; // You can change this to a Home Screen later
import 'screens/profile_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
	// Manages authentication state (login/logout/token check)
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        // Manages registration form data and logic
        ChangeNotifierProvider(create: (_) => RegProvider()),
        ChangeNotifierProvider(create: (_) => RunProvider()),
      ],
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
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
	  //Set color and theme data for the entire app
          colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF66CCFF),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.grey[100],
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF66CCFF), width: 2),
          ),
        ),
	//Define consistent style for all buttons
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            elevation: 0,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
      
      // Use Consumer to react to the isLoggedIn state
      home: Consumer<AuthProvider>(
        builder: (context, auth, child) {
          // If logged in, show the Run Tracker (or Home Screen)
          if (auth.isLoggedIn) {
            return const ProfileScreen();
          } else {
            // If not logged in, show the Login Screen
            return const LoginScreen();
          }
          
        },
      ),
    );
  }
}
