'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section, Grid } from '@/components/Layout';
import { Input } from '@/components/Form';
import { Button, IconButton } from '@/components/Button';
import { Badge, Alert } from '@/components/Alert';
import Link from 'next/link';
import { formatCurrency, getImageUrl } from '@/lib/utils';

export default function AdminSpacesPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: spaces, isLoading, execute: refetch } = useApi(
    () => apiClient.getAdminSpaces(1, 20),
    isAuthenticated && userRole === 'admin_space'
  );

  const filteredSpaces =
    spaces?.filter((s: any) =>
      s.nama_space?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
      try {
        await apiClient.deleteAdminSpace(id);
        refetch();
      } catch (err) {
        console.error('Gagal menghapus space:', err);
      }
    }
  };

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Kelola Ruangan" description="Atur data ruangan/meja kerja Anda">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Cari ruangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Link href="/admin/spaces/add">
              <Button>Tambah Ruangan</Button>
            </Link>
          </div>

          {/* Spaces Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Memuat data ruangan...</p>
            </div>
          ) : filteredSpaces.length > 0 ? (
            <Grid cols={3}>
              {filteredSpaces.map((space: any) => (
                <Card key={space.id} className="flex flex-col">
                  {/* Image */}
                  <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4 flex items-center justify-center text-slate-400 font-semibold overflow-hidden">
                    <img
                      src={getImageUrl(space.foto, 'space')}
                      alt={space.nama_space}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">{space.nama_space}</CardTitle>
                        <Badge variant="primary" className="mt-2">
                          {space.tipe_space}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kapasitas:</span>
                        <span className="font-semibold">{space.kapasitas} orang</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harga:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(space.harga_per_jam)}/jam
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tersedia:</span>
                        <Badge variant="success">Aktif</Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200">
                      <Link href={`/admin/spaces/${space.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <IconButton
                        size="sm"
                        variant="outline"
                        icon={
                          <svg
                            className="w-4 h-4 text-red-600"
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
                        onClick={() => handleDelete(space.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          ) : (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Tidak ada data ruangan</p>
                <Link href="/admin/spaces/add">
                  <Button>Tambah Ruangan Pertama</Button>
                </Link>
              </div>
            </Card>
          )}
        </Section>
      </Container>
    </div>
  );
}
