import React, { useState } from 'react';
import { Dumbbell, Mail, Lock, User, Activity, Weight, Ruler, Calendar, Users } from 'lucide-react';

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://your-domain.com:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [remember, setRemember] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('male');

  const doLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const obj = { email: email, password: password };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/auth/login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (!res.success) {
        setMessage(res.message || 'Login failed');
      } else {
        setMessage('');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_data', JSON.stringify(res.data));
        window.location.href = '/leaderboard';
      }
    } catch (e: any) {
      setMessage('Login error: ' + e.toString());
    }
  };

  const doRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    const obj = { 
      displayName: displayName, 
      email: email, 
      password: password,
      userName: userName,
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      age: age ? Number(age) : undefined,
      sex: sex
    };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/auth/register'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (!res.success) {
        setMessage(res.message || 'Registration failed');
      } else {
        setMessage('');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_data', JSON.stringify(res.data));
        window.location.href = '/leaderboard';
      }
    } catch (e: any) {
      setMessage('Registration error: ' + e.toString());
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 flex items-center justify-center p-4 min-h-screen relative">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3">
                <Dumbbell className="w-12 h-12 text-orange-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Solar Fit</h1>
            <p className="text-blue-100">Your fitness journey starts here</p>
          </div>

          <div className="p-8">
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-2 rounded-md font-semibold transition-all ${!isRegister ? 'bg-white text-orange-500 shadow-md' : 'text-gray-600 hover:text-orange-600'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-2 rounded-md font-semibold transition-all ${isRegister ? 'bg-white text-orange-500 shadow-md' : 'text-gray-600 hover:text-orange-600'}`}
              >
                Register
              </button>
            </div>

            {message && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {message}
              </div>
            )}

            {!isRegister ? (
              <form className="space-y-4" onSubmit={doLogin}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" required />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mr-2" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-orange-500 hover:text-orange-700 font-medium">Forgot password?</a>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-amber-500 hover:via-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Login</span>
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={doRegister}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="johndoe123" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="number" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 transition-all appearance-none">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-amber-500 hover:via-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Create Account</span>
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-orange-500 hover:text-orange-700 font-semibold">
                  {isRegister ? 'Login' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-white text-sm mt-6 opacity-90">© 2025 Solar Fit. Transform your fitness journey.</p>
      </div>
    </div>
  );
}

export default Login;