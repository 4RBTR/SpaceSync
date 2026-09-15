'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Select } from '@/components/Form';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

export default function ReservasiPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/reservasi');
    }
  }, [isAuthenticated, authLoading, router]);

  const { data: reservations, isLoading } = useApi(
    () => apiClient.getMyReservations(),
    isAuthenticated
  );

  const filteredReservations =
    selectedStatus
      ? reservations?.filter((r: any) => r.status === selectedStatus)
      : reservations || [];

  const statuses = [
    { value: '', label: 'Semua Status' },
    { value: 'Belum Dikonfirmasi', label: 'Belum Dikonfirmasi' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Aktif/Digunakan', label: 'Aktif/Digunakan' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section
          title="Reservasi Saya"
          description="Kelola semua reservasi ruangan Anda"
        >
          {/* Filter */}
          <Card className="mb-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Select
                  label="Filter Status"
                  options={statuses}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedStatus('')}
              >
                Reset
              </Button>
            </div>
          </Card>

          {/* Reservations List */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Memuat data reservasi...</p>
            </div>
          ) : filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map((reservation: any) => (
                <Card key={reservation.id} className="hover:shadow-lg transition">
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.space?.nama_space}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {reservation.space?.tipe_space}
                          </p>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Tanggal</p>
                          <p className="font-semibold">
                            {formatDate(reservation.tanggal_reservasi)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Waktu</p>
                          <p className="font-semibold">
                            {reservation.jam_mulai} - {reservation.durasi_jam}j
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Harga</p>
                          <p className="font-semibold">
                            {formatCurrency(reservation.total_harga)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Kode Reservasi</p>
                          <p className="font-semibold font-mono text-xs">
                            {reservation.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/reservasi/${reservation.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          Detail
                        </Button>
                      </Link>
                      {reservation.status !== 'Dibatalkan' &&
                        reservation.status !== 'Selesai' && (
                          <Link href={`/reservasi/${reservation.id}/e-ticket`}>
                            <Button size="sm" className="w-full">
                              E-Ticket
                            </Button>
                          </Link>
                        )}
                      {reservation.status === 'Belum Dikonfirmasi' && (
                        <Button
                          size="sm"
                          variant="danger"
                          className="w-full"
                          onClick={async () => {
                            if (
                              confirm(
                                'Apakah Anda yakin ingin membatalkan reservasi ini?'
                              )
                            ) {
                              try {
                                await apiClient.cancelReservation(reservation.id);
                                window.location.reload();
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                        >
                          Batalkan
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  {selectedStatus
                    ? `Tidak ada reservasi dengan status "${selectedStatus}"`
                    : 'Anda belum memiliki reservasi'}
                </p>
                <Link href="/spaces">
                  <Button>Cari Ruangan</Button>
                </Link>
              </div>
            </Card>
          )}
        </Section>
      </Container>
    </div>
  );
}
