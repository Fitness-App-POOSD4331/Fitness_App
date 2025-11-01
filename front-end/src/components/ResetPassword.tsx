import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Cloud, Lock, CheckCircle } from 'lucide-react';

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://your-domain.com:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid reset link. No token provided.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(buildPath('api/auth/reset-password'), {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.success) {
        setIsSuccess(true);
        setMessage(res.message || 'Password reset successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (error: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center p-4 min-h-screen relative">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3">
                <Cloud className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Sky Run</h1>
            <p className="text-blue-100">Reset Your Password</p>
          </div>

          <div className="p-8">
            {error && !isSuccess && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!isSuccess ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Create New Password
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-500 hover:text-blue-700 font-semibold"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-green-900 mb-2">
                  Password Reset! ✅
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500 mb-6">
                  Redirecting to login page in 3 seconds...
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300"
                >
                  Go to Login Now
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-white text-sm mt-6 opacity-90">
          © 2025 Sky Run. Transform your fitness journey.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;