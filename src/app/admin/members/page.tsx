'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, Section } from '@/components/Layout';
import { Input } from '@/components/Form';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { getInitials, getImageUrl } from '@/lib/utils';

function extractArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.data?.data)) return raw.data.data;
  return [];
}

export default function AdminMembersPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState<'customers_only' | 'all'>('customers_only');

  // Fetch registered members
  const { data: membersRes, isLoading: membersLoading } = useApi(
    () => apiClient.getAdminMembers(1, 100),
    isAuthenticated && userRole === 'admin_space'
  );

  // Fetch admin reservations to determine customer members
  const { data: reservationsRes, isLoading: resLoading } = useApi(
    () => apiClient.getAdminReservations(),
    isAuthenticated && userRole === 'admin_space'
  );

  const membersList = useMemo(() => extractArray(membersRes), [membersRes]);
  const reservationsList = useMemo(() => extractArray(reservationsRes), [reservationsRes]);

  // Build a map of member IDs / usernames to reservation count in this space
  const memberReservationsMap = useMemo(() => {
    const map: Record<string, number> = {};

    reservationsList.forEach((r: any) => {
      const userId = String(r.id_user || r.user?.id || r.member?.id || '');
      const username = String(r.user?.username || r.member?.username || r.nama_member || '');

      if (userId && userId !== 'undefined') {
        map[userId] = (map[userId] || 0) + 1;
      }
      if (username) {
        map[username.toLowerCase()] = (map[username.toLowerCase()] || 0) + 1;
      }
    });

    return map;
  }, [reservationsList]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return membersList.filter((m: any) => {
      const memberId = String(m.id);
      const usernameKey = String(m.username || m.nama_member || '').toLowerCase();
      const bookingCount = memberReservationsMap[memberId] || memberReservationsMap[usernameKey] || 0;
      const isCustomer = bookingCount > 0;

      if (filterScope === 'customers_only' && !isCustomer) {
        return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = m.nama_member?.toLowerCase().includes(q);
        const matchEmail = m.email?.toLowerCase().includes(q) || m.username?.toLowerCase().includes(q);
        const matchInstansi = m.instansi?.toLowerCase().includes(q);
        return matchName || matchEmail || matchInstansi;
      }

      return true;
    });
  }, [membersList, memberReservationsMap, filterScope, searchQuery]);

  const isLoading = membersLoading || resLoading;

  return (
    <div className="min-h-screen py-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Container>
        <Section title="Detail Members & Transaksi Pengunjung" description="Daftar member dan penyewa ruangan Coworking Space Anda">
          
          {/* Action & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Scope Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto">
              <button
                onClick={() => setFilterScope('customers_only')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterScope === 'customers_only'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                👥 Penyewa Space Saya ({membersList.filter((m: any) => (memberReservationsMap[String(m.id)] || memberReservationsMap[String(m.username || '').toLowerCase()] || 0) > 0).length})
              </button>
              <button
                onClick={() => setFilterScope('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterScope === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🌐 Semua Member Platform ({membersList.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-auto min-w-[240px]">
              <Input
                placeholder="Cari nama, username, instansi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Members Table Card */}
          <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800">
            {isLoading ? (
              <div className="text-center py-16">
                <svg className="animate-spin mx-auto h-8 w-8 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-500 font-medium text-xs">Memuat data members...</p>
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Nama Member</th>
                      <th className="px-6 py-4">Username / Email</th>
                      <th className="px-6 py-4">No. Telepon</th>
                      <th className="px-6 py-4">Instansi</th>
                      <th className="px-6 py-4">Status Transaksi</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMembers.map((member: any) => {
                      const memberId = String(member.id);
                      const usernameKey = String(member.username || member.nama_member || '').toLowerCase();
                      const bookingCount = memberReservationsMap[memberId] || memberReservationsMap[usernameKey] || 0;

                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs overflow-hidden flex-shrink-0 border border-indigo-200/50">
                                {member.foto_url || member.foto ? (
                                  <img
                                    src={getImageUrl(member.foto_url || member.foto, 'avatar')}
                                    alt={member.nama_member}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  getInitials(member.nama_member || 'Member')
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{member.nama_member}</span>
                                <span className="text-[10px] text-slate-400">ID: #{member.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{member.username || member.email || '-'}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {member.telp || member.no_telepon || '-'}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{member.instansi || '-'}</td>
                          <td className="px-6 py-4">
                            {bookingCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Penyewa Setia ({bookingCount} Transaksi)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                Member Platform
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link href={`/admin/members/${member.id}`}>
                              <Button variant="outline" className="text-xs px-3 py-1.5 shadow-sm">
                                👁️ Detail & Transaksi
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500 font-medium text-sm">
                  {filterScope === 'customers_only'
                    ? 'Belum ada member yang melakukan transaksi/penyewaan di Coworking Space Anda.'
                    : 'Tidak ada data member yang ditemukan.'}
                </p>
              </div>
            )}
          </Card>
        </Section>
      </Container>
    </div>
  );
}
