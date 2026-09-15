'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input, Form, FormRow, FileInput } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { useFormData } from '@/lib/hooks';

export default function AdminRegisterPage() {
  const router = useRouter();
  const { registerAdminSpace, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const { formData, handleChange, handleFileChange } = useFormData({
    nama_coworking: '',
    nama_pemilik: '',
    alamat: '',
    no_telepon: '',
    username: '',
    password: '',
    confirm_password: '',
    foto: null as File | null,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileChange(e);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nama_coworking || !formData.username || !formData.password) {
      setError('Nama space, username, dan password wajib diisi');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    try {
      await registerAdminSpace({
        nama_coworking: formData.nama_coworking,
        nama_pemilik: formData.nama_pemilik,
        alamat: formData.alamat,
        no_telepon: formData.no_telepon,
        username: formData.username,
        password: formData.password,
        foto: formData.foto,
      });

      router.push('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Pendaftaran gagal. Silakan coba lagi.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      
      {/* Background Mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/90 border border-slate-200/80 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Akses Pengelola Space</span>
            <h1 className="text-2xl font-black font-heading text-slate-900 mt-1">Registrasi Coworking Space</h1>
          </div>
          <Link href="/register" className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition">
            ← Ganti Tipe
          </Link>
        </div>

        {error && (
          <Alert message={error} type="error" dismissible />
        )}

        <Form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Data Coworking Space</h3>
            
            <FormRow cols={2}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Coworking Space *</label>
                <Input
                  name="nama_coworking"
                  type="text"
                  value={formData.nama_coworking}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: SpaceSync Jakarta"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Pemilik / Pengelola</label>
                <Input
                  name="nama_pemilik"
                  type="text"
                  value={formData.nama_pemilik}
                  onChange={handleChange}
                  placeholder="Nama penanggung jawab"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
              </div>
            </FormRow>

            <FormRow cols={2}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Space</label>
                <Input
                  name="alamat"
                  type="text"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Alamat lokasi space"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Telepon Space</label>
                <Input
                  name="no_telepon"
                  type="tel"
                  value={formData.no_telepon}
                  onChange={handleChange}
                  placeholder="0812xxxxxxx"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
              </div>
            </FormRow>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Akun Admin Space</h3>

            <FormRow cols={2}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Username Login *</label>
                <Input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Username admin"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimal 6 karakter"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
              </div>
            </FormRow>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Konfirmasi Password *</label>
              <Input
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                placeholder="Ulangi password Anda"
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <FileInput
              label="Foto / Logo Space (Opsional)"
              name="foto"
              accept="image/*"
              onChange={handlePhotoChange}
              preview={preview}
            />
          </div>

          <Button
            type="submit"
            variant="success"
            isLoading={isLoading}
            className="w-full py-4 text-base font-bold shadow-xl shadow-emerald-500/25"
            size="lg"
          >
            Selesaikan Pendaftaran Admin Space
          </Button>
        </Form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline">
              Login di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}


