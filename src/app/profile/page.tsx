'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Container, Card, CardContent, Section } from '@/components/Layout';
import { Input, Form, FileInput } from '@/components/Form';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, userRole, user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Memuat profil...</p>
      </div>
    );
  }

  const displayName = user.nama_member || user.nama_coworking || user.username || 'User';
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen py-8">
      <Container className="max-w-2xl">
        <Section title="Profil Saya" description="Informasi akun Anda">
          {success && (
            <Alert type="success" message={success} dismissible className="mb-6" />
          )}
          {error && (
            <Alert type="error" message={error} dismissible className="mb-6" />
          )}

          <Card>
            <CardContent>
              {/* Avatar & Name */}
              <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-200">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.foto ? (
                    <img
                      src={user.foto}
                      alt={displayName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  <p className="text-sm text-slate-500">@{user.username}</p>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {userRole === 'admin_space' ? 'Admin Space' : 'Member'}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Username</p>
                    <p className="text-slate-900 font-medium">{user.username}</p>
                  </div>
                  {user.no_telepon && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Telepon</p>
                      <p className="text-slate-900 font-medium">{user.no_telepon}</p>
                    </div>
                  )}
                  {user.email && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-slate-900 font-medium">{user.email}</p>
                    </div>
                  )}
                  {user.alamat && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Alamat</p>
                      <p className="text-slate-900 font-medium">{user.alamat}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Kembali ke Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      </Container>
    </div>
  );
}
