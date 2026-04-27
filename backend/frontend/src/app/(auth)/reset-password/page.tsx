'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type Step = 'form' | 'success' | 'error';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState(emailFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  function getStrength(pw: string): { label: string; color: string; width: string } {
    if (pw.length === 0) return { label: '', color: 'transparent', width: '0%' };
    const strong = pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^a-zA-Z0-9]/.test(pw);
    const medium = pw.length >= 8 && (/[A-Z]/.test(pw) || /[0-9]/.test(pw));
    if (strong) return { label: 'Strong', color: '#22c55e', width: '100%' };
    if (medium) return { label: 'Medium', color: '#f59e0b', width: '60%' };
    return { label: 'Weak', color: '#ef4444', width: '30%' };
  }

  const strength = getStrength(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!token) {
      setError('Missing reset token.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password/', {
        email,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStep('success');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; token?: string[]; email?: string[]; confirm_password?: string[] } } };
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.token?.[0] ||
        e.response?.data?.email?.[0] ||
        e.response?.data?.confirm_password?.[0] ||
        'Something went wrong. Please try again.';
      setError(msg);
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconWrap}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={styles.title}>Password Updated!</h1>
          <p style={styles.subtitle}>
            Your password has been changed successfully. You can now log in.
          </p>
          <button style={styles.btn} onClick={() => router.push('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 style={styles.title}>Set New Password</h1>
        <p style={styles.subtitle}>Enter your new password below.</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>New password</label>
            <div style={styles.pwWrap}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                style={{ ...styles.input, paddingRight: '48px' }}
                autoComplete="new-password"
              />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                {showNew ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={styles.strengthTrack}>
                  <div style={{ ...styles.strengthBar, width: strength.width, backgroundColor: strength.color }} />
                </div>
                <span style={{ fontSize: '12px', color: strength.color, marginTop: '4px', display: 'block' }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm password</label>
            <div style={styles.pwWrap}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                style={{
                  ...styles.input,
                  paddingRight: '48px',
                  borderColor: passwordsMismatch ? '#ef4444' : passwordsMatch ? '#22c55e' : 'rgba(255,255,255,0.1)',
                }}
                autoComplete="new-password"
              />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            {passwordsMismatch && <p style={styles.matchErr}>Passwords do not match</p>}
            {passwordsMatch && <p style={styles.matchOk}>Passwords match</p>}
          </div>

          {error && step === 'error' && (
            <div style={styles.errorBox}>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading || passwordsMismatch || !token} style={{
            ...styles.btn,
            opacity: (loading || passwordsMismatch || !token) ? 0.6 : 1,
            cursor: (loading || passwordsMismatch || !token) ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Updating…' : 'Reset Password'}
          </button>
        </form>

        <p style={styles.backLink}>
          Remember it?{' '}
          <Link href="/login" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

function EyeOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#030303',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  card: {
    backgroundColor: '#0f0f0f',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  iconWrap: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    backgroundColor: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 800,
    margin: '0 0 6px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#71717a',
    fontSize: '14px',
    textAlign: 'center',
    margin: '0 0 28px',
    lineHeight: 1.5,
  },
  fieldGroup: {
    width: '100%',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    color: '#a1a1aa',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  pwWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#52525b',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  strengthTrack: {
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s, background-color 0.3s',
  },
  matchErr: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '6px',
    margin: '6px 0 0',
  },
  matchOk: {
    color: '#22c55e',
    fontSize: '12px',
    marginTop: '6px',
    margin: '6px 0 0',
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '20px',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    backgroundColor: '#22c55e',
    color: '#000000',
    fontWeight: 700,
    fontSize: '15px',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, opacity 0.2s',
    marginTop: '4px',
  },
  backLink: {
    color: '#52525b',
    fontSize: '14px',
    marginTop: '24px',
    textAlign: 'center',
  },
};
