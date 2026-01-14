'use client';

import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Lock } from 'lucide-react';
import { Button, Input, Spinner } from '../components';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.push('/dashboard');
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) router.push('/dashboard');
    else setError('Username atau password salah');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Toko Jaya Abadi</h1>
          <p className="text-slate-500 text-sm lg:text-base mt-1">Point of Sale System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" icon={<User />} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" icon={<Lock />} showPasswordToggle error={error} required />
          <Button type="submit" isLoading={loading} className="w-full" size="lg">Masuk</Button>
        </form>
        <p className="mt-4 lg:mt-6 text-xs text-slate-400 text-center">Login: admin / admin123</p>
      </div>
    </div>
  );
}
