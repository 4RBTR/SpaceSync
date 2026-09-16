'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient, uploadApi } from '@/lib/api';
import { Container, Card, Section } from '@/components/Layout';
import { Input, Form, FormRow, FileInput } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { getImageUrl } from '@/lib/utils';

export default function AdminEditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  const { isAuthenticated, userRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nama_member: '',
    email: '',
    no_telepon: '',
    instansi: '',
    username: '',
    alamat: '',
    foto: null as File | null,
  });
  const [preview, setPreview] = useState('');

  const { data: memberDetail, isLoading } = useApi(
    () => apiClient.getAdminMemberDetail(memberId),
    isAuthenticated && userRole === 'admin_space' && !!memberId
  );

  useEffect(() => {
    if (memberDetail) {
      setFormData({
        nama_member: memberDetail.nama_member || '',
        email: memberDetail.email || '',
        no_telepon: memberDetail.no_telepon || memberDetail.telp || '',
        instansi: memberDetail.instansi || '',
        username: memberDetail.username || '',
        alamat: memberDetail.alamat || '',
        foto: null,
      });
      if (memberDetail.foto_url || memberDetail.foto) {
        setPreview(memberDetail.foto_url ? memberDetail.foto_url.replace(/^http:\/\//, 'https://') : getImageUrl(memberDetail.foto, 'avatar'));
      }
    }
  }, [memberDetail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.nama_member) {
      setError('Nama member wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: any = {
        nama_member: formData.nama_member,
        email: formData.email,
        telp: formData.no_telepon,
        instansi: formData.instansi,
        alamat: formData.alamat,
      };
      if (formData.foto) {
        payload.foto = formData.foto;
      }

      const res = await apiClient.updateAdminMember(memberId, payload);

      if (res.status) {
        router.push('/admin/members');
      } else {
        setError(res.message || 'Gagal memperbarui data member.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengedit member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Memuat data member...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-950">
      <Container className="max-w-3xl">
        <Section title="Edit Member" description={`Perbarui informasi data member: ${memberDetail?.nama_member || memberId}`}>
          
          {error && <Alert type="error" message={error} dismissible className="mb-6" />}

          <Card>
            <Form onSubmit={handleSubmit} className="space-y-6">
              
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
                    placeholder="Nama lengkap member"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@domain.com"
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
                    type="tel"
                    value={formData.no_telepon}
                    onChange={handleChange}
                    placeholder="0812xxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Instansi / Perusahaan
                  </label>
                  <Input
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleChange}
                    placeholder="Kampus atau perusahaan"
                  />
                </div>
              </FormRow>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Member
                </label>
                <Input
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Alamat domisili"
                />
              </div>

              <FileInput
                label="Ganti Foto Profil (Opsional)"
                name="foto"
                accept="image/*"
                onChange={handlePhotoChange}
                preview={preview}
              />

              <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  Simpan Perubahan
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.push('/admin/members')}>
                  Batal
                </Button>
              </div>

            </Form>
          </Card>

        </Section>
      </Container>
    </div>
  );
}
