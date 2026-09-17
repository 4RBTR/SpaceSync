'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Input } from '@/components/Form';
import { Button, IconButton } from '@/components/Button';
import { Badge } from '@/components/Alert';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

function extractArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.data?.data)) return raw.data.data;
  return [];
}

export default function AdminPromoPage() {
  const { isAuthenticated, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: diskonsRes, isLoading, execute: refetch } = useApi(
    () => apiClient.getAdminDiskon(1, 50),
    isAuthenticated && userRole === 'admin_space'
  );

  const diskonsList = extractArray(diskonsRes);

  const filteredDiskons =
    diskonsList.filter((d: any) =>
      d.nama_diskon?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.kode_diskon?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.kode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus promo ini?')) {
      try {
        await apiClient.deleteAdminDiskon(id);
        refetch();
      } catch (err) {
        console.error('Gagal menghapus promo:', err);
      }
    }
  };

  const isActive = (diskon: any) => {
    const today = new Date();
    const startDateStr = diskon.tanggal_awal || diskon.tanggal_mulai;
    const endDateStr = diskon.tanggal_akhir;
    if (!startDateStr || !endDateStr) return true;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    return today >= start && today <= end;
  };

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Kelola Promo/Diskon" description="Atur kode promo dan diskon Anda">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Cari promo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Link href="/admin/promo/add">
              <Button>Tambah Promo</Button>
            </Link>
          </div>

          {/* Promo Table */}
          <Card>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Memuat data promo...</p>
              </div>
            ) : filteredDiskons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        Nama / Kode Promo
                      </th>
                      <th className="text-center px-6 py-3 font-semibold text-gray-900">
                        Diskon
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        Tanggal Mulai
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        Tanggal Akhir
                      </th>
                      <th className="text-center px-6 py-3 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-center px-6 py-3 font-semibold text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDiskons.map((diskon: any) => (
                      <tr
                        key={diskon.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <span className="font-bold text-slate-900 block">{diskon.nama_diskon}</span>
                          {diskon.kode_diskon && (
                            <span className="text-xs font-mono text-indigo-600 uppercase font-bold">
                              Kode: {diskon.kode_diskon}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600 font-sans">
                          {diskon.persentase_diskon}%
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {formatDate(diskon.tanggal_awal || diskon.tanggal_mulai)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {formatDate(diskon.tanggal_akhir)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant={isActive(diskon) ? 'success' : 'secondary'}
                          >
                            {isActive(diskon) ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Link href={`/admin/promo/${diskon.id}`}>
                              <IconButton
                                size="sm"
                                icon={
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                }
                              />
                            </Link>
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={
                                <svg
                                  className="w-5 h-5 text-red-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              }
                              onClick={() => handleDelete(diskon.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Tidak ada data promo</p>
                <Link href="/admin/promo/add">
                  <Button>Buat Promo Pertama</Button>
                </Link>
              </div>
            )}
          </Card>
        </Section>
      </Container>
    </div>
  );
}
