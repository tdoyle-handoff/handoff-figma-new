import { useState, useEffect } from 'react';

interface PasswordResetState {
  showPasswordReset: boolean;
  resetToken: string | null;
}

interface PasswordResetActions {
  handlePasswordResetSuccess: () => void;
  handleBackToLogin: () => void;
}

export function usePasswordReset(): PasswordResetState & PasswordResetActions {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Check for password reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const isResetPage = window.location.pathname.includes('reset-password');
    
    if (token && isResetPage) {
      setResetToken(token);
      setShowPasswordReset(true);
    }
  }, []);

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false);
    setResetToken(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
    setResetToken(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return {
    showPasswordReset,
    resetToken,
    handlePasswordResetSuccess,
    handleBackToLogin,
  };
}