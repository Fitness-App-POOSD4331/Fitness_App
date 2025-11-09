import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Trophy, 
  Medal, 
  Award, 
  LogOut, 
  TrendingUp, 
  Flame, 
  Star,
  ArrowLeft,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Target
} from 'lucide-react';

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://your-domain.com:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

interface Runner {
  _id: string;
  displayName: string;
  userName: string;
  totalDistance: number;
  caloriesBurned: number;
  position: number;
  isCurrentUser?: boolean;
}

interface MyRankData {
  myRank: number;
  totalUsers: number;
  leaderboard: Runner[];
}

type LeaderboardType = 'distance' | 'calories' | 'top';

function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('distance');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [myRank, setMyRank] = useState<MyRankData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when switching types
    fetchLeaderboard();
    if (currentUser) {
      fetchMyRank();
    }
  }, [leaderboardType]);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage]);

  const fetchCurrentUser = () => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
    }
  };

  const fetchMyRank = async () => {
    try {
      const token = localStorage.getItem('token');
      const type = leaderboardType === 'top' ? 'distance' : leaderboardType;
      
      const response = await fetch(
        buildPath(`api/leaderboard/myrank?type=${type}&range=3`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const res = await response.json();
      if (res.success && res.data) {
        const rankData: MyRankData = {
          myRank: res.data.myRank || res.data.rank,
          totalUsers: res.data.totalUsers,
          leaderboard: res.data.leaderboard || []
        };
        setMyRank(rankData);
      }
    } catch (err) {
      console.error('Failed to fetch rank:', err);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const limit = 20;
      
      const response = await fetch(
        buildPath(`api/leaderboard/${leaderboardType}?page=${currentPage}&limit=${limit}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const res = await response.json();

      if (res.success && res.data) {
        let leaderboard = [];
        
        if (leaderboardType === 'top') {
          leaderboard = res.data.topDistance || [];
        } else {
          leaderboard = res.data.leaderboard || [];
          
          // Handle pagination
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages);
            setTotalUsers(res.data.pagination.totalUsers);
          }
        }
        
        if (!Array.isArray(leaderboard)) {
          setError('Invalid leaderboard format received from server');
          return;
        }
        
        const dataWithPositions = leaderboard.map((runner: any) => ({
          _id: runner.userId || runner._id,
          displayName: runner.displayName || 'Unknown',
          userName: runner.userName || 'unknown',
          totalDistance: Number(runner.totalDistance) || 0,
          caloriesBurned: Number(runner.caloriesBurned) || 0,
          position: runner.rank || 0,
          isCurrentUser: currentUser && (runner.userId === currentUser._id || runner._id === currentUser._id)
        }));
        
        setLeaderboardData(dataWithPositions);
      } else {
        setError(res.message || 'Failed to load leaderboard');
      }
    } catch (err: any) {
      setError('Error loading leaderboard: ' + err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLeaderboard(), fetchMyRank()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    navigate('/login');
  };

  const getPodiumHeight = (position: number) => {
    if (position === 1) return 'h-64';
    if (position === 2) return 'h-52';
    if (position === 3) return 'h-44';
  };

  const getPodiumColor = (position: number) => {
    if (position === 1) return 'bg-gradient-to-b from-yellow-400 to-yellow-600';
    if (position === 2) return 'bg-gradient-to-b from-gray-300 to-gray-500';
    if (position === 3) return 'bg-gradient-to-b from-orange-600 to-orange-800';
  };

  const getPositionBadgeColor = (position: number) => {
    if (position === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    if (position === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500';
    if (position === 3) return 'bg-gradient-to-br from-orange-600 to-orange-800';
    return 'bg-gradient-to-br from-blue-400 to-blue-600';
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6" />;
    if (position === 2) return <Medal className="w-6 h-6" />;
    if (position === 3) return <Award className="w-6 h-6" />;
    return null;
  };

  const getLeaderboardTitle = () => {
    if (leaderboardType === 'distance') return 'Greatest Distance';
    if (leaderboardType === 'calories') return 'Most Calories Burned';
    return 'Top Performers';
  };

  const getMetricValue = (runner: Runner) => {
    if (leaderboardType === 'distance') return runner.totalDistance.toFixed(1);
    if (leaderboardType === 'calories') return runner.caloriesBurned.toFixed(0);
    return runner.totalDistance.toFixed(1);
  };

  const getMetricLabel = () => {
    if (leaderboardType === 'distance') return 'miles';
    if (leaderboardType === 'calories') return 'cal';
    return 'miles';
  };

  // Filter leaderboard data based on search
  const filteredData = leaderboardData.filter(runner =>
    runner.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    runner.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && leaderboardData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <Cloud className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Sky Run</h1>
              <p className="text-gray-600">Leaderboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {currentUser && (
              <div className="text-right hidden sm:block">
                <div className="text-lg font-semibold text-gray-800">{currentUser.displayName}</div>
                <div className="text-sm text-gray-600">@{currentUser.userName}</div>
              </div>
            )}
            <button
               aria-label="Back to Dashboard"
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
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

        {/* My Rank Card */}
        {myRank && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Your Rank
                </h3>
                <div className="text-4xl md:text-5xl font-bold">#{myRank.myRank}</div>
                <div className="text-sm md:text-base mt-1 opacity-90">
                  out of {myRank.totalUsers} runners
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition"
              >
                <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setLeaderboardType('distance')}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                leaderboardType === 'distance'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Distance
            </button>
            <button
              onClick={() => setLeaderboardType('calories')}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                leaderboardType === 'calories'
                  ? 'bg-gradient-to-r from-orange-400 to-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Flame className="w-5 h-5" />
              Calories
            </button>
            <button
              onClick={() => setLeaderboardType('top')}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                leaderboardType === 'top'
                  ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Star className="w-5 h-5" />
              Top 10
            </button>
          </div>
        </div>

        {/* Podium Section */}
        {topThree.length >= 3 && leaderboardType !== 'top' && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">Top 3 Runners</h2>
            <div className="flex items-end justify-center gap-2 md:gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-24 md:w-64">
                <Medal className="w-12 md:w-16 h-12 md:h-16 text-gray-400 mb-3" />
                <div className={`${getPodiumHeight(2)} ${getPodiumColor(2)} w-full rounded-t-lg flex flex-col items-center justify-center text-white shadow-xl`}>
                  <div className="text-sm md:text-xl font-bold text-center px-2 md:px-4">
                    {topThree[1]?.displayName}
                  </div>
                  <div className="text-xl md:text-3xl font-bold mt-2">{getMetricValue(topThree[1])}</div>
                  <div className="text-xs md:text-sm">{getMetricLabel()}</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center w-24 md:w-64">
                <Trophy className="w-16 md:w-20 h-16 md:h-20 text-yellow-500 mb-3" />
                <div className={`${getPodiumHeight(1)} ${getPodiumColor(1)} w-full rounded-t-lg flex flex-col items-center justify-center text-white shadow-xl`}>
                  <div className="text-sm md:text-xl font-bold text-center px-2 md:px-4">
                    {topThree[0]?.displayName}
                  </div>
                  <div className="text-2xl md:text-4xl font-bold mt-2">{getMetricValue(topThree[0])}</div>
                  <div className="text-xs md:text-sm">{getMetricLabel()}</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center w-24 md:w-64">
                <Award className="w-10 md:w-14 h-10 md:h-14 text-orange-700 mb-3" />
                <div className={`${getPodiumHeight(3)} ${getPodiumColor(3)} w-full rounded-t-lg flex flex-col items-center justify-center text-white shadow-xl`}>
                  <div className="text-sm md:text-xl font-bold text-center px-2 md:px-4">
                    {topThree[2]?.displayName}
                  </div>
                  <div className="text-xl md:text-3xl font-bold mt-2">{getMetricValue(topThree[2])}</div>
                  <div className="text-xs md:text-sm">{getMetricLabel()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 p-6">
            <h2 className="text-2xl md:text-4xl font-bold text-white text-center">{getLeaderboardTitle()}</h2>
          </div>

          {/* Search Bar */}
          {leaderboardType !== 'top' && (
            <div className="p-4 border-b border-gray-200">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search runners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="p-4 md:p-6">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4">Loading...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? 'No runners found matching your search.' : 'No runners yet. Be the first to start running!'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredData.map((runner) => (
                  <div
                    key={runner._id}
                    className={`flex items-center justify-between p-4 rounded-xl hover:shadow-md transition-shadow duration-200 ${
                      runner.isCurrentUser
                        ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-400'
                        : 'bg-gradient-to-r from-gray-50 to-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 ${getPositionBadgeColor(runner.position)} rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md flex-shrink-0`}>
                        {getPositionIcon(runner.position) || runner.position}
                      </div>
                      <div>
                        <div className="text-base md:text-xl font-semibold text-gray-800">
                          {runner.displayName}
                          {runner.isCurrentUser && (
                            <span className="ml-2 text-xs md:text-sm text-blue-600 font-normal">(You)</span>
                          )}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">@{runner.userName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl md:text-3xl font-bold text-blue-500">{getMetricValue(runner)}</div>
                      <div className="text-xs md:text-sm text-gray-500">{getMetricLabel()}</div>
                      {leaderboardType === 'distance' && (
                        <div className="text-xs text-gray-400 mt-1">{runner.caloriesBurned} cal</div>
                      )}
                      {leaderboardType === 'calories' && (
                        <div className="text-xs text-gray-400 mt-1">{runner.totalDistance.toFixed(1)} mi</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {leaderboardType !== 'top' && !searchTerm && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <span className="px-4 py-2 font-semibold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Total Users Info */}
            {leaderboardType !== 'top' && totalUsers > 0 && (
              <div className="text-center mt-4 text-sm text-gray-600">
                Showing {Math.min(currentPage * 20, totalUsers)} of {totalUsers} runners
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;