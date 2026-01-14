'use client';

import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calculator, User, Lock } from 'lucide-react';
import { Button, Input, Spinner } from '../components';
import Image from 'next/image';

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
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Username atau password salah');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (user) return null;

  return (
    <div className="flex h-screen">
      {/* Left - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-100">
        <Image
          src="/globe.svg"
          alt="Login background"
          fill
          className="object-contain p-20"
          priority
        />
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="text-left mb-8">
            <h1 className="text-5xl font-bold text-slate-900">Kasir Pro</h1>
            <p className="text-slate-500 mt-1">Point of Sale System</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" icon={<User />} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" icon={<Lock />} showPasswordToggle error={error} required />
            <Button type="submit" isLoading={loading} className="w-full" size="lg">Masuk</Button>
          </form>
          <p className="mt-6 text-xs text-slate-400 text-center">Login: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
