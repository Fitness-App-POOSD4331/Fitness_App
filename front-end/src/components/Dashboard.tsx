import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Activity, 
  TrendingUp, 
  Flame, 
  Clock, 
  Calendar,
  Trophy,
  Plus,
  User,
  LogOut,
  ArrowRight,
  Target,
  Zap,
  Edit
} from 'lucide-react';

// Types
interface Run {
  _id: string;
  distance: number;
  time: number;
  averagePace: number;
  caloriesBurned: number;
  startTime: string;
  finishTime: string;
  createdAt: string;
}

interface RunStats {
  totalRuns: number;
  totalDistance: number;
  totalTime: number;
  totalCalories: number;
  averagePace: number;
  averageDistance: number;
}

interface UserData {
  _id: string;
  displayName: string;
  userName: string;
  email: string;
  totalDistance?: number;
  caloriesBurned?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  userName: string;
  totalDistance: number;
  caloriesBurned: number;
  isCurrentUser?: boolean;
}

// Utility function
function buildPath(route: string): string {
  const isProduction = window.location.hostname !== 'localhost';
  if (isProduction) {
    return 'http://smallproject.shop:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);
  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [myRank, setMyRank] = useState<{ rank: number; totalUsers: number; leaderboard: LeaderboardEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Load user data from localStorage
      const userData = localStorage.getItem('user_data');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }

      // Fetch recent runs
      await fetchRecentRuns(token);

      // Fetch run statistics
      await fetchRunStats(token);

      // Fetch user rank
      await fetchMyRank(token);

    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRuns = async (token: string) => {
    try {
      const response = await fetch(buildPath('api/runs'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const res = await response.json();
      if (res.success && res.data) {
        // Get last 5 runs
        setRecentRuns(res.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch recent runs:', err);
    }
  };

  const fetchRunStats = async (token: string) => {
    try {
      const response = await fetch(buildPath('api/runs/stats/summary'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const res = await response.json();
      if (res.success && res.data) {
        setRunStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch run stats:', err);
    }
  };

  const fetchMyRank = async (token: string) => {
  try {
    const response = await fetch(buildPath('api/leaderboard/myrank?type=distance&range=3'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const res = await response.json();
    console.log('myRank API response:', res); // ADD THIS FOR DEBUGGING
    
    if (res.success && res.data) {
      // Transform backend response to match Dashboard expectations
      setMyRank({
        rank: res.data.myRank || res.data.rank, // Handle both field names
        totalUsers: res.data.totalUsers,
        leaderboard: res.data.leaderboard || []
      });
    }
  } catch (err) {
    console.error('Failed to fetch rank:', err);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    navigate('/login');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full p-3 shadow-lg">
                <Cloud className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sky Run</h1>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-lg font-semibold text-gray-800">
                  {currentUser?.displayName}
                </div>
                <div className="text-sm text-gray-600">@{currentUser?.userName}</div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/runs/new')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <Plus className="w-8 h-8" />
            <span className="text-xl font-bold">Log New Run</span>
          </button>
          <button
            onClick={() => navigate('/runs')}
            className="bg-white text-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-gray-200"
          >
            <Activity className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold">View History</span>
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="bg-white text-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-gray-200"
          >
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-xl font-bold">Leaderboard</span>
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="bg-white text-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-gray-200"
          >
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-xl font-bold">My Stats</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 font-semibold">Total Runs</div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {runStats?.totalRuns || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">runs completed</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 font-semibold">Total Distance</div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {runStats?.totalDistance.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-gray-500 mt-1">miles</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 font-semibold">Calories Burned</div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {runStats?.totalCalories.toFixed(0) || '0'}
            </div>
            <div className="text-sm text-gray-500 mt-1">calories</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 font-semibold">Avg Pace</div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {runStats?.averagePace.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-gray-500 mt-1">min/mile</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Runs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Recent Runs
                </h2>
                <button
                  onClick={() => navigate('/runs')}
                  className="text-white hover:text-blue-100 transition flex items-center gap-1 text-sm"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                {recentRuns.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">No runs recorded yet</p>
                    <button
                      onClick={() => navigate('/runs/new')}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Log Your First Run
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRuns.map((run) => (
                      <div
                        key={run._id}
                        data-testid={`run-card-${run._id}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200 group"
                      >
                        <div
                          onClick={() => navigate(`/runs/${run._id}`)}
                          className="flex items-center gap-4 flex-1 cursor-pointer"
                        >
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {run.distance.toFixed(2)} miles
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(run.startTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(run.time)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-orange-500" />
                                {run.caloriesBurned} cal
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/runs/${run._id}/edit`);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                            title="Edit run"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Rank */}
          <div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  My Rank
                </h2>
              </div>
              <div className="p-6">
                {myRank ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                        #{myRank.rank}
                      </div>
                      <div className="text-gray-600 mt-2">
                        out of {myRank.totalUsers} runners
                      </div>
                    </div>
                    
                    {myRank.leaderboard && myRank.leaderboard.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-700 mb-3">
                          Nearby Competitors
                        </div>
                        {myRank.leaderboard.map((entry) => (
                          <div
                            key={entry.userId}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              entry.isCurrentUser
                                ? 'bg-blue-100 border-2 border-blue-400'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                entry.rank <= 3
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}>
                                {entry.rank}
                              </div>
                              <div>
                                <div className="font-semibold text-sm">
                                  {entry.displayName}
                                  {entry.isCurrentUser && (
                                    <span className="ml-2 text-blue-600">(You)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm font-bold text-gray-700">
                              {entry.totalDistance.toFixed(1)} mi
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => navigate('/leaderboard')}
                      className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition"
                    >
                      View Full Leaderboard
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Complete runs to see your rank
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">This Week's Goal</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Distance</span>
                  <span className="font-bold">
                    {runStats?.totalDistance.toFixed(1) || '0'} / 20 mi
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((runStats?.totalDistance || 0) / 20) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;