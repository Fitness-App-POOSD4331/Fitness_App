import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Clock, Zap, Flame, Calendar, Edit2, Trash2, ArrowLeft, Eye } from 'lucide-react';

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

function buildPath(route: string): string {
  const isProduction = window.location.hostname !== 'localhost';
  if (isProduction) {
    return 'http://smallproject.shop:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

function RunHistoryPage() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildPath('api/runs'), {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const res = await response.json();
      if (res.success && res.data) {
        setRuns(res.data);
      }
    } catch (err) {
      console.error('Failed to load runs:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this run?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildPath(`api/runs/${id}`), {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const res = await response.json();
      if (res.success) {
        setRuns(runs.filter(r => r._id !== id));
      } else {
        alert(res.message || 'Failed to delete run');
      }
    } catch (err) {
      alert('Error deleting run');
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const sortedRuns = [...runs].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return b.distance - a.distance;
      case 'calories':
        return b.caloriesBurned - a.caloriesBurned;
      case 'pace':
        return a.averagePace - b.averagePace;
      default: // date
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading runs...</div>
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
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <Activity className="w-10 h-10 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold">Run History</h1>
                  <p className="text-blue-100 mt-1">{runs.length} runs completed</p>
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-white bg-white text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="date">Sort by Date</option>
                <option value="distance">Sort by Distance</option>
                <option value="calories">Sort by Calories</option>
                <option value="pace">Sort by Pace</option>
              </select>
            </div>
          </div>

          <div className="p-8">
            {runs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No runs recorded yet</p>
                <button
                  onClick={() => navigate('/runs/new')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold"
                >
                  Record Your First Run
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedRuns.map((run) => (
                  <div
                    key={run._id}
                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all border-2 border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-blue-500 p-3 rounded-lg">
                            <Activity className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-lg font-bold text-gray-900">
                                {formatDate(run.startTime)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {run.distance.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">miles</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {formatTime(run.time)}
                              </div>
                              <div className="text-xs text-gray-500">duration</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-600" />
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {run.averagePace.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">min/mile</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-600" />
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {run.caloriesBurned}
                              </div>
                              <div className="text-xs text-gray-500">calories</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <button
                          onClick={() => navigate(`/runs/${run._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/runs/${run._id}/edit`)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(run._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RunHistoryPage;