'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Input, Select } from '@/components/Form';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

export default function AdminReservasiPage() {
  const { isAuthenticated, userRole } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

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
        <Section title="Manajemen Reservasi" description="Kelola semua reservasi ruangan">
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
              <div className="flex items-end">
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
                          {reservation.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {reservation.member?.nama_member}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {reservation.space?.nama_space}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(reservation.tanggal_reservasi)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={getStatusColor(reservation.status)}>
                            {reservation.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          {formatCurrency(reservation.total_harga)}
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
