'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Container, Card, CardHeader, CardTitle, CardContent, Section } from '@/components/Layout';
import { Input } from '@/components/Form';
import { Button, IconButton } from '@/components/Button';
import Link from 'next/link';
import { getInitials, getImageUrl } from '@/lib/utils';

export default function AdminMembersPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: members, isLoading, execute: refetch } = useApi(
    () => apiClient.getAdminMembers(currentPage, 10),
    isAuthenticated && userRole === 'admin_space'
  );

  const filteredMembers =
    members?.filter((m: any) =>
      m.nama_member?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus member ini?')) {
      try {
        await apiClient.deleteAdminMember(id);
        refetch();
      } catch (err) {
        console.error('Gagal menghapus member:', err);
      }
    }
  };

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Section title="Kelola Members" description="Atur data member/pengunjung Anda">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Cari member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Link href="/admin/members/add">
              <Button>Tambah Member</Button>
            </Link>
          </div>

          {/* Members Table */}
          <Card>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Memuat data members...</p>
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">Nama</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">Email</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">No. Telepon</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">Instansi</th>
                      <th className="text-center px-6 py-3 font-semibold text-gray-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member: any) => (
                      <tr
                        key={member.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs overflow-hidden flex-shrink-0 border border-indigo-200/50">
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
                            <span className="font-semibold">{member.nama_member}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{member.email}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {member.no_telepon}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{member.instansi}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Link href={`/admin/members/${member.id}`}>
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
                              onClick={() => handleDelete(member.id)}
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
                <p className="text-gray-600">Tidak ada data member</p>
              </div>
            )}
          </Card>

          {/* Pagination */}
          {filteredMembers.length > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Sebelumnya
              </Button>
              <span className="px-4 py-2 text-gray-600">Halaman {currentPage}</span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </Section>
      </Container>
    </div>
  );
}
