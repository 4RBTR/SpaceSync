'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Input, Select } from '@/components/Form';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor, formatStatusLabel } from '@/lib/utils';

export default function AdminReservasiPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // QR Code Verification State
  const [qrInput, setQrInput] = useState('');
  const [qrError, setQrError] = useState('');
  const [qrSuccess, setQrSuccess] = useState('');

  const { data: reservations, isLoading, execute: refetch } = useApi(
    () =>
      apiClient.getAdminReservations({
        status: selectedStatus || undefined,
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
        limit: 50,
      }),
    isAuthenticated && userRole === 'admin_space'
  );

  const handleVerifyQR = (e: React.FormEvent) => {
    e.preventDefault();
    setQrError('');
    setQrSuccess('');

    if (!qrInput.trim()) return;

    let targetId = qrInput.trim();

    // Try parsing if QR content is JSON
    try {
      if (targetId.startsWith('{')) {
        const parsed = JSON.parse(targetId);
        if (parsed.id) targetId = String(parsed.id);
      }
    } catch (err) {
      // ignore json parse error
    }

    // Clean #RES- prefix if present
    targetId = targetId.replace(/#RES-/i, '').trim();

    const matched = reservations?.find(
      (r: any) => String(r.id) === targetId || String(r.id).includes(targetId)
    );

    if (matched) {
      setQrSuccess(`Reservasi #${matched.id} (${matched.member?.nama_member || 'Member'}) ditemukan! Pengalihan...`);
      setTimeout(() => {
        router.push(`/admin/reservasi/${matched.id}`);
      }, 800);
    } else if (targetId) {
      // Directly try navigating to that reservation ID
      router.push(`/admin/reservasi/${targetId}`);
    } else {
      setQrError('Format QR Code atau Kode Reservasi tidak valid.');
    }
  };

  const statuses = [
    { value: '', label: 'Semua Status' },
    { value: 'Belum Dikonfirmasi', label: 'Belum Dikonfirmasi' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Aktif/Digunakan', label: 'Aktif/Digunakan' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Dibatalkan', label: 'Dibatalkan' },
  ];

  const months = [
    { value: '', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Manajemen Reservasi" description="Kelola dan verifikasi E-Ticket reservasi ruangan">
          
          {/* QR Code Verification Section */}
          <Card className="mb-6 border-l-4 border-l-indigo-600 bg-gradient-to-r from-indigo-50/40 via-white to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Verifikasi QR Code / E-Ticket Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyQR} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scan / Tempel Hasil QR Code E-Ticket
                  </label>
                  <Input
                    placeholder="Scan QR Code atau masukkan Kode Reservasi (contoh: 270)... font-mono"
                    value={qrInput}
                    onChange={(e) => {
                      setQrInput(e.target.value);
                      if (qrError) setQrError('');
                    }}
                    className="font-mono text-sm"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto shrink-0 mb-4 sm:mb-0">
                  Verifikasi QR
                </Button>
              </form>
              {qrError && <p className="text-xs text-red-600 font-semibold mt-1">{qrError}</p>}
              {qrSuccess && <p className="text-xs text-emerald-600 font-bold mt-1">{qrSuccess}</p>}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Select
                label="Status"
                options={statuses}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
              <Select
                label="Bulan"
                options={months}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
              <Input
                label="Tahun"
                type="number"
                placeholder="Semua Tahun"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <div className="flex items-end mb-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStatus('');
                    setMonth('');
                    setYear('');
                  }}
                  className="w-full"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          </Card>

          {/* Reservations Table */}
          <Card>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Memuat data reservasi...</p>
              </div>
            ) : reservations && reservations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        Kode Reservasi
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        Member
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        Ruangan
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        Tanggal
                      </th>
                      <th className="text-center px-6 py-3 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-right px-6 py-3 font-semibold text-gray-900">
                        Total
                      </th>
                      <th className="text-center px-6 py-3 font-semibold text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation: any) => (
                      <tr
                        key={reservation.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-mono text-sm font-semibold text-blue-600">
                          #RES-{reservation.id}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {reservation.member?.nama_member}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {reservation.space?.nama_space || reservation.nama_space || 'Meeting Suites 1'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium text-sm">
                          {formatDate(reservation.tanggal_reservasi)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={getStatusColor(reservation.status)}>
                            {formatStatusLabel(reservation.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                          {formatCurrency(
                            Number(reservation.total_harga) ||
                            ((Number(reservation.durasi_jam) || 1) * (Number(reservation.space?.harga_per_jam) || 150000))
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/admin/reservasi/${reservation.id}`}>
                            <Button size="sm" variant="outline">
                              Manage
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Tidak ada data reservasi untuk periode ini</p>
              </div>
            )}
          </Card>
        </Section>
      </Container>
    </div>
  );
}
