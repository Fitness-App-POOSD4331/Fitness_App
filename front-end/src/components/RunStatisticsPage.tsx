import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Activity, MapPin, Clock, Flame, Zap, TrendingUp, Trophy, Target, ArrowLeft } from 'lucide-react';

interface RunStats {
  totalRuns: number;
  totalDistance: number;
  totalTime: number;
  totalCalories: number;
  averagePace: number;
  averageDistance: number;
}

function buildPath(route: string): string {
  const isProduction = window.location.hostname !== 'localhost';
  if (isProduction) {
    return 'http://smallproject.shop:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

function RunStatisticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RunStats>({
    totalRuns: 0,
    totalDistance: 0,
    totalTime: 0,
    totalCalories: 0,
    averagePace: 0,
    averageDistance: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildPath('api/runs/stats/summary'), {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const res = await response.json();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
    setLoading(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading statistics...</div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold">Run Statistics</h1>
                <p className="text-blue-100 mt-1">Your complete running overview</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {stats.totalRuns === 0 ? (
              <div className="text-center py-16">
                <Activity className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-700 mb-3">No Statistics Yet</h2>
                <p className="text-gray-500 mb-6">Start recording runs to see your statistics!</p>
                <button
                  onClick={() => navigate('/runs/new')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold text-lg"
                >
                  Record Your First Run
                </button>
              </div>
            ) : (
              <>
                {/* Total Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="w-10 h-10 opacity-80" />
                      <Trophy className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-4xl font-bold mb-1">{stats.totalRuns}</div>
                    <div className="text-blue-100 font-medium">Total Runs</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <MapPin className="w-10 h-10 opacity-80" />
                      <TrendingUp className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-4xl font-bold mb-1">{stats.totalDistance.toFixed(1)}</div>
                    <div className="text-green-100 font-medium">Miles</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-10 h-10 opacity-80" />
                      <Target className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-4xl font-bold mb-1">{formatTime(stats.totalTime)}</div>
                    <div className="text-purple-100 font-medium">Total Time</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Flame className="w-10 h-10 opacity-80" />
                      <TrendingUp className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-4xl font-bold mb-1">{stats.totalCalories.toFixed(0)}</div>
                    <div className="text-orange-100 font-medium">Calories Burned</div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Zap className="w-10 h-10 opacity-80" />
                      <Activity className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-4xl font-bold mb-1">{stats.averagePace.toFixed(2)}</div>
                    <div className="text-pink-100 font-medium">Avg Pace (min/mile)</div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <MapPin className="w-10 h-10 opacity-80" />
                      <BarChart3 className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-4xl font-bold mb-1">{stats.averageDistance.toFixed(2)}</div>
                    <div className="text-teal-100 font-medium">Avg Distance (miles)</div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Breakdown</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Time Statistics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Total Time:</span>
                          <span className="text-purple-700 font-bold">{formatTime(stats.totalTime)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Avg Time/Run:</span>
                          <span className="text-purple-700 font-bold">{formatTime(Math.floor(stats.totalTime / stats.totalRuns))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Distance Statistics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Total Distance:</span>
                          <span className="text-green-700 font-bold">{stats.totalDistance.toFixed(2)} mi</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Avg Distance:</span>
                          <span className="text-green-700 font-bold">{stats.averageDistance.toFixed(2)} mi</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-600" />
                        Calorie Statistics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Total Burned:</span>
                          <span className="text-orange-700 font-bold">{stats.totalCalories.toFixed(0)} cal</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Avg/Run:</span>
                          <span className="text-orange-700 font-bold">{Math.round(stats.totalCalories / stats.totalRuns)} cal</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-pink-600" />
                        Pace Statistics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Avg Pace:</span>
                          <span className="text-pink-700 font-bold">{stats.averagePace.toFixed(2)} min/mi</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Avg Speed:</span>
                          <span className="text-pink-700 font-bold">{(60 / stats.averagePace).toFixed(2)} mph</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Insights */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-4">Quick Insights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-3xl font-bold mb-1">
                        {(stats.totalCalories / stats.totalDistance).toFixed(0)}
                      </div>
                      <div className="text-sm text-blue-100">Calories per Mile</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-3xl font-bold mb-1">
                        {((stats.totalDistance / (stats.totalTime / 3600))).toFixed(2)}
                      </div>
                      <div className="text-sm text-blue-100">Average Speed (mph)</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-3xl font-bold mb-1">
                        {Math.round((stats.totalTime / 60) / stats.totalRuns)}
                      </div>
                      <div className="text-sm text-blue-100">Avg Minutes per Run</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RunStatisticsPage;