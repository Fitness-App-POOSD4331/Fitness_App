import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit2, MapPin, Clock, Zap, Flame, Calendar, Timer, ArrowLeft } from 'lucide-react';

function buildPath(route: string): string {
  const isProduction = window.location.hostname !== 'localhost';
  if (isProduction) {
    return 'http://smallproject.shop:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

function EditRunPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    distance: '',
    hours: '',
    minutes: '',
    seconds: '',
    calories: '',
    date: '',
    startTime: '',
    finishTime: ''
  });

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
        const run = res.data;
        const hours = Math.floor(run.time / 3600);
        const minutes = Math.floor((run.time % 3600) / 60);
        const seconds = run.time % 60;

        const startDate = new Date(run.startTime);
        const date = startDate.toISOString().split('T')[0];
        const startTimeStr = startDate.toTimeString().slice(0, 5);
        
        const finishDate = new Date(run.finishTime);
        const finishTimeStr = finishDate.toTimeString().slice(0, 5);

        setFormData({
          distance: run.distance.toString(),
          hours: hours.toString(),
          minutes: minutes.toString(),
          seconds: seconds.toString(),
          calories: run.caloriesBurned.toString(),
          date: date,
          startTime: startTimeStr,
          finishTime: finishTimeStr
        });
      }
    } catch (err) {
      console.error('Failed to load run:', err);
      setMessage('Failed to load run data');
    }
    setLoading(false);
  };

  const calculatePace = () => {
    const dist = parseFloat(formData.distance);
    const totalSeconds = (parseInt(formData.hours) || 0) * 3600 + (parseInt(formData.minutes) || 0) * 60 + (parseInt(formData.seconds) || 0);
    if (dist && totalSeconds) {
      return (totalSeconds / 60 / dist).toFixed(2);
    }
    return '0.00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const totalTime = (parseInt(formData.hours) || 0) * 3600 + (parseInt(formData.minutes) || 0) * 60 + (parseInt(formData.seconds) || 0);
    
    if (totalTime === 0) {
      setMessage('Please enter a valid duration');
      return;
    }

    // Combine date and times
    const startDateTime = `${formData.date}T${formData.startTime}:00`;
    const finishDateTime = `${formData.date}T${formData.finishTime}:00`;

    const obj = {
      distance: parseFloat(formData.distance),
      time: totalTime,
      averagePace: parseFloat(calculatePace()),
      caloriesBurned: parseInt(formData.calories),
      startTime: startDateTime,
      finishTime: finishDateTime
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildPath(`api/runs/${id}`), {
        method: 'PUT',
        body: JSON.stringify(obj),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const res = await response.json();

      if (!res.success) {
        setMessage(res.message || 'Failed to update run');
      } else {
        setMessage('Run updated successfully!');
        setTimeout(() => navigate(`/runs/${id}`), 1500);
      }
    } catch (e: any) {
      setMessage('Error: ' + e.toString());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading run...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(`/runs/${id}`)}
          className="flex items-center text-white hover:text-blue-100 mb-6 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Details
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 p-8">
            <div className="flex items-center text-white">
              <Edit2 className="w-10 h-10 mr-4" />
              <div>
                <h1 className="text-3xl font-bold">Edit Run</h1>
                <p className="text-blue-100 mt-1">Update your run details</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Distance and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance (miles) *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="5.0"
                      value={formData.distance}
                      onChange={(e) => setFormData({...formData, distance: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.hours}
                        onChange={(e) => setFormData({...formData, hours: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                        min="0"
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block text-center">Hours</span>
                  </div>
                  <div>
                    <div className="relative">
                      <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.minutes}
                        onChange={(e) => setFormData({...formData, minutes: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                        min="0"
                        max="59"
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block text-center">Minutes</span>
                  </div>
                  <div>
                    <div className="relative">
                      <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.seconds}
                        onChange={(e) => setFormData({...formData, seconds: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                        min="0"
                        max="59"
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block text-center">Seconds</span>
                  </div>
                </div>
              </div>

              {/* Calories and Pace */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories Burned *</label>
                  <div className="relative">
                    <Flame className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      placeholder="350"
                      value={formData.calories}
                      onChange={(e) => setFormData({...formData, calories: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calculated Pace (min/mile)</label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                    <div className="w-full pl-10 pr-4 py-3 bg-blue-50 border border-blue-300 rounded-lg text-blue-700 font-bold text-lg">
                      {calculatePace()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Start and Finish Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Finish Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      value={formData.finishTime}
                      onChange={(e) => setFormData({...formData, finishTime: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Edit2 className="w-5 h-5" />
                  <span>Update Run</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/runs/${id}`)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditRunPage;