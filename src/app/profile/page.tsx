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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [formData, setFormData] = useState({
    nama_member: '',
    instansi: '',
    no_telepon: '',
    alamat: '',
    foto: null as File | null,
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
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

      const finalFoto = fotoFilename || user?.foto || user?.foto_url || '';

      const payload: any = {
        nama_member: formData.nama_member,
        instansi: formData.instansi,
        no_telepon: formData.no_telepon,
        telp: formData.no_telepon,
        alamat: formData.alamat,
      };
      if (fotoFilename) payload.foto = fotoFilename;

      // Panggil API Backend updateProfile (PUT /api/auth/profile)
      try {
        await apiClient.updateProfile(payload);
      } catch (authErr) {
        console.warn('apiClient.updateProfile fallback:', authErr);
      }

      if (userRole === 'admin_space') {
        try {
          await apiClient.updateAdminProfile({
            nama_coworking: formData.nama_member,
            no_telepon: formData.no_telepon,
            telp: formData.no_telepon,
            alamat: formData.alamat,
            foto: fotoFilename || undefined,
          });
        } catch (err) {
          console.warn('API update admin profile warning:', err);
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.old_password || !passwordData.new_password) {
      setPasswordError('Password lama dan password baru wajib diisi.');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    try {
      setIsPasswordSubmitting(true);
      // Panggil API Backend updatePassword (PUT /api/auth/change-password)
      const res = await apiClient.updatePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        password_lama: passwordData.old_password,
        password_baru: passwordData.new_password,
      });

      if (res.status !== false) {
        setPasswordSuccess('Password Anda berhasil diperbarui!');
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        setShowPasswordForm(false);
      } else {
        setPasswordError(res.message || 'Gagal mengubah password.');
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengubah password.');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const displayName = user.nama_member || user.nama_coworking || user.username || 'User Pro';
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Container className="max-w-3xl">
        <Section title="Profil Saya" description="Kelola informasi pribadi dan pengaturan keamanan akun Anda">
          
          {success && <Alert type="success" message={success} dismissible className="mb-6" />}
          {error && <Alert type="error" message={error} dismissible className="mb-6" />}
          {passwordSuccess && <Alert type="success" message={passwordSuccess} dismissible className="mb-6" />}
          {passwordError && <Alert type="error" message={passwordError} dismissible className="mb-6" />}

          <Card className="mb-6">
            <CardContent>
              {/* Header Avatar */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg overflow-hidden flex-shrink-0 relative">
                  {preview && !imgError ? (
                    <img
                      src={preview}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                    {displayName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">@{user.username}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {userRole === 'member' ? 'Member SpaceSync' : 'Space Owner Admin'}
                  </span>
                </div>

                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    ✏️ Edit Profil
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
                <div className="space-y-6">
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

                  {/* Password Toggle Button */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Keamanan Akun</h4>
                      <p className="text-xs text-slate-500">Perbarui kata sandi login Anda</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                      {showPasswordForm ? 'Tutup Form Password' : '🔑 Ganti Password'}
                    </Button>
                  </div>

                  {/* Password Form */}
                  {showPasswordForm && (
                    <Form onSubmit={handlePasswordSubmit} className="space-y-4 p-4 bg-slate-100/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Password Lama *
                        </label>
                        <Input
                          name="old_password"
                          type="password"
                          value={passwordData.old_password}
                          onChange={handlePasswordChange}
                          required
                          placeholder="Masukkan password lama"
                        />
                      </div>
                      <FormRow cols={2}>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Password Baru *
                          </label>
                          <Input
                            name="new_password"
                            type="password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Password baru (min. 6 karakter)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Konfirmasi Password Baru *
                          </label>
                          <Input
                            name="confirm_password"
                            type="password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Ulangi password baru"
                          />
                        </div>
                      </FormRow>

                      <Button type="submit" isLoading={isPasswordSubmitting} className="w-full text-xs py-2">
                        Simpan Password Baru
                      </Button>
                    </Form>
                  )}

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
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
