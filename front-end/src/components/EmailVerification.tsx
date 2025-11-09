import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Cloud, CheckCircle, XCircle } from 'lucide-react';

type VerificationStatus = 'verifying' | 'success' | 'error';

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://your-domain.com:5001/' + route;
  } else {
    return 'http://localhost:5001/' + route;
  }
}

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState<string>('');
  const hasVerified = useRef(false); // Prevent double execution

  useEffect(() => {
    const verifyEmail = async (): Promise<void> => {
      // Prevent double execution
      if (hasVerified.current) {
        console.log('Already verified, skipping...');
        return;
      }
      hasVerified.current = true;

      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      console.log('Verifying email with token:', token);

      try {
        const response = await fetch(
          buildPath(`api/auth/verify-email?token=${token}`),
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        console.log('Verification response status:', response.status);
        const res = await response.json();
        console.log('Verification response data:', res);
        
        if (res.success) {
          console.log('✅ Verification successful!');
          setStatus('success');
          setMessage(res.message || 'Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          console.log('❌ Verification failed with message:', res.message);
          setStatus('error');
          setMessage(res.message || 'Verification failed.');
        }
      } catch (error: any) {
        console.error('❌ Verification error:', error);
        setStatus('error');
        setMessage('Verification failed. The link may be expired or invalid.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

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

          <div className="p-8">
            {status === 'verifying' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-green-900 mb-2">
                  Email Verified! ✅
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

            {status === 'error' && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-red-900 mb-2">
                  Verification Failed ❌
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 text-white py-3 rounded-lg font-semibold hover:from-blue-400 hover:via-blue-600 hover:to-blue-950 transition-all duration-300"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-white text-sm mt-6 opacity-90">© 2025 Sky Run. Transform your fitness journey.</p>
      </div>
    </div>
  );
};

export default EmailVerification;