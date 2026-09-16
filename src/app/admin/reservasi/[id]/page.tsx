'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Select } from '@/components/Form';
import { Button } from '@/components/Button';
import { Badge, Alert } from '@/components/Alert';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatCurrency, getStatusColor, formatStatusLabel, getDayName, getReservationPrice, getReservationSpace } from '@/lib/utils';

export default function AdminReservasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: detailData, isLoading: detailLoading, execute: refetchDetail } = useApi(
    () => apiClient.getAdminReservationDetail(reservationId),
    isAuthenticated
  );

  const { data: listData, isLoading: listLoading, execute: refetchList } = useApi(
    () => apiClient.getAdminReservations({ limit: 100 }),
    isAuthenticated
  );

  const reservation = detailData || (listData || []).find((r: any) => String(r.id) === String(reservationId));
  const isLoading = detailLoading && listLoading;

  const statuses = [
    { value: '', label: 'Pilih Status Status' },
    { value: 'belum_dikonfirm', label: 'Belum Dikonfirmasi' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'aktif', label: 'Aktif/Digunakan' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
  ];

  const refreshData = () => {
    refetchDetail();
    refetchList();
  };

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError('');
      const res = await apiClient.confirmReservation(reservationId);
      if (res.status) {
        setSuccess('Reservasi berhasil dikonfirmasi (Disetujui)');
        refreshData();
      } else {
        setError(res.message || 'Gagal mengonfirmasi reservasi');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengonfirmasi reservasi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!newStatus) return;
    try {
      setIsProcessing(true);
      setError('');
      const res = await apiClient.updateReservationStatus(reservationId, newStatus);
      if (res.status) {
        setSuccess(`Status reservasi berhasil diubah`);
        setSelectedStatus('');
        refreshData();
      } else {
        setError(res.message || 'Gagal mengubah status');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async () => {
    if (confirm('Apakah member sudah datang? Lakukan check-in?')) {
      try {
        setIsProcessing(true);
        setError('');
        const res = await apiClient.checkInReservation(reservationId);
        if (res.status) {
          setSuccess('Check-in berhasil! Status diubah menjadi Aktif/Digunakan.');
          refreshData();
        } else {
          setError(res.message || 'Gagal melakukan check-in');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal melakukan check-in');
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
        const res = await apiClient.checkOutReservation(reservationId);
        if (res.status) {
          setSuccess('Check-out berhasil! Status diubah menjadi Selesai.');
          refreshData();
        } else {
          setError(res.message || 'Gagal melakukan check-out');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal melakukan check-out');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <div className="text-center py-12">
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

  const spaceObj = getReservationSpace(reservation);
  const spaceName = spaceObj?.nama_space || reservation.nama_space || 'Meeting Room';
  const memberName = reservation.member?.nama_member || 'Member SpaceSync';
  const statusLabel = formatStatusLabel(reservation.status);
  const totalHarga = getReservationPrice(reservation);
  const isPending = reservation.status === 'belum_dikonfirm' || statusLabel === 'Belum Dikonfirmasi';
  const isApproved = reservation.status === 'disetujui' || statusLabel === 'Disetujui';
  const isActive = reservation.status === 'aktif' || statusLabel === 'Aktif/Digunakan';
  const isCompleted = reservation.status === 'selesai' || statusLabel === 'Selesai';
  const isCancelled = reservation.status === 'dibatalkan' || statusLabel === 'Dibatalkan';

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
                        Atas Nama: <span className="font-semibold text-slate-800">{memberName}</span>
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
                      <p className="font-semibold text-slate-900">
                        {formatDate(reservation.tanggal_reservasi)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {getDayName(reservation.tanggal_reservasi)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Waktu Mulai</p>
                      <p className="font-semibold text-slate-900">{reservation.jam_mulai || '10:00'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Durasi</p>
                      <p className="font-semibold text-slate-900">{reservation.durasi_jam || 1} jam</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Total Harga</p>
                      <p className="font-bold text-lg text-emerald-600">
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
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-gray-600">Nama Lengkap:</span>
                      <span className="font-semibold text-slate-900">
                        {reservation.member?.nama_member || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-gray-600">No. Telepon / WhatsApp:</span>
                      <span className="font-semibold text-slate-900">
                        {reservation.member?.telp || reservation.member?.no_telepon || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-gray-600">Instansi / Organisasi:</span>
                      <span className="font-semibold text-slate-900">{reservation.member?.instansi || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alamat:</span>
                      <span className="font-semibold text-slate-900">{reservation.member?.alamat || '-'}</span>
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
                  <CardTitle>Kontrol Status Reservasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isPending && (
                    <Button
                      onClick={handleConfirm}
                      isLoading={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Konfirmasi (Setujui)
                    </Button>
                  )}

                  {isApproved && (
                    <Button
                      onClick={handleCheckIn}
                      isLoading={isProcessing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Proses Check-In Member
                    </Button>
                  )}

                  {isActive && (
                    <Button
                      onClick={handleCheckOut}
                      isLoading={isProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Proses Check-Out Member
                    </Button>
                  )}

                  {!isCompleted && !isCancelled && (
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Ubah Status Manual
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
                          Terapkan Perubahan
                        </Button>
                      )}
                    </div>
                  )}

                  <Link href="/admin/reservasi" className="block pt-2">
                    <Button variant="outline" className="w-full">
                      Kembali ke Daftar
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Reservation Code & QR Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Kode & QR Code E-Ticket</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm mb-3">
                    <QRCodeSVG
                      value={JSON.stringify({
                        id: reservation.id,
                        space: spaceName,
                        date: reservation.tanggal_reservasi,
                        time: reservation.jam_mulai,
                        member: memberName,
                      })}
                      size={160}
                      level="H"
                    />
                  </div>
                  <p className="font-mono text-sm font-bold break-all text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 mb-1">
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
