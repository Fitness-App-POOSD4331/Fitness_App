// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'run_screen.dart'; // The pedometer screen
import 'run_history_screen.dart'; // The new history screen
import 'profile_screen.dart';     // The new profile screen

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0; // Default to the Run Tracker tab

  // List of screens to be displayed in the body
  static const List<Widget> _widgetOptions = <Widget>[
    RunTrackingScreen(),
    RunHistoryScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // The body changes based on the selected index
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      // The bottom navigation bar
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.directions_run),
            label: 'Tracker',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blueAccent,
        onTap: _onItemTapped,
      ),
    );
  }
}