import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiMailLine, RiArrowLeftLine, RiCheckLine } from 'react-icons/ri';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await resetPassword(email);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-rose-500 transition-colors mb-8">
          <RiArrowLeftLine size={16} />
          Back to sign in
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <RiCheckLine size={28} className="text-emerald-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-2">Check your inbox</h1>
            <p className="text-neutral-400 text-sm">
              We sent a password reset link to <strong className="text-neutral-600 dark:text-neutral-300">{email}</strong>.
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center mb-5">
              <RiMailLine size={24} className="text-rose-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-1">Forgot password?</h1>
            <p className="text-neutral-400 text-sm mb-7">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                icon={RiMailLine}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
