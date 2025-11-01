import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Cloud, Mail } from 'lucide-react';

interface LocationState {
  email?: string;
}

// interface ErrorResponse {
//   message: string;
// }

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://your-domain.com:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

const CheckEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState)?.email || '';
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>('');

  const handleResendEmail = async (): Promise<void> => {
    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch(buildPath('api/auth/resend-verification'), {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.success) {
        setResendMessage('✅ Verification email sent! Check your inbox.');
      } else {
        setResendMessage('❌ ' + (res.message || 'Failed to resend email.'));
      }
    } catch (error: any) {
      setResendMessage('❌ Failed to resend email.');
    } finally {
      setIsResending(false);
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
            <p className="text-blue-100">Your fitness journey starts here</p>
          </div>

          <div className="p-8 text-center">
            {/* Email Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Check Your Email! 📧
            </h2>
            
            <p className="text-gray-600 mb-2">
              We've sent a verification link to:
            </p>
            
            <p className="text-lg font-semibold text-blue-600 mb-6">
              {email}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Check your email inbox</li>
                <li>Click the verification link</li>
                <li>Return here to login</li>
              </ol>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Can't find the email? Check your spam folder.
            </p>

            {resendMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                resendMessage.includes('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {resendMessage}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 border-2 border-blue-500 rounded-lg text-blue-500 font-semibold hover:bg-blue-50 transition-all duration-300"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-white text-sm mt-6 opacity-90">© 2025 Sky Run. Transform your fitness journey.</p>
      </div>
    </div>
  );
};

export default CheckEmail;