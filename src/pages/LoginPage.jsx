import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: 'EMP006', password: 'demo-emp1-2024' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form.employeeId, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-slate-950 p-8 text-white md:p-12">
          <div className="mb-6 inline-flex rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            Demo access
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Workplace Efficiency & Sustainability</h1>
          <p className="mt-4 max-w-md text-base text-slate-300">
            Monitor productivity, hybrid work patterns, learning participation, and sustainability metrics across your team.
          </p>

          <div className="mt-8 space-y-3">
            {demoAccounts.map((account) => (
              <button
                key={account.employeeId}
                type="button"
                onClick={() => setForm({ employeeId: account.employeeId, password: account.password })}
                className="flex w-full items-start justify-between rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-slate-900"
              >
                <div>
                  <div className="text-sm font-semibold text-white">{account.label}</div>
                  <div className="mt-1 text-xs text-slate-400">Employee ID: {account.employeeId}</div>
                </div>
                <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                  Use
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-8">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Sign in</div>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Welcome back</h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="form-label" htmlFor="employeeId">Employee ID</label>
              <input
                id="employeeId"
                className="form-input"
                value={form.employeeId}
                onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
