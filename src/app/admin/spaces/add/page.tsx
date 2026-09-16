'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient, uploadApi } from '@/lib/api';
import { Container, Card, Section } from '@/components/Layout';
import { Input, Form, FormRow, TextArea, Select, FileInput } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';

export default function AdminAddSpacePage() {
  const router = useRouter();
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
    if (!isAuthenticated || userRole !== 'admin_space') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

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

      let fotoUrl = '';
      if (formData.foto) {
        const uploadRes = await uploadApi.uploadImage(formData.foto, 'spaces');
        if (uploadRes.status && uploadRes.data) {
          fotoUrl = uploadRes.data.url || uploadRes.data.path || uploadRes.data.filename || uploadRes.data.fileName || (typeof uploadRes.data === 'string' ? uploadRes.data : '');
        }
      }

      const payload: any = {
        nama_space: formData.nama_space,
        tipe: formData.tipe_space,
        harga_per_jam: Number(formData.harga_per_jam),
        kapasitas: Number(formData.kapasitas),
        deskripsi: formData.fasilitas
          ? `${formData.deskripsi}\nFasilitas: ${formData.fasilitas}`
          : (formData.deskripsi || 'Ruangan coworking space'),
      };
      if (fotoUrl) {
        payload.foto = fotoUrl;
      }

      const res = await apiClient.createAdminSpace(payload);

      if (res.status) {
        router.push('/admin/spaces');
      } else {
        setError(res.message || 'Gagal menambahkan ruangan baru.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan ruangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-950">
      <Container className="max-w-3xl">
        <Section title="Tambah Ruangan Baru" description="Isi data rincian ruangan coworking space Anda">
          
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
                    placeholder="Contoh: Executive Meeting Suite 01"
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
                    placeholder="Contoh: 150000"
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
                    placeholder="Contoh: 10"
                  />
                </div>
              </FormRow>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fasilitas (Pisahkan dengan koma)
                </label>
                <Input
                  name="fasilitas"
                  value={formData.fasilitas}
                  onChange={handleChange}
                  placeholder="Contoh: High-Speed WiFi, Projector, Whiteboard, Coffee & Tea"
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
                  placeholder="Jelaskan mengenai keunggulan dan spesifikasi ruangan ini..."
                />
              </div>

              <FileInput
                label="Foto Ruangan (Opsional)"
                name="foto"
                accept="image/*"
                onChange={handlePhotoChange}
                preview={preview}
              />

              <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  Simpan & Publikasi Ruangan
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
