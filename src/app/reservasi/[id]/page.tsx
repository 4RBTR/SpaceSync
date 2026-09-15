'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Alert';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor, getDayName } from '@/lib/utils';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  const { isAuthenticated } = useAuth();

  const { data: reservation, isLoading } = useApi(
    () => apiClient.getReservationDetail(reservationId),
    isAuthenticated
  );

  const handleCancel = async () => {
    if (confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
      try {
        await apiClient.cancelReservation(reservationId);
        router.push('/reservasi');
      } catch (err) {
        console.error('Gagal membatalkan reservasi:', err);
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
              <Link href="/reservasi">
                <Button>Kembali ke Reservasi</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const tanggalReservasi = new Date(reservation.tanggal_reservasi);

  return (
    <div className="min-h-screen py-8">
      <Container className="max-w-3xl">
        <Section title="Detail Reservasi">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        {reservation.space?.nama_space}
                      </CardTitle>
                      <p className="text-gray-600 mt-2">
                        {reservation.space?.tipe_space}
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
                      <p className="font-semibold text-lg">
                        {formatDate(reservation.tanggal_reservasi)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {getDayName(reservation.tanggal_reservasi)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Waktu Mulai</p>
                      <p className="font-semibold text-lg">
                        {reservation.jam_mulai}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Durasi</p>
                      <p className="font-semibold text-lg">
                        {reservation.durasi_jam} jam
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Waktu Selesai</p>
                      <p className="font-semibold text-lg">
                        {`${parseInt(reservation.jam_mulai.split(':')[0]) + reservation.durasi_jam}:${reservation.jam_mulai.split(':')[1]}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Rincian Biaya</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Harga per jam</span>
                      <span className="font-semibold">
                        {formatCurrency(reservation.space?.harga_per_jam || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Durasi ({reservation.durasi_jam} jam)</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          (reservation.space?.harga_per_jam || 0) * reservation.durasi_jam
                        )}
                      </span>
                    </div>

                    {reservation.diskon && (
                      <>
                        <div className="flex justify-between text-sm text-green-600 py-3 border-t border-gray-200">
                          <span>Diskon ({reservation.diskon.persentase_diskon}%)</span>
                          <span className="font-semibold">
                            -{formatCurrency(
                              ((reservation.space?.harga_per_jam || 0) *
                                reservation.durasi_jam *
                                reservation.diskon.persentase_diskon) /
                                100
                            )}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between text-lg font-bold bg-blue-50 p-3 rounded-lg mt-4">
                      <span>Total</span>
                      <span className="text-blue-600">
                        {formatCurrency(reservation.total_harga)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Space Facilities */}
              {reservation.space?.fasilitas && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fasilitas Ruangan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {reservation.space.fasilitas.split(',').map((fac: string, idx: number) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                          {fac.trim()}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Aksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/reservasi/${reservationId}/e-ticket`} className="block">
                    <Button className="w-full">
                      Lihat E-Ticket
                    </Button>
                  </Link>

                  {reservation.status === 'Belum Dikonfirmasi' && (
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={handleCancel}
                    >
                      Batalkan Reservasi
                    </Button>
                  )}

                  <Link href="/reservasi" className="block">
                    <Button variant="outline" className="w-full">
                      Kembali
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Coworking Space Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Lokasi Space</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Nama</p>
                      <p className="font-semibold">
                        {reservation.space?.coworking_space?.nama_coworking}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Alamat</p>
                      <p className="font-semibold">
                        {reservation.space?.coworking_space?.alamat}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Telepon</p>
                      <p className="font-semibold">
                        {reservation.space?.coworking_space?.no_telepon}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reservation Code */}
              <Card>
                <CardContent className="text-center py-6">
                  <p className="text-gray-600 text-sm mb-2">Kode Reservasi</p>
                  <p className="font-mono font-bold text-lg break-all">
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
