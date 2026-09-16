'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, Section } from '@/components/Layout';
import { Input, Form, FormRow } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { formatDate } from '@/lib/utils';

export default function AdminEditPromoPage() {
  const router = useRouter();
  const params = useParams();
  const diskonId = params.id as string;
  const { isAuthenticated, userRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nama_diskon: '',
    kode_diskon: '',
    persentase_diskon: '',
    tanggal_mulai: '',
    tanggal_akhir: '',
  });

  const { data: promoDetail, isLoading } = useApi(
    () => apiClient.getAdminDiskonDetail(diskonId),
    isAuthenticated && userRole === 'admin_space' && !!diskonId
  );

  useEffect(() => {
    if (promoDetail) {
      setFormData({
        nama_diskon: promoDetail.nama_diskon || '',
        kode_diskon: promoDetail.kode_diskon || '',
        persentase_diskon: promoDetail.persentase_diskon?.toString() || '',
        tanggal_mulai: (promoDetail.tanggal_awal || promoDetail.tanggal_mulai) ? formatDate(promoDetail.tanggal_awal || promoDetail.tanggal_mulai) : '',
        tanggal_akhir: promoDetail.tanggal_akhir ? formatDate(promoDetail.tanggal_akhir) : '',
      });
    }
  }, [promoDetail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nama_diskon || !formData.persentase_diskon || !formData.tanggal_mulai || !formData.tanggal_akhir) {
      setError('Nama promo, persentase, dan tanggal wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.updateAdminDiskon(diskonId, {
        nama_diskon: (formData.kode_diskon || formData.nama_diskon).toUpperCase().replace(/\s+/g, ''),
        persentase_diskon: Number(formData.persentase_diskon),
        tanggal_awal: new Date(`${formData.tanggal_mulai}T00:00:00`).toISOString(),
        tanggal_akhir: new Date(`${formData.tanggal_akhir}T23:59:59`).toISOString(),
      });

      if (res.status) {
        router.push('/admin/promo');
      } else {
        setError(res.message || 'Gagal memperbarui voucher promo.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengedit promo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Memuat data promo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-950">
      <Container className="max-w-2xl">
        <Section title="Edit Voucher Promo" description={`Perbarui promo: ${promoDetail?.nama_diskon || diskonId}`}>
          
          {error && <Alert type="error" message={error} dismissible className="mb-6" />}

          <Card>
            <Form onSubmit={handleSubmit} className="space-y-6">
              
              <FormRow cols={2}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Promo *
                  </label>
                  <Input
                    name="nama_diskon"
                    value={formData.nama_diskon}
                    onChange={handleChange}
                    required
                    placeholder="Nama promo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Voucher
                  </label>
                  <Input
                    name="kode_diskon"
                    value={formData.kode_diskon}
                    onChange={handleChange}
                    placeholder="Kode promo"
                    className="font-mono uppercase"
                  />
                </div>
              </FormRow>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Persentase Diskon (%) *
                </label>
                <Input
                  name="persentase_diskon"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.persentase_diskon}
                  onChange={handleChange}
                  required
                />
              </div>

              <FormRow cols={2}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Mulai *
                  </label>
                  <Input
                    name="tanggal_mulai"
                    type="date"
                    value={formData.tanggal_mulai}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Berakhir *
                  </label>
                  <Input
                    name="tanggal_akhir"
                    type="date"
                    value={formData.tanggal_akhir}
                    onChange={handleChange}
                    required
                  />
                </div>
              </FormRow>

              <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  Simpan Perubahan
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.push('/admin/promo')}>
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
