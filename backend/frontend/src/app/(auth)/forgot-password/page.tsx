'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type Step = 'form' | 'sent' | 'error';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email });
      setStep('sent');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Something went wrong. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'sent') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconWrap}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.subtitle}>
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            The link expires in 15 minutes.
          </p>
          <p style={styles.devNote}>
            (In development mode, the reset link is printed to the Django console. Set EMAIL_HOST_USER in .env to send real emails via Gmail.)
          </p>
          <button style={styles.btn} onClick={() => router.push('/login')}>
            Back to Login
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
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>Enter your email and we&apos;ll send you a reset link.</p>

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

          {error && step === 'error' && (
            <div style={styles.errorBox}>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            ...styles.btn,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p style={styles.backLink}>
          Remember it? &apos;{' '}
          <Link href="/login" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
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
  devNote: {
    color: '#52525b',
    fontSize: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    fontStyle: 'italic',
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
