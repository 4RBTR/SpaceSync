'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardContent, Section } from '@/components/Layout';
import { Input, Form, FormRow, TextArea, FileInput } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { getInitials, getImageUrl } from '@/lib/utils';

export default function AdminProfilePage() {
  const router = useRouter();
  const { isAuthenticated, userRole, user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nama_coworking: '',
    nama_pemilik: '',
    alamat: '',
    no_telepon: '',
    deskripsi: '',
    foto: null as File | null,
  });
  const [preview, setPreview] = useState('');

  const { data: profile, isLoading, execute: refetchProfile } = useApi(
    () => apiClient.getAdminProfile(),
    isAuthenticated && userRole === 'admin_space'
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        nama_coworking: profile.nama_coworking || user?.nama_coworking || '',
        nama_pemilik: profile.nama_pemilik || user?.nama_pemilik || '',
        alamat: profile.alamat || user?.alamat || '',
        no_telepon: profile.no_telepon || profile.telp || user?.no_telepon || '',
        deskripsi: profile.deskripsi || '',
        foto: null,
      });
      if (profile.foto || user?.foto) {
        setPreview(getImageUrl(profile.foto || user?.foto));
      }
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, foto: file }));
      
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
    setSuccess('');

    try {
      setIsSubmitting(true);
      const res = await apiClient.updateAdminProfile(formData);
      
      if (res.status) {
        setSuccess('Profil Admin Coworking Space berhasil diperbarui!');
        setIsEditing(false);
        refetchProfile();
        
        // Update user state di Auth Context
        if (setUser && user) {
          const updatedUser = {
            ...user,
            nama_coworking: formData.nama_coworking,
            nama_pemilik: formData.nama_pemilik,
            no_telepon: formData.no_telepon,
            alamat: formData.alamat,
          };
          setUser(updatedUser);
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
        }
      } else {
        setError(res.message || 'Gagal memperbarui profil.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Memuat profil pengelola space...</p>
      </div>
    );
  }

  const spaceName = profile?.nama_coworking || user?.nama_coworking || 'Space Owner';
  const ownerName = profile?.nama_pemilik || user?.nama_pemilik || 'Pemilik Space';
  const initials = getInitials(spaceName);

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-950">
      <Container className="max-w-3xl">
        <Section title="Profil Admin Space" description="Kelola identitas dan informasi lokasi coworking space Anda">
          
          {success && <Alert type="success" message={success} dismissible className="mb-6" />}
          {error && <Alert type="error" message={error} dismissible className="mb-6" />}

          <Card>
            <CardContent>
              {/* Header Avatar & Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden flex-shrink-0">
                  {preview ? (
                    <img src={preview} alt={spaceName} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="text-center sm:text-left flex-1 space-y-1">
                  <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                    {spaceName}
                  </h2>
                  <p className="text-sm font-medium text-slate-500">Pemilik: {ownerName}</p>
                  <p className="text-xs text-slate-400">@{user?.username}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Space Owner Authorized
                  </span>
                </div>

                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    Edit Profil
                  </Button>
                )}
              </div>

              {/* View / Edit Mode */}
              {isEditing ? (
                <Form onSubmit={handleSubmit} className="space-y-5">
                  <FormRow cols={2}>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Coworking Space *
                      </label>
                      <Input
                        name="nama_coworking"
                        value={formData.nama_coworking}
                        onChange={handleChange}
                        required
                        placeholder="Nama space Anda"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Pemilik / Pengelola
                      </label>
                      <Input
                        name="nama_pemilik"
                        value={formData.nama_pemilik}
                        onChange={handleChange}
                        placeholder="Nama penanggung jawab"
                      />
                    </div>
                  </FormRow>

                  <FormRow cols={2}>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nomor Telepon
                      </label>
                      <Input
                        name="no_telepon"
                        value={formData.no_telepon}
                        onChange={handleChange}
                        placeholder="0812xxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Alamat Space
                      </label>
                      <Input
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        placeholder="Alamat lokasi"
                      />
                    </div>
                  </FormRow>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deskripsi Space
                    </label>
                    <TextArea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Jelaskan mengenai coworking space Anda..."
                    />
                  </div>

                  <FileInput
                    label="Upload Foto Logo / Space Baru"
                    name="foto"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    preview={preview}
                  />

                  <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button type="submit" isLoading={isSubmitting} className="flex-1">
                      Simpan Perubahan
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                      Batal
                    </Button>
                  </div>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Coworking</p>
                      <p className="text-slate-900 dark:text-white font-medium">{spaceName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Penanggung Jawab</p>
                      <p className="text-slate-900 dark:text-white font-medium">{ownerName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Telepon</p>
                      <p className="text-slate-900 dark:text-white font-medium">{profile?.no_telepon || profile?.telp || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat Space</p>
                      <p className="text-slate-900 dark:text-white font-medium">{profile?.alamat || '-'}</p>
                    </div>
                  </div>

                  {profile?.deskripsi && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi Space</p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{profile.deskripsi}</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
                      ← Kembali ke Overview
                    </Button>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

        </Section>
      </Container>
    </div>
  );
}
