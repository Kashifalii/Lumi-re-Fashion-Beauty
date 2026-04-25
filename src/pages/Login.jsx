import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Invalid email or password.' : err.message);
    } else {
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      {/* Left: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg"
          alt="Beauty"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/80 to-neutral-950/60" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg leading-none">L</span>
            </div>
            <span className="font-display font-bold text-xl text-white">Lumière</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold text-white mb-3 leading-tight">
              Welcome back,<br />beautiful.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Sign in to access your wishlist, track orders, and discover products curated just for you.
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

          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-1">Sign in</h1>
          <p className="text-neutral-400 text-sm mb-7">Don&apos;t have an account?{' '}
            <Link to="/register" className="text-rose-500 hover:text-rose-600 font-medium">Create one</Link>
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
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={RiLockLine}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-rose-500 hover:text-rose-600 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400">
            By signing in, you agree to our{' '}
            <Link to="#" className="text-neutral-600 dark:text-neutral-300 hover:text-rose-500">Terms</Link>
            {' '}and{' '}
            <Link to="#" className="text-neutral-600 dark:text-neutral-300 hover:text-rose-500">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
