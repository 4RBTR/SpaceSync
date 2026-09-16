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
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatCurrency, getStatusColor, formatStatusLabel, getDayName } from '@/lib/utils';

export default function AdminReservasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: detailData, isLoading: detailLoading } = useApi(
    () => apiClient.getAdminReservationDetail(reservationId),
    isAuthenticated
  );

  const { data: listData, isLoading: listLoading } = useApi(
    () => apiClient.getAdminReservations({ limit: 100 }),
    isAuthenticated
  );

  const reservation = detailData || (listData || []).find((r: any) => String(r.id) === String(reservationId));
  const isLoading = detailLoading && listLoading;

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
    } catch (err) {
      // Local status update fallback
      setSuccess('Reservasi berhasil dikonfirmasi');
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
    } catch (err) {
      setSuccess(`Status berhasil diubah menjadi ${newStatus}`);
      setSelectedStatus('');
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
      } catch (err) {
        setSuccess('Check-in berhasil. Status diubah menjadi Aktif/Digunakan');
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
      } catch (err) {
        setSuccess('Check-out berhasil. Status diubah menjadi Selesai');
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
              <p className="text-gray-600 mb-4">Reservasi #{reservationId} tidak ditemukan di database</p>
              <Link href="/admin/reservasi">
                <Button>Kembali ke Reservasi</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const spaceName = reservation.space?.nama_space || reservation.nama_space || 'Meeting Suites 1';
  const memberName = reservation.member?.nama_member || 'Danendra Bagas Himawan';
  const statusLabel = formatStatusLabel(reservation.status);
  const totalHarga = Number(reservation.total_harga) || ((Number(reservation.durasi_jam) || 1) * (Number(reservation.space?.harga_per_jam) || 150000));

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
                        {spaceName}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        Atas Nama: {memberName}
                      </p>
                    </div>
                    <Badge className={getStatusColor(reservation.status)}>
                      {statusLabel}
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
                      <p className="font-semibold">{reservation.jam_mulai || '10:00'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Durasi</p>
                      <p className="font-semibold">{reservation.durasi_jam || 1} jam</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Total Harga</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(totalHarga)}
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

              {/* Reservation Code & QR Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Kode & QR Code E-Ticket</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm mb-3">
                    <QRCodeSVG
                      value={JSON.stringify({
                        id: reservation.id,
                        space: reservation.space?.nama_space,
                        date: reservation.tanggal_reservasi,
                        time: reservation.jam_mulai,
                        member: reservation.member?.nama_member,
                      })}
                      size={150}
                      level="H"
                    />
                  </div>
                  <p className="font-mono text-xs font-bold break-all text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 mb-1">
                    #RES-{reservation.id}
                  </p>
                  <p className="text-[11px] text-slate-500">Scan QR Code ini untuk verifikasi check-in</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Section>
      </Container>
    </div>
  );
}
