// lib/screens/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../models/user_model.dart';
import '../services/user_service.dart';
import '../providers/auth_provider.dart';
import '../providers/run_provider.dart';
import 'run_screen.dart';
import '../screens/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<UserProfile> _profileFuture;
  late Future<Map<String, dynamic>> _statsFuture;
  final UserService _userService = UserService();

  @override
  void initState() {
    super.initState();
    _profileFuture = _userService.getProfile();
    _statsFuture = _userService.getRunSummaryStats();
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<RunProvider>(context, listen: false).fetchRuns();
    });
  }

  String _formatTime(int minutes) {
    if (minutes < 60) {
      return '${minutes}m';
    }
    final hours = (minutes / 60).floor();
    final remainingMinutes = minutes % 60;
    return '${hours}h ${remainingMinutes}m';
  }
  
  Widget _buildStatCard(String title, dynamic value, String unit) {
    String displayValue = value is double ? value.toStringAsFixed(value > 100 ? 0 : 2) : value.toString();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            Text(
              displayValue,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF4A90E2)),
            ),
            const SizedBox(height: 4),
            Text(unit, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileRow(IconData icon, String label, String value, {bool verified = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF4A90E2)),
          const SizedBox(width: 10),
          Expanded(
            child: Text('$label:', style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
          Text(value, style: const TextStyle(fontWeight: FontWeight.normal)),
          if (verified) ...[
            const SizedBox(width: 8),
            const Icon(Icons.verified, size: 16, color: Colors.green),
          ]
        ],
      ),
    );
  }

  void _showEditDescriptionDialog(BuildContext context, String runId, String currentDescription) {
    final TextEditingController controller = TextEditingController(text: currentDescription);
    
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Edit Description'),
          content: TextField(
            controller: controller,
            decoration: InputDecoration(
              hintText: 'Enter run description',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFF4A90E2), width: 2),
              ),
            ),
            maxLines: 3,
            maxLength: 200,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4A90E2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () async {
                final newDescription = controller.text.trim();
                Navigator.of(dialogContext).pop();
                
                if (newDescription.isNotEmpty) {
                  try {
                    await Provider.of<RunProvider>(context, listen: false)
                        .updateRunDescription(runId, newDescription);
                    
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Description updated successfully')),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Failed to update: ${e.toString()}')),
                      );
                    }
                  }
                }
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  void _showDeleteConfirmDialog(BuildContext context, String runId, String runDetails) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Delete Run'),
          content: Text('Are you sure you want to delete this run?\n\n$runDetails'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () async {
                Navigator.of(dialogContext).pop();
                
                try {
                  await Provider.of<RunProvider>(context, listen: false).deleteRun(runId);
                  
                  if (mounted) {
                    setState(() {
                      _statsFuture = _userService.getRunSummaryStats();
                    });
                    
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Run deleted successfully')),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to delete: ${e.toString()}')),
                    );
                  }
                }
              },
              child: const Text('Delete'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final runProvider = Provider.of<RunProvider>(context);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF4A90E2),
              Color(0xFF7AB8F5),
              Color(0xFFA8D5FF),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Custom AppBar
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    const Icon(Icons.cloud, color: Colors.white, size: 32),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Sky Run Profile',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.logout, color: Colors.white),
                      onPressed: () async {
                        try {
                          await Provider.of<AuthProvider>(context, listen: false).logout();
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Logged out')),
                            );
                            Navigator.of(context).pushAndRemoveUntil(
                                MaterialPageRoute(builder: (_) => const LoginScreen()),
                                (route) => false,
                            );
                          }
                        } catch (e) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Logout failed: ${e.toString()}')),
                            );
                          }
                        }
                      },
                      tooltip: 'Logout',
                    ),
                  ],
                ),
              ),

              // Scrollable Content
              Expanded(
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildProfileInfo(context),
                        const SizedBox(height: 24),
                        const Text(
                          'Lifetime Run Statistics',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildStatsGrid(),
                        const SizedBox(height: 24),
                        _buildTrackerButton(context),
                        const SizedBox(height: 24),
                        const Text(
                          'Run History',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildRunList(runProvider),
                        const SizedBox(height: 50),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildProfileInfo(BuildContext context) {
    return FutureBuilder<UserProfile>(
      future: _profileFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Colors.white));
        } else if (snapshot.hasError) {
          return Center(child: Text('Profile Error: ${snapshot.error}', style: const TextStyle(color: Colors.white)));
        } else if (!snapshot.hasData) {
          return const Center(child: Text('Profile data not found.', style: TextStyle(color: Colors.white)));
        }

        final user = snapshot.data!;
        return Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.95),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                spreadRadius: 3,
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4A90E2).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.person, size: 32, color: Color(0xFF4A90E2)),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        user.displayName,
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 30),
                _buildProfileRow(Icons.account_circle, 'Username', user.userName),
                _buildProfileRow(Icons.email, 'Email', user.email, verified: user.isEmailVerified),
                _buildProfileRow(Icons.accessibility_new, 'BMI', user.bmi.toStringAsFixed(1)),
                _buildProfileRow(Icons.monitor_weight, 'Weight', '${user.weight.toStringAsFixed(1)} kg'),
                _buildProfileRow(Icons.height, 'Height', '${user.height.toStringAsFixed(0)} cm'),
              ],
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildStatsGrid() {
    return FutureBuilder<Map<String, dynamic>>(
      future: _statsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: Padding(
            padding: EdgeInsets.all(16.0),
            child: CircularProgressIndicator(color: Colors.white),
          ));
        } else if (snapshot.hasError) {
          return Center(child: Text('Stats Error: ${snapshot.error}', style: const TextStyle(color: Colors.white)));
        } else if (!snapshot.hasData) {
          return const Center(child: Text('Stats data not available.', style: TextStyle(color: Colors.white)));
        }

        final stats = snapshot.data!;
        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.1,
          children: [
            _buildStatCard('Total Distance', stats['totalDistance'] ?? 0.0, 'miles'),
            _buildStatCard('Total Calories', stats['totalCalories'] ?? 0.0, 'calories'),
            _buildStatCard('Total Runs', stats['totalRuns'] ?? 0, 'runs'),
            _buildStatCard('Total Time', (stats['totalTime'] ?? 0) / 60, 'minutes'),
            _buildStatCard('Avg. Pace', stats['averagePace'] ?? 0, 'min/mile'),
            _buildStatCard('Avg. Distance', stats['averageDistance'] ?? 0.0, 'miles'),
          ],
        );
      },
    );
  }
  
  Widget _buildTrackerButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () {
          Navigator.of(context).push(MaterialPageRoute(
            builder: (context) => const RunTrackingScreen(),
          ));
        },
        icon: const Icon(Icons.directions_run, size: 28),
        label: const Text('Start New Run', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF4A90E2),
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 5,
        ),
      ),
    );
  }

  Widget _buildRunList(RunProvider runProvider) {
    if (runProvider.isLoading) {
      return const Center(child: CircularProgressIndicator(color: Colors.white));
    }

    if (runProvider.errorMessage != null) {
      return Center(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.red.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            'Error loading history: ${runProvider.errorMessage}',
            style: const TextStyle(color: Colors.white),
          ),
        ),
      );
    }

    if (runProvider.runs.isEmpty) {
      return Center(
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.9),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Text(
            'No run history yet! Log your first run above.',
            style: TextStyle(fontSize: 16, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: runProvider.runs.length,
      itemBuilder: (context, index) {
        final run = runProvider.runs[index];
        final dateStr = DateFormat('EEEE, MMM d').format(run.startTime);
        final runDetails = '$dateStr - ${run.distance.toStringAsFixed(2)} mi';
        
        if (run.id == null) {
          return const SizedBox.shrink();
        }
        
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.95),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 6,
                spreadRadius: 1,
              ),
            ],
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF4A90E2).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.directions_run, color: Color(0xFF4A90E2), size: 24),
            ),
            title: Text(
              runDetails,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 6),
                Text(
                  'Duration: ${_formatTime(run.time)} | Pace: ${run.averagePace.toStringAsFixed(2)} min/mile',
                  style: const TextStyle(fontSize: 13),
                ),
                if (run.description != null && run.description!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    run.description!,
                    style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.grey, fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
            trailing: PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, color: Color(0xFF4A90E2)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onSelected: (value) {
                if (value == 'edit') {
                  _showEditDescriptionDialog(context, run.id!, run.description ?? '');
                } else if (value == 'delete') {
                  _showDeleteConfirmDialog(context, run.id!, runDetails);
                }
              },
              itemBuilder: (BuildContext context) => [
                const PopupMenuItem<String>(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit, size: 20, color: Color(0xFF4A90E2)),
                      SizedBox(width: 8),
                      Text('Edit Description'),
                    ],
                  ),
                ),
                const PopupMenuItem<String>(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, size: 20, color: Colors.red),
                      SizedBox(width: 8),
                      Text('Delete Run'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}