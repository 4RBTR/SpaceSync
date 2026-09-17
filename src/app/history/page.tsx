'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Badge } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Select } from '@/components/Form';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor, formatStatusLabel, getMonthName, getReservationPrice, getReservationSpace } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'member') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  const { data: historyRes, isLoading: historyLoading, execute: refetchHistory } = useApi(
    () => apiClient.getMyReservationHistory(month, year),
    isAuthenticated
  );

  const { data: allReservations, isLoading: allLoading, execute: refetchAll } = useApi(
    () => apiClient.getMyReservations(),
    isAuthenticated
  );

  const handleFilter = () => {
    refetchHistory();
    refetchAll();
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: getMonthName(i + 1),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentDate.getFullYear() - i),
    label: String(currentDate.getFullYear() - i),
  }));

  const isLoading = historyLoading && allLoading;

  // Extract array of items from API history response (handles object wrapping { data: [...] })
  const apiHistoryList = Array.isArray(historyRes)
    ? historyRes
    : (Array.isArray(historyRes?.data) ? historyRes.data : []);

  // Fallback: filter all member reservations by selected month & year
  const fallbackList = (allReservations || []).filter((r: any) => {
    if (!r.tanggal_reservasi) return false;
    const d = new Date(r.tanggal_reservasi);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const historyList = apiHistoryList.length > 0 ? apiHistoryList : fallbackList;

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Riwayat Reservasi" description="Lihat riwayat reservasi Anda berdasarkan bulan">
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[140px]">
                  <Select
                    label="Bulan"
                    value={String(month)}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    options={monthOptions}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <Select
                    label="Tahun"
                    value={String(year)}
                    onChange={(e) => setYear(Number(e.target.value))}
                    options={yearOptions}
                  />
                </div>
                <div className="mb-4">
                  <Button onClick={handleFilter} isLoading={isLoading}>
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Memuat riwayat...</p>
            </div>
          ) : historyList.length > 0 ? (
            <div className="space-y-4">
              {historyList.map((reservation: any) => {
                const spaceObj = getReservationSpace(reservation);
                const totalBiaya = getReservationPrice(reservation);
                const statusLabel = formatStatusLabel(reservation.status);

                return (
                  <Card key={reservation.id || reservation.id_reservasi} className="hover:shadow-md transition">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-slate-900 text-lg">
                              {spaceObj?.nama_space || reservation.nama_space || 'Ruangan Coworking'}
                            </h3>
                            <Badge className={getStatusColor(reservation.status)}>
                              {statusLabel}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 capitalize mb-3">
                            {spaceObj?.tipe_space || spaceObj?.tipe || 'Coworking Space'} • Kode: <span className="font-mono font-semibold text-indigo-600">#RES-{reservation.id}</span>
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500 text-xs font-medium">Tanggal</p>
                              <p className="font-semibold text-slate-900">{formatDate(reservation.tanggal_reservasi)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs font-medium">Waktu & Durasi</p>
                              <p className="font-semibold text-slate-900">{reservation.jam_mulai || '10:00'} - {reservation.durasi_jam || 1} jam</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs font-medium">Total Biaya</p>
                              <p className="font-bold text-emerald-600 font-sans">{formatCurrency(totalBiaya)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <Link href={`/reservasi/${reservation.id || reservation.id_reservasi}`}>
                            <Button size="sm" variant="outline" className="w-full">
                              Detail
                            </Button>
                          </Link>
                          {statusLabel !== 'Dibatalkan' && (
                            <Link href={`/reservasi/${reservation.id || reservation.id_reservasi}/e-ticket`}>
                              <Button size="sm" className="w-full">
                                E-Ticket
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-slate-700 font-semibold mb-1">Belum ada riwayat reservasi</p>
                <p className="text-xs text-slate-500 mb-4">
                  untuk periode {getMonthName(month)} {year}
                </p>
                <Link href="/spaces">
                  <Button size="sm">Jelajah & Pesan Ruangan</Button>
                </Link>
              </div>
            </Card>
          )}
        </Section>
      </Container>
    </div>
  );
}
