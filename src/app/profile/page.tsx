'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient, uploadApi } from '@/lib/api';
import { Container, Card, CardContent, Section } from '@/components/Layout';
import { Input, Form, FormRow, FileInput } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { getInitials, getImageUrl } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, userRole, user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nama_member: '',
    instansi: '',
    no_telepon: '',
    alamat: '',
    foto: null as File | null,
  });
  const [preview, setPreview] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        nama_member: user.nama_member || user.nama_coworking || '',
        instansi: user.instansi || '',
        no_telepon: user.no_telepon || user.telp || '',
        alamat: user.alamat || '',
        foto: null,
      });
      const fotoVal = user?.foto || user?.foto_url;
      if (fotoVal && typeof fotoVal === 'string' && fotoVal !== 'null') {
        setPreview(getImageUrl(fotoVal, 'avatar'));
        setImgError(false);
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Memuat profil...</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, foto: file }));
      setImgError(false);

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
      let fotoFilename = '';
      if (formData.foto) {
        try {
          const uploadRes = await uploadApi.uploadImage(formData.foto, userRole === 'admin_space' ? 'spaces' : 'members');
          if (uploadRes.status && uploadRes.data) {
            fotoFilename = uploadRes.data.filename || uploadRes.data.url || '';
          }
        } catch (uploadErr) {
          console.warn('Failed to upload profile photo:', uploadErr);
        }
      }

      const memberId = user?.member?.id || user?.id_member || user?.id;
      const finalFoto = fotoFilename || user?.foto || user?.foto_url || '';

      // Panggil API Backend sesuai role agar data tersimpan di server DB
      if (userRole === 'admin_space') {
        const payload: any = {
          nama_coworking: formData.nama_member,
          no_telepon: formData.no_telepon,
          telp: formData.no_telepon,
          alamat: formData.alamat,
        };
        if (fotoFilename) payload.foto = fotoFilename;

        try {
          await apiClient.updateAdminProfile(payload);
        } catch (err) {
          console.warn('API update admin profile warning:', err);
        }
      } else if (memberId) {
        const payload: any = {
          nama_member: formData.nama_member,
          instansi: formData.instansi,
          no_telepon: formData.no_telepon,
          telp: formData.no_telepon,
          alamat: formData.alamat,
        };
        if (fotoFilename) payload.foto = fotoFilename;

        try {
          await apiClient.updateMemberProfile(memberId, payload);
        } catch (err) {
          console.warn('API update member profile warning:', err);
        }
      }

      const updatedUser = {
        ...user,
        nama_member: formData.nama_member,
        nama_coworking: formData.nama_member || user?.nama_coworking,
        instansi: formData.instansi,
        no_telepon: formData.no_telepon,
        telp: formData.no_telepon,
        alamat: formData.alamat,
        foto: finalFoto,
        foto_url: finalFoto,
      };

      if (setUser) setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));

      if (finalFoto) {
        setPreview(getImageUrl(finalFoto, 'avatar'));
        setImgError(false);
      }

      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat memperbarui profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = user.nama_member || user.nama_coworking || user.username || 'User';
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-950">
      <Container className="max-w-2xl">
        <Section title="Profil Saya" description="Kelola dan perbarui informasi data akun Anda">
          
          {success && <Alert type="success" message={success} dismissible className="mb-6" />}
          {error && <Alert type="error" message={error} dismissible className="mb-6" />}

          <Card>
            <CardContent>
              {/* Avatar & Name */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden flex-shrink-0 relative">
                  {preview && !imgError ? (
                    <img
                      src={preview}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="font-extrabold tracking-wider">{initials}</span>
                  )}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h2>
                  <p className="text-sm text-slate-500">@{user.username}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {userRole === 'admin_space' ? 'Admin Space Owner' : 'Member Pro'}
                  </span>
                </div>

                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    Edit Profil
                  </Button>
                )}
              </div>

              {/* View or Edit Form */}
              {isEditing ? (
                <Form onSubmit={handleSubmit} className="space-y-5">
                  <FormRow cols={2}>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Lengkap *
                      </label>
                      <Input
                        name="nama_member"
                        value={formData.nama_member}
                        onChange={handleChange}
                        required
                        placeholder="Nama Anda"
                      />
                    </div>
                    {userRole === 'member' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Instansi / Perusahaan
                        </label>
                        <Input
                          name="instansi"
                          value={formData.instansi}
                          onChange={handleChange}
                          placeholder="Nama instansi"
                        />
                      </div>
                    )}
                  </FormRow>

                  <FormRow cols={2}>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nomor Telepon
                      </label>
                      <Input
                        name="no_telepon"
                        type="tel"
                        value={formData.no_telepon}
                        onChange={handleChange}
                        placeholder="0812xxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Alamat Domisili
                      </label>
                      <Input
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        placeholder="Alamat Anda"
                      />
                    </div>
                  </FormRow>

                  <FileInput
                    label="Ganti Foto Profil (Opsional)"
                    name="foto"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    preview={preview}
                  />

                  <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button type="submit" isLoading={isSubmitting} className="flex-1">
                      Simpan Profil
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                      Batal
                    </Button>
                  </div>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</p>
                      <p className="text-slate-900 dark:text-white font-medium">{user.username}</p>
                    </div>
                    {user.no_telepon && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Telepon</p>
                        <p className="text-slate-900 dark:text-white font-medium">{user.no_telepon}</p>
                      </div>
                    )}
                    {user.instansi && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Instansi</p>
                        <p className="text-slate-900 dark:text-white font-medium">{user.instansi}</p>
                      </div>
                    )}
                    {user.alamat && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat</p>
                        <p className="text-slate-900 dark:text-white font-medium">{user.alamat}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                    <Button variant="outline" onClick={() => router.push(userRole === 'admin_space' ? '/admin/dashboard' : '/dashboard')}>
                      ← Kembali ke Dashboard
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

