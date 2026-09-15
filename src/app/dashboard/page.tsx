'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section, Grid } from '@/components/Layout';
import { Badge } from '@/components/Alert';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'member') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  const { data: reservations, isLoading: reservationsLoading } = useApi(
    () => apiClient.getMyReservations(),
    isAuthenticated
  );

  const { data: stats } = useApi(async () => {
    try {
      const response = await apiClient.getMakerStats();
      return response;
    } catch {
      return {
        status: true,
        statusCode: 200,
        message: 'Default stats',
        data: { total_reservasi: 0, total_pengeluaran: 0 },
        timestamp: new Date().toISOString(),
      } as const;
    }
  }, isAuthenticated);

  const upcomingReservations = reservations
    ?.filter((r: any) => r.status !== 'Dibatalkan' && r.status !== 'Selesai')
    .slice(0, 5) || [];

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Dashboard Member" description="Pantau reservasi dan aktivitas Anda">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Reservasi</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.total_reservasi || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Pengeluaran</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats?.total_pengeluaran || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Reservasi Mendatang */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Reservasi Mendatang</CardTitle>
                </CardHeader>
                <CardContent>
                  {reservationsLoading ? (
                    <p className="text-gray-600">Memuat...</p>
                  ) : upcomingReservations.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingReservations.map((reservation: any) => (
                        <div
                          key={reservation.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {reservation.space?.nama_space || 'Ruangan'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatDate(reservation.tanggal_reservasi)}
                              </p>
                            </div>
                            <Badge variant="primary">
                              {reservation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {reservation.jam_mulai} - {reservation.durasi_jam} jam
                          </p>
                          <div className="flex gap-2">
                            <Link href={`/reservasi/${reservation.id}`}>
                              <Button size="sm" variant="outline">
                                Lihat Detail
                              </Button>
                            </Link>
                            <Link href={`/reservasi/${reservation.id}/e-ticket`}>
                              <Button size="sm">
                                E-Ticket
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Belum ada reservasi mendatang</p>
                      <Link href="/spaces">
                        <Button>Cari Ruangan</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Akses Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/spaces" className="block">
                  <Button className="w-full" variant="outline">
                    Cari Ruangan
                  </Button>
                </Link>
                <Link href="/reservasi" className="block">
                  <Button className="w-full" variant="outline">
                    Reservasiku
                  </Button>
                </Link>
                <Link href="/history" className="block">
                  <Button className="w-full" variant="outline">
                    Riwayat
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button className="w-full" variant="outline">
                    Profil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl mb-2">🏢</div>
                <h3 className="font-semibold text-gray-900 mb-2">Berbagai Tipe Ruangan</h3>
                <p className="text-sm text-gray-600">
                  Personal Desk, Private Office, Meeting Room
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl mb-2">🎟️</div>
                <h3 className="font-semibold text-gray-900 mb-2">E-Ticket & QR Code</h3>
                <p className="text-sm text-gray-600">
                  Bukti reservasi digital untuk check-in
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-gray-900 mb-2">Promo & Diskon</h3>
                <p className="text-sm text-gray-600">
                  Dapatkan penawaran menarik setiap hari
                </p>
              </div>
            </Card>
          </div>
        </Section>
      </Container>
    </div>
  );
}
