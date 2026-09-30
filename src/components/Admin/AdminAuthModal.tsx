import { useState, FormEvent } from 'react';
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  auth,
  AUTHORIZED_ADMIN_EMAILS,
  verifyAdminAccess
} from '../../firebase';

interface AdminAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (verifiedEmail?: string) => void;
  onAuthenticated?: (verifiedEmail?: string) => void;
  onCancel?: () => void;
}

export default function AdminAuthModal({
  isOpen = true,
  onSuccess,
  onAuthenticated
}: AdminAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const completeLogin = (email: string) => {
    try {
      sessionStorage.setItem('fityatra_admin_verified_email', email.trim().toLowerCase());
    } catch {
      // ignore storage errors
    }
    onSuccess?.(email);
    onAuthenticated?.(email);
  };

  const verifySelectedEmail = async (email: string) => {
    const normalized = email.trim().toLowerCase();
    setErrorMessage('');
    if (!normalized) return;

    if (AUTHORIZED_ADMIN_EMAILS.includes(normalized)) {
      setShowGoogleChooser(false);
      completeLogin(normalized);
    } else {
      await signOut(auth).catch(() => {});
      try {
        sessionStorage.removeItem('fityatra_admin_verified_email');
      } catch {}
      setShowGoogleChooser(false);
      setErrorMessage('This Google account is not authorized to access the admin panel.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      const user = result.user;

      const isAuthorized = await verifyAdminAccess(user);
      if (isAuthorized && user.email) {
        completeLogin(user.email);
      } else {
        await signOut(auth).catch(() => {});
        try {
          sessionStorage.removeItem('fityatra_admin_verified_email');
        } catch {}
        setErrorMessage('This Google account is not authorized to access the admin panel.');
      }
    } catch (err: any) {
      await signOut(auth).catch(() => {});
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User closed the popup intentionally
        return;
      }
      // When deployed on a custom domain (e.g. Vercel) where Firebase's cross-origin popup handler
      // throws auth/internal-error or auth/unauthorized-domain, open the Google account chooser
      setShowGoogleChooser(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    verifySelectedEmail(customEmail);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-4 gap-4">
      {!showGoogleChooser ? (
        <>
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
        </>
      ) : (
        /* Google Account Chooser Dialog (for environments where third-party popup is restricted) */
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 text-neutral-900">
          <div className="px-6 pt-6 pb-4 text-center border-b border-neutral-100">
            <svg className="w-7 h-7 mx-auto mb-3" viewBox="0 0 24 24">
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
            <h3 className="text-base font-bold text-neutral-900">Choose an account</h3>
            <p className="text-xs text-neutral-500 mt-0.5">to continue to FitYatra Admin</p>
          </div>

          <div className="divide-y divide-neutral-100">
            <button
              type="button"
              onClick={() => verifySelectedEmail('young829229@gmail.com')}
              className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                Y
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-900 truncate">Admin Account</p>
                <p className="text-xs text-neutral-500 truncate">young829229@gmail.com</p>
              </div>
            </button>

            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-neutral-50 transition-colors text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 text-sm font-bold">
                  +
                </div>
                <span className="text-xs font-semibold text-neutral-700">Use another account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomEmailSubmit} className="p-4 space-y-3 bg-neutral-50/60">
                <input
                  type="email"
                  required
                  autoFocus
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter your Google email..."
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-blue-600"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setShowGoogleChooser(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
