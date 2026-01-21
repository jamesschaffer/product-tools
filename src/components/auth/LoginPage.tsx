import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface LoginPageProps {
  onLogin: (key: string) => Promise<boolean>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await onLogin(key);

    if (!success) {
      setError('Invalid access key');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Product Roadmap
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Enter your access key to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Access Key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your access key"
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            disabled={!key || isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Contact your administrator if you need access
        </p>
      </div>
    </div>
  );
}
