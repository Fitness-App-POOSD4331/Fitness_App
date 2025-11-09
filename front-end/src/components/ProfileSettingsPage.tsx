import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Weight, Ruler, Calendar, Users, Save, ArrowLeft } from 'lucide-react';

function buildPath(route: string): string {
  return 'http://localhost:5001/' + route;
}

function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    userName: '',
    email: '',
    weight: '',
    height: '',
    age: '',
    sex: 'male',
    bmi: 0
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildPath('api/auth/profile'), {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const res = await response.json();

      if (res.success) {
        setFormData({
          displayName: res.data.displayName || '',
          userName: res.data.userName || '',
          email: res.data.email || '',
          weight: res.data.weight || '',
          height: res.data.height || '',
          age: res.data.age || '',
          sex: res.data.sex || 'male',
          bmi: res.data.bmi || 0
        });
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const obj = {
      displayName: formData.displayName,
      userName: formData.userName,
      weight: formData.weight ? Number(formData.weight) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      age: formData.age ? Number(formData.age) : undefined,
      sex: formData.sex
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildPath('api/users/profile'), {
        method: 'PUT',
        body: JSON.stringify(obj),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const res = await response.json();

      if (!res.success) {
        setMessage(res.message || 'Failed to update profile');
      } else {
        setMessage('Profile updated successfully!');
        // Update local storage with new data
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        localStorage.setItem('user_data', JSON.stringify({...userData, ...res.data}));
        
        // Update BMI in form
        if (res.data.bmi) {
          setFormData(prev => ({...prev, bmi: res.data.bmi}));
        }
      }
    } catch (e: any) {
      setMessage('Error: ' + e.toString());
    }
  };

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const bmi = Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2);
      return bmi.toFixed(1);
    }
    return formData.bmi ? formData.bmi.toFixed(1) : '0.0';
  };

  const getBMICategory = () => {
    const bmi = parseFloat(calculateBMI());
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal weight', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  const bmiCategory = getBMICategory();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
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
              <User className="w-10 h-10 mr-4" />
              <div>
                <h1 className="text-3xl font-bold">Profile Settings</h1>
                <p className="text-blue-100 mt-1">Manage your account information</p>
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
              {/* Account Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="johndoe123"
                        value={formData.userName}
                        onChange={(e) => setFormData({...formData, userName: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-100 border-gray-300 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
              </div>

              {/* Physical Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Physical Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="175"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.sex}
                        onChange={(e) => setFormData({...formData, sex: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all appearance-none"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* BMI Display */}
              {formData.weight && formData.height && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Body Mass Index (BMI)</h3>
                      <p className="text-sm text-gray-600">Based on your current weight and height</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-600">{calculateBMI()}</div>
                      <div className={`text-sm font-semibold ${bmiCategory.color}`}>{bmiCategory.text}</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;