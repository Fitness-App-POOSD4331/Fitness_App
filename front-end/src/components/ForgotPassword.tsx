import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Mail, ArrowLeft } from 'lucide-react';

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://your-domain.com:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(buildPath('api/auth/forgot-password'), {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.success) {
        setIsSuccess(true);
        setMessage(res.message || 'If an account with that email exists, a password reset link has been sent');
      } else {
        setMessage(res.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      setMessage('An error occurred. Please try again.');
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
            <p className="text-blue-100">Password Recovery</p>
          </div>

          <div className="p-8">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center text-blue-500 hover:text-blue-700 mb-6 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>

            {!isSuccess ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {message && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                  <Mail className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Check Your Email! 📧
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                    <li>Check your email inbox</li>
                    <li>Click the password reset link</li>
                    <li>Create a new password</li>
                    <li>Login with your new password</li>
                  </ol>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Can't find the email? Check your spam folder.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300"
                >
                  Back to Login
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

export default ForgotPassword;