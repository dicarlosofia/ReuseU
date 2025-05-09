import { useState } from 'react';

export default function ForgotPassword({ onRequestReset }: { onRequestReset: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onRequestReset(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-lime-100 rounded text-cyan-900 flex flex-col items-center">
        <div>Check your email for a password reset link.</div>
        <a href="/login" className="mt-4 text-blue-600 hover:underline">Back to Sign In</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow-md max-w-sm mx-auto">
      <h2 className="text-lg font-bold text-cyan-800">Forgot your password?</h2>
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lime-700 text-white py-2 rounded hover:bg-lime-800 disabled:opacity-60"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      <div className="text-center">
        <a href="/login" className="text-sm text-blue-600 hover:underline">Back to Sign In</a>
      </div>
    </form>
  );
}
