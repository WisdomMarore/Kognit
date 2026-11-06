import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';

const FEATURES = [
  { icon: '⚡', label: 'Spaced repetition' },
  { icon: '✦', label: 'AI-generated cards' },
  { icon: '◎', label: 'Quiz mode' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/auth/login/', { email, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError('That email or password isn\'t right.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center px-16 overflow-hidden">
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-ember/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-56 h-56 bg-ember/5 rounded-full blur-3xl" />

        <div className="relative max-w-sm">
          <div className="mb-8"><Logo size="lg" /></div>

          <h1 className="font-display text-4xl text-paper leading-tight mb-4">
            Remember more.<br />Study less.
          </h1>
          <p className="text-sand mb-10">
            Create flashcards, quiz yourself, and let spaced repetition do the rest.
          </p>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ember/15 border border-ember/40 text-ember flex items-center justify-center text-sm">
                  {f.icon}
                </div>
                <span className="text-sand text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo size="lg" /></div>

          <div className="bg-ink-2/60 backdrop-blur border border-sand/10 rounded-sm p-8 shadow-2xl">
            <h2 className="font-display text-2xl text-paper mb-1">Welcome back</h2>
            <p className="text-sand text-sm mb-6">Log in to continue to your account.</p>

            <form onSubmit={handleSubmit}>
              {error && <p className="text-rose text-sm mb-4">{error}</p>}

              <label className="block text-sm font-medium text-sand mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-sand/20 bg-ink text-paper rounded-sm px-3 py-2 mb-4 focus:outline-none focus:border-ember"
                required
              />

              <label className="block text-sm font-medium text-sand mb-1">Password</label>
              <div className="relative mb-6">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-sand/20 bg-ink text-paper rounded-sm px-3 py-2 pr-10 focus:outline-none focus:border-ember"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand/50 hover:text-sand text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ember text-ink py-2.5 rounded-full font-semibold hover:bg-ember-dark disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Spinner />}
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="text-sm text-sand text-center mt-6">
              No account? <Link to="/register" className="text-ember">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}