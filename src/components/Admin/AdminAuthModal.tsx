import { useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  verifyAdminAccess
} from '../../firebase';

interface AdminAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onAuthenticated?: () => void;
  onCancel?: () => void;
}

export default function AdminAuthModal({
  isOpen = true,
  onSuccess,
  onAuthenticated
}: AdminAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const completeLogin = () => {
    onSuccess?.();
    onAuthenticated?.();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const isAuthorized = await verifyAdminAccess(user);
      if (isAuthorized) {
        completeLogin();
      } else {
        await signOut(auth);
        setErrorMessage('This Google account is not authorized to access the admin panel.');
      }
    } catch (err: any) {
      await signOut(auth).catch(() => {});
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setErrorMessage(
          err?.message || 'Google authentication failed. Please try again with an authorized admin account.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-4 gap-4">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="bg-white hover:bg-neutral-100 active:scale-[0.98] text-neutral-900 font-bold text-sm px-7 py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
          />
        </svg>
        <span>{loading ? 'Signing in...' : 'Login with Google'}</span>
      </button>

      {errorMessage && (
        <p className="text-red-400 text-xs sm:text-sm font-semibold text-center max-w-sm px-3">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
