import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, MapPin, Clock, Zap, Flame, Calendar, Edit2, Trash2, ArrowLeft, Timer } from 'lucide-react';

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

function RunDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRun();
    }
  }, [id]);

  const loadRun = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildPath(`api/runs/${id}`), {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const res = await response.json();
      if (res.success && res.data) {
        setRun(res.data);
      }
    } catch (err) {
      console.error('Failed to load run:', err);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this run? This action cannot be undone.')) return;

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
        navigate('/runs');
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
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTimeOfDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading run details...</div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Run Not Found</h2>
          <button
            onClick={() => navigate('/runs')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/runs')}
          className="flex items-center text-white hover:text-blue-100 mb-6 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to History
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Run Details</h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg">{formatDate(run.startTime)}</span>
                </div>
              </div>
              <Activity className="w-16 h-16 opacity-50" />
            </div>
          </div>

          {/* Main Stats */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                <MapPin className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {run.distance.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Miles</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                <Clock className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {formatTime(run.time)}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Duration</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                <Zap className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {run.averagePace.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Min/Mile Pace</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
                <Flame className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {run.caloriesBurned}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Calories</div>
              </div>
            </div>

            {/* Time Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-600" />
                Time Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                  <span className="text-gray-600 font-semibold">Start Time:</span>
                  <span className="text-gray-900 font-bold">{formatTimeOfDay(run.startTime)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                  <span className="text-gray-600 font-semibold">Finish Time:</span>
                  <span className="text-gray-900 font-bold">{formatTimeOfDay(run.finishTime)}</span>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(run.distance / (run.time / 3600)).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Miles per Hour</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(run.caloriesBurned / run.distance).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Calories per Mile</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {((run.time / 60) / run.distance).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Minutes per Mile</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/runs/${run._id}/edit`)}
                className="flex-1 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-5 h-5" />
                <span>Edit Run</span>
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RunDetailsPage;