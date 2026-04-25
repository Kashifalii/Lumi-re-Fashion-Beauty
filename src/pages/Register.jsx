import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockLine, RiUserLine, RiEyeLine, RiEyeOffLine, RiCheckLine } from 'react-icons/ri';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const { error: err } = await signUp(form.email, form.password, form.fullName);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <RiCheckLine size={32} className="text-emerald-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-2">Welcome to Lumière!</h2>
          <p className="text-neutral-400 text-sm">Your account has been created. Redirecting you now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      {/* Left: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg"
          alt="Fashion"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/80 to-rose-950/50" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg leading-none">L</span>
            </div>
            <span className="font-display font-bold text-xl text-white">Lumière</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold text-white mb-3 leading-tight">
              Your style,<br />your story.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Join thousands of women who trust Lumière for their fashion and beauty needs.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg leading-none">L</span>
              </div>
              <span className="font-display font-bold text-xl text-neutral-900 dark:text-white">Lumière</span>
            </Link>
          </div>

          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-1">Create account</h1>
          <p className="text-neutral-400 text-sm mb-7">Already have an account?{' '}
            <Link to="/login" className="text-rose-500 hover:text-rose-600 font-medium">Sign in</Link>
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={RiUserLine}
              value={form.fullName}
              onChange={update('fullName')}
              placeholder="Jane Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              icon={RiMailLine}
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={RiLockLine}
                value={form.password}
                onChange={update('password')}
                placeholder="Min 6 characters"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
              </button>
            </div>
            <Input
              label="Confirm Password"
              type="password"
              icon={RiLockLine}
              value={form.confirm}
              onChange={update('confirm')}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
            />
            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
