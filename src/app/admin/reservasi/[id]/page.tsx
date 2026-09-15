'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Select, Form } from '@/components/Form';
import { Button } from '@/components/Button';
import { Badge, Alert } from '@/components/Alert';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor, getDayName } from '@/lib/utils';

export default function AdminReservasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: reservation, isLoading, execute: refetch } = useApi(
    () => apiClient.getAdminReservationDetail(reservationId),
    isAuthenticated
  );

  const statuses = [
    { value: '', label: 'Pilih Status' },
    { value: 'Belum Dikonfirmasi', label: 'Belum Dikonfirmasi' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Aktif/Digunakan', label: 'Aktif/Digunakan' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Dibatalkan', label: 'Dibatalkan' },
  ];

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError('');
      await apiClient.confirmReservation(reservationId);
      setSuccess('Reservasi berhasil dikonfirmasi');
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengonfirmasi reservasi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!newStatus) return;
    try {
      setIsProcessing(true);
      setError('');
      await apiClient.updateReservationStatus(reservationId, newStatus);
      setSuccess(`Status berhasil diubah menjadi ${newStatus}`);
      setSelectedStatus('');
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async () => {
    if (confirm('Apakah member sudah datang? Lakukan check-in?')) {
      try {
        setIsProcessing(true);
        setError('');
        await apiClient.checkInReservation(reservationId);
        setSuccess('Check-in berhasil. Status diubah menjadi Aktif/Digunakan');
        refetch();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal melakukan check-in');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCheckOut = async () => {
    if (confirm('Apakah member sudah selesai? Lakukan check-out?')) {
      try {
        setIsProcessing(true);
        setError('');
        await apiClient.checkOutReservation(reservationId);
        setSuccess('Check-out berhasil. Status diubah menjadi Selesai');
        refetch();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal melakukan check-out');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <div className="text-center">
            <p className="text-gray-600">Memuat data reservasi...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Reservasi tidak ditemukan</p>
              <Link href="/admin/reservasi">
                <Button>Kembali ke Reservasi</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <Container className="max-w-3xl">
        <Section title="Kelola Reservasi">
          {error && <Alert message={error} type="error" className="mb-6" />}
          {success && <Alert message={success} type="success" className="mb-6" />}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        {reservation.space?.nama_space}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        {reservation.member?.nama_member}
                      </p>
                    </div>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Reservation Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pemesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Tanggal</p>
                      <p className="font-semibold">
                        {formatDate(reservation.tanggal_reservasi)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {getDayName(reservation.tanggal_reservasi)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Waktu Mulai</p>
                      <p className="font-semibold">{reservation.jam_mulai}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Durasi</p>
                      <p className="font-semibold">{reservation.durasi_jam} jam</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Total Harga</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(reservation.total_harga)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Member Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-semibold">
                        {reservation.member?.nama_member}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold">{reservation.member?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telepon:</span>
                      <span className="font-semibold">
                        {reservation.member?.no_telepon}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instansi:</span>
                      <span className="font-semibold">{reservation.member?.instansi}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Actions */}
            <div className="space-y-6">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Kelola Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reservation.status === 'Belum Dikonfirmasi' && (
                    <Button
                      onClick={handleConfirm}
                      isLoading={isProcessing}
                      className="w-full"
                    >
                      Konfirmasi Reservasi
                    </Button>
                  )}

                  {reservation.status === 'Disetujui' && (
                    <Button
                      onClick={handleCheckIn}
                      isLoading={isProcessing}
                      className="w-full"
                      variant="success"
                    >
                      Check-In Member
                    </Button>
                  )}

                  {reservation.status === 'Aktif/Digunakan' && (
                    <Button
                      onClick={handleCheckOut}
                      isLoading={isProcessing}
                      className="w-full"
                      variant="success"
                    >
                      Check-Out Member
                    </Button>
                  )}

                  {reservation.status !== 'Selesai' &&
                    reservation.status !== 'Dibatalkan' && (
                      <>
                        <div className="border-t border-gray-200 pt-4">
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Ubah Status Lainnya
                          </label>
                          <Select
                            options={statuses}
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                          />
                          {selectedStatus && (
                            <Button
                              onClick={() => handleStatusChange(selectedStatus)}
                              isLoading={isProcessing}
                              className="w-full mt-2"
                              variant="outline"
                            >
                              Ubah Status
                            </Button>
                          )}
                        </div>
                      </>
                    )}

                  <Link href="/admin/reservasi" className="block">
                    <Button variant="outline" className="w-full">
                      Kembali
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Reservation Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Kode Reservasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-xs font-bold break-all text-center p-3 bg-gray-100 rounded">
                    {reservation.id}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Section>
      </Container>
    </div>
  );
}
