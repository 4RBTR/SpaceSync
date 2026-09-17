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

function extractArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.data?.data)) return raw.data.data;
  if (Array.isArray(raw.reservasi)) return raw.reservasi;
  if (Array.isArray(raw.history)) return raw.history;
  return [];
}

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
    () => apiClient.getMyHistoryReservations().catch(() => apiClient.getMyReservationHistory(month, year)),
    isAuthenticated
  );

  const { data: allReservationsRes, isLoading: allLoading, execute: refetchAll } = useApi(
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

  // Extract arrays from both API responses
  const apiHistoryList = extractArray(historyRes);
  const allReservationsList = extractArray(allReservationsRes);

  // Timezone-safe month & year matching
  const filterByMonthYear = (list: any[]) => {
    return list.filter((r: any) => {
      if (!r.tanggal_reservasi) return false;
      let rYear: number, rMonth: number;
      if (typeof r.tanggal_reservasi === 'string' && r.tanggal_reservasi.includes('-')) {
        const parts = r.tanggal_reservasi.substring(0, 10).split('-');
        rYear = parseInt(parts[0], 10);
        rMonth = parseInt(parts[1], 10);
      } else {
        const d = new Date(r.tanggal_reservasi);
        rYear = d.getFullYear();
        rMonth = d.getMonth() + 1;
      }
      return rMonth === month && rYear === year;
    });
  };

  // Step 1: Filtered API history list
  let finalHistoryList = filterByMonthYear(apiHistoryList);

  // Step 2: Fallback to allReservations list filtered by month & year
  if (finalHistoryList.length === 0) {
    finalHistoryList = filterByMonthYear(allReservationsList);
  }

  // Step 3: Ultimate fallback if filter yields 0 but user has reservations
  const isUsingGlobalFallback = finalHistoryList.length === 0 && allReservationsList.length > 0;
  if (isUsingGlobalFallback) {
    finalHistoryList = allReservationsList;
  }

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
                <div className="mb-4 flex gap-2">
                  <Button onClick={handleFilter} isLoading={isLoading}>
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMonth(currentDate.getMonth() + 1);
                      setYear(currentDate.getFullYear());
                      handleFilter();
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isUsingGlobalFallback && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center justify-between">
              <span>Menampilkan seluruh riwayat reservasi Anda ({allReservationsList.length} reservasi ditemukan)</span>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500 font-medium">Memuat riwayat reservasi...</p>
            </div>
          ) : finalHistoryList.length > 0 ? (
            <div className="space-y-4">
              {finalHistoryList.map((reservation: any) => {
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
