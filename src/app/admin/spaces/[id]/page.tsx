'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient, uploadApi } from '@/lib/api';
import { Container, Card, Section } from '@/components/Layout';
import { Input, Form, FormRow, TextArea, Select, FileInput } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { getImageUrl } from '@/lib/utils';

export default function AdminEditSpacePage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.id as string;
  const { isAuthenticated, userRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nama_space: '',
    tipe_space: '',
    harga_per_jam: '',
    kapasitas: '',
    fasilitas: '',
    deskripsi: '',
    foto: null as File | null,
  });
  const [preview, setPreview] = useState('');

  const { data: spaceDetail, isLoading } = useApi(
    () => apiClient.getAdminSpaceDetail(spaceId),
    isAuthenticated && userRole === 'admin_space' && !!spaceId
  );

  const { data: spaceTypes } = useApi(() => apiClient.getSpaceTypes(), true);

  const defaultTypes = [
    { value: 'desk', label: 'Personal Desk' },
    { value: 'meeting_room', label: 'Meeting Room' },
    { value: 'private_office', label: 'Private Office' },
  ];

  const typeOptions = (Array.isArray(spaceTypes) && spaceTypes.length > 0)
    ? spaceTypes.map((t: any) => {
        if (typeof t === 'string') return { value: t, label: t };
        const val = t.value || t.tipe || t.tipe_space || t.id || t.name;
        const lbl = t.label || t.nama || t.tipe_space || t.nama_tipe || t.name || val;
        return { value: String(val), label: String(lbl) };
      })
    : defaultTypes;

  useEffect(() => {
    if (spaceDetail) {
      setFormData({
        nama_space: spaceDetail.nama_space || '',
        tipe_space: spaceDetail.tipe || spaceDetail.tipe_space || '',
        harga_per_jam: spaceDetail.harga_per_jam?.toString() || '',
        kapasitas: spaceDetail.kapasitas?.toString() || '',
        fasilitas: spaceDetail.fasilitas || '',
        deskripsi: spaceDetail.deskripsi || '',
        foto: null,
      });
      if (spaceDetail.foto_url || spaceDetail.foto) {
        setPreview(getImageUrl(spaceDetail.foto_url || spaceDetail.foto, 'space'));
      }
    }
  }, [spaceDetail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!formData.nama_space || !formData.tipe_space || !formData.harga_per_jam || !formData.kapasitas) {
      setError('Nama ruangan, tipe, harga, dan kapasitas wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: any = {
        nama_space: formData.nama_space,
        tipe: formData.tipe_space,
        harga_per_jam: Number(formData.harga_per_jam),
        kapasitas: Number(formData.kapasitas),
        deskripsi: formData.fasilitas
          ? `${formData.deskripsi}\nFasilitas: ${formData.fasilitas}`
          : (formData.deskripsi || 'Ruangan coworking space'),
      };
      if (formData.foto) {
        payload.foto = formData.foto;
      }

      const res = await apiClient.updateAdminSpace(spaceId, payload);

      if (res.status) {
        router.push('/admin/spaces');
      } else {
        setError(res.message || 'Gagal memperbarui data ruangan.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengedit ruangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Memuat data ruangan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-950">
      <Container className="max-w-3xl">
        <Section title="Edit Ruangan" description={`Perbarui informasi untuk ruangan: ${spaceDetail?.nama_space || spaceId}`}>
          
          {error && <Alert type="error" message={error} dismissible className="mb-6" />}

          <Card>
            <Form onSubmit={handleSubmit} className="space-y-6">
              
              <FormRow cols={2}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Ruangan *
                  </label>
                  <Input
                    name="nama_space"
                    value={formData.nama_space}
                    onChange={handleChange}
                    required
                    placeholder="Nama ruangan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Ruangan *
                  </label>
                  <Select
                    name="tipe_space"
                    options={typeOptions}
                    value={formData.tipe_space}
                    onChange={handleChange}
                    required
                  />
                </div>
              </FormRow>

              <FormRow cols={2}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Harga Sewa Per Jam (IDR) *
                  </label>
                  <Input
                    name="harga_per_jam"
                    type="number"
                    min="0"
                    value={formData.harga_per_jam}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kapasitas (Orang) *
                  </label>
                  <Input
                    name="kapasitas"
                    type="number"
                    min="1"
                    value={formData.kapasitas}
                    onChange={handleChange}
                    required
                  />
                </div>
              </FormRow>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fasilitas
                </label>
                <Input
                  name="fasilitas"
                  value={formData.fasilitas}
                  onChange={handleChange}
                  placeholder="Fasilitas ruangan..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Lengkap
                </label>
                <TextArea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Deskripsi ruangan..."
                />
              </div>

              <FileInput
                label="Ganti Foto Ruangan (Opsional)"
                name="foto"
                accept="image/*"
                onChange={handlePhotoChange}
                preview={preview}
              />

              <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  Simpan Perubahan
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.push('/admin/spaces')}>
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
