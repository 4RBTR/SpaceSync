'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input, Form } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.username, formData.password);
      
      const userType = localStorage.getItem('user_type');
      if (userType === 'admin_space') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login gagal. Silakan cek username dan password.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* Left Pane: Branding & Visual Showcase (Light Gradient Mesh) */}
      <div className="hidden lg:flex lg:col-span-6 relative bg-gradient-to-tr from-indigo-900 via-indigo-800 to-violet-900 p-16 flex-col justify-between overflow-hidden border-r border-slate-200 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 group relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-400 to-emerald-400 p-[2px] shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-white">
              S
            </div>
          </div>
          <span className="font-black font-heading text-2xl tracking-tight text-white">
            Space<span className="text-indigo-300">Sync</span>
          </span>
        </Link>

        {/* Center Testimonial / Hero Quote */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-xs font-bold">
            ⚡ Smart Reservation Ecosystem
          </div>
          <h2 className="text-4xl font-black font-heading tracking-tight text-white leading-tight">
            "Pengalaman reservasi coworking space tercepat dan paling efisien."
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Akses ke puluhan pilihan meja kerja, meeting room, dan office space terpercaya di seluruh lokasi hanya dalam hitungan detik.
          </p>
        </div>

        {/* Footer Credit */}
        <p className="text-xs text-indigo-300/80 relative z-10">
          © 2026 SpaceSync Inc. Built for UKK System Standard.
        </p>
      </div>

      {/* Right Pane: Modern Clean Light Login Form */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-left space-y-2">
            <h1 className="text-3xl font-black font-heading text-slate-900 tracking-tight">
              Selamat Datang Kembali 👋
            </h1>
            <p className="text-slate-500 text-sm">
              Masuk ke akun Anda untuk mengelola reservasi dan rincian pemesanan.
            </p>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              dismissible
            />
          )}

          <Form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Username
              </label>
              <Input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Masukkan username Anda"
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white py-3 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Masukkan password Anda"
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white py-3 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-3.5 text-base font-bold shadow-xl shadow-indigo-500/25"
              size="lg"
            >
              Masuk Akun
            </Button>
          </Form>

          {/* Registration Options */}
          <div className="pt-6 border-t border-slate-100 text-center space-y-4">
            <p className="text-xs text-slate-500">
              Belum memiliki akun?{' '}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold underline">
                Daftar Akun Baru
              </Link>
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/register/member" className="w-full">
                <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 text-xs">
                  Daftar Member
                </Button>
              </Link>
              <Link href="/register/admin" className="w-full">
                <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 text-xs">
                  Daftar Admin Space
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}


