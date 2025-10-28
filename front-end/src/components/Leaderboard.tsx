import { useState, FormEvent } from "react";
import { Mail, Lock, Dumbbell, Activity } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 flex items-center justify-center p-4 min-h-screen relative">
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3">
                <Dumbbell className="w-12 h-12 text-orange-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Solar Fit</h1>
            <p className="text-blue-100">Your fitness journey starts here</p>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                className="flex-1 py-2 rounded-md font-semibold bg-white text-orange-500 shadow-md"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex-1 py-2 rounded-md font-semibold text-gray-600 hover:text-purple-600"
              >
                Register
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-orange-500 hover:text-purple-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Activity className="w-5 h-5" />
                <span>Login</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-orange-500 hover:text-purple-700 font-semibold"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white text-sm mt-6 opacity-90">
          © 2025 FitTrack Pro. Transform your fitness journey.
        </p>
      </div>
    </div>
  );
};

export default Login;
