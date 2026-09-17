'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Input, Form, FormRow, Select } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { formatCurrency, calculateTotalPrice, formatDate } from '@/lib/utils';

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/booking/${spaceId}`);
    }
  }, [isAuthenticated, authLoading, router, spaceId]);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tanggal_reservasi: '',
    jam_mulai: '',
    durasi_jam: 1,
    id_diskon: '',
  });

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const { data: space } = useApi(() => apiClient.getSpaceDetail(spaceId), isAuthenticated);
  const { data: discounts } = useApi(() => apiClient.getActiveDiskon(), isAuthenticated);

  const { data: diskonDetail } = useApi(
    () => apiClient.getDiskonDetail(formData.id_diskon),
    isAuthenticated && !!formData.id_diskon
  );

  const selectedDiscount = discounts?.find((d: any) => String(d.id) === String(formData.id_diskon));
  const totalPrice = calculateTotalPrice(
    space?.harga_per_jam || 0,
    parseInt(formData.durasi_jam.toString()),
    selectedDiscount?.persentase_diskon
  );

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoInput.trim()) return;

    const trimmed = promoInput.trim();
    try {
      const checkRes = await apiClient.checkDiskonCode(trimmed);
      if (checkRes.status && checkRes.data) {
        const matchedId = checkRes.data.id || checkRes.data.id_diskon || checkRes.data.id_diskon_space;
        setFormData((prev) => ({ ...prev, id_diskon: String(matchedId) }));
        setPromoError('');
      } else {
        throw new Error(checkRes.message || 'Kode promo tidak valid');
      }
    } catch (e: any) {
      const matched = discounts?.find(
        (d: any) =>
          (d.nama_diskon && String(d.nama_diskon).toLowerCase() === trimmed.toLowerCase()) ||
          (d.kode_diskon && String(d.kode_diskon).toLowerCase() === trimmed.toLowerCase()) ||
          (d.kode && String(d.kode).toLowerCase() === trimmed.toLowerCase())
      );

      if (matched) {
        setFormData((prev) => ({ ...prev, id_diskon: String(matched.id) }));
        setPromoError('');
      } else {
        setFormData((prev) => ({ ...prev, id_diskon: '' }));
        setPromoError(e.message || 'Kode promo tidak valid atau telah kadaluarsa');
      }
    }
  };

  const handleRemovePromo = () => {
    setFormData((prev) => ({ ...prev, id_diskon: '' }));
    setPromoInput('');
    setPromoError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durasi_jam' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.tanggal_reservasi || !formData.jam_mulai || !formData.durasi_jam) {
      setError('Semua field wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      // Cek ketersediaan jam & tanggal via API getSpaceAvailability
      try {
        const availRes = await apiClient.getSpaceAvailability(formData.tanggal_reservasi, formData.jam_mulai);
        if (availRes && availRes.status === false) {
          setError(availRes.message || 'Ruangan tidak tersedia pada jam/tanggal pilihan Anda.');
          setIsSubmitting(false);
          return;
        }
      } catch (availErr) {
        console.warn('getSpaceAvailability check warning:', availErr);
      }

      const response = await apiClient.createReservation({
        id_space: spaceId,
        tanggal_reservasi: formData.tanggal_reservasi,
        jam_mulai: formData.jam_mulai,
        durasi_jam: formData.durasi_jam,
        id_diskon: formData.id_diskon || undefined,
      });

      if (response.status) {
        router.push(`/reservasi/${response.data.id}`);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking gagal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <Container className="max-w-4xl">
        <Section title="Pesan Ruangan">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Pemesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && <Alert message={error} type="error" className="mb-6" />}

                  <Form onSubmit={handleSubmit}>
                    <FormRow cols={2}>
                      <Input
                        label="Tanggal Reservasi"
                        name="tanggal_reservasi"
                        type="date"
                        value={formData.tanggal_reservasi}
                        onChange={handleChange}
                        required
                        min={formatDate(new Date())}
                      />

                      <Input
                        label="Jam Mulai"
                        name="jam_mulai"
                        type="time"
                        value={formData.jam_mulai}
                        onChange={handleChange}
                        required
                      />
                    </FormRow>

                    <FormRow cols={2}>
                      <Input
                        label="Durasi (Jam)"
                        name="durasi_jam"
                        type="number"
                        min="1"
                        max="24"
                        value={formData.durasi_jam}
                        onChange={handleChange}
                        required
                      />

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Kode Promo (Opsional)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Masukkan kode..."
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value);
                              if (promoError) setPromoError('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyPromo();
                              }
                            }}
                            disabled={!!selectedDiscount}
                            className="flex-1 px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-slate-100 disabled:text-slate-500 uppercase font-mono"
                          />
                          {selectedDiscount ? (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleRemovePromo}
                              className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                            >
                              Hapus
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={handleApplyPromo}
                              disabled={!promoInput.trim()}
                              className="shrink-0"
                            >
                              Terapkan
                            </Button>
                          )}
                        </div>
                        {promoError && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium">{promoError}</p>
                        )}
                        {selectedDiscount && (
                          <p className="text-emerald-600 text-xs mt-1.5 font-semibold flex items-center gap-1">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Promo &quot;{selectedDiscount.nama_diskon}&quot; aktif (Diskon {selectedDiscount.persentase_diskon}%)
                          </p>
                        )}
                      </div>
                    </FormRow>

                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      Konfirmasi Pemesanan
                    </Button>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Space Info */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">Ruangan</p>
                  <p className="font-bold text-lg text-gray-900">{space?.nama_space}</p>
                  <p className="text-sm text-gray-600">{space?.tipe_space}</p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Harga/Jam:</span>
                    <span className="font-semibold">
                      {formatCurrency(space?.harga_per_jam || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Durasi:</span>
                    <span className="font-semibold">{formData.durasi_jam} jam</span>
                  </div>
                  {selectedDiscount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon ({selectedDiscount.persentase_diskon}%):</span>
                      <span className="font-semibold">
                        -{formatCurrency(
                          (space?.harga_per_jam || 0) *
                            formData.durasi_jam *
                            (selectedDiscount.persentase_diskon / 100)
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-600 text-sm mb-1">Total Harga</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(totalPrice)}
                  </p>
                </div>

                {/* Facilities */}
                {space?.fasilitas && (
                  <div>
                    <p className="text-gray-600 text-sm mb-2 font-semibold">Fasilitas:</p>
                    <ul className="space-y-1">
                      {space.fasilitas.split(',').map((fac: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {fac.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Section>
      </Container>
    </div>
  );
}
