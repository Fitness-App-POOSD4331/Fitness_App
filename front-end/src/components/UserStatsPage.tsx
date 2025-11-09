import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Weight, Activity, TrendingUp, Flame, MapPin, Trophy, BarChart3, ArrowLeft } from 'lucide-react';

function buildPath(route: string): string {
  return 'http://localhost:5001/' + route;
}

function UserStatsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDistance: 0,
    caloriesBurned: 0,
    totalRuns: 0,
    weight: 0,
    height: 0,
    bmi: 0,
    runs: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Get user info
    const userResponse = await fetch(buildPath('api/users/profile'), {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const userData = await userResponse.json();
    
    // Get run stats
    const statsResponse = await fetch(buildPath('api/runs/stats/summary'), {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const statsData = await statsResponse.json();

    if (userData.success && statsData.success) {
      setStats({
        totalDistance: statsData.data.totalDistance,
        caloriesBurned: statsData.data.totalCalories,
        totalRuns: statsData.data.totalRuns,
        weight: userData.data.weight || 0,
        height: userData.data.height || 0,
        bmi: userData.data.bmi || 0,
        runs: []
      });
    }
  } catch (e) {
    console.error('Error loading stats:', e);
  }
  setLoading(false);
};

  const getBMICategory = () => {
    const bmi = stats.bmi;
    if (bmi < 18.5) return { text: 'Underweight', color: 'bg-blue-500' };
    if (bmi < 25) return { text: 'Normal weight', color: 'bg-green-500' };
    if (bmi < 30) return { text: 'Overweight', color: 'bg-yellow-500' };
    return { text: 'Obese', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading stats...</div>
      </div>
    );
  }

  const bmiCategory = getBMICategory();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-white hover:text-blue-100 mb-6 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 p-8">
            <div className="flex items-center text-white">
              <BarChart3 className="w-10 h-10 mr-4" />
              <div>
                <h1 className="text-3xl font-bold">Your Fitness Stats</h1>
                <p className="text-blue-100 mt-1">Track your overall progress</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <MapPin className="w-8 h-8 opacity-80" />
                  <Trophy className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.totalDistance.toFixed(1)} km</div>
                <div className="text-blue-100 text-sm font-medium">Total Distance</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Flame className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.caloriesBurned.toLocaleString()}</div>
                <div className="text-orange-100 text-sm font-medium">Calories Burned</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 opacity-80" />
                  <BarChart3 className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.totalRuns}</div>
                <div className="text-green-100 text-sm font-medium">Total Runs</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Weight className="w-8 h-8 opacity-80" />
                  <User className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.weight} kg</div>
                <div className="text-purple-100 text-sm font-medium">Current Weight</div>
              </div>
            </div>

            {/* BMI Section */}
            {stats.bmi > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Body Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.height} cm</div>
                    <div className="text-sm text-gray-600">Height</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.weight} kg</div>
                    <div className="text-sm text-gray-600">Weight</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className={`${bmiCategory.color} text-white px-4 py-2 rounded-lg font-semibold`}>
                        BMI: {stats.bmi.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{bmiCategory.text}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Average Stats */}
            {stats.totalRuns > 0 && (
              <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Averages Per Run</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {(stats.totalDistance / stats.totalRuns).toFixed(2)} km
                    </div>
                    <div className="text-xs text-gray-600">Avg Distance</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {Math.round(stats.caloriesBurned / stats.totalRuns)}
                    </div>
                    <div className="text-xs text-gray-600">Avg Calories</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg col-span-2 md:col-span-1">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {stats.totalRuns}
                    </div>
                    <div className="text-xs text-gray-600">Total Sessions</div>
                  </div>
                </div>
              </div>
            )}

            {stats.totalRuns === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No runs recorded yet!</p>
                <p className="text-sm mt-2">Start your fitness journey by recording your first run.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatsPage;