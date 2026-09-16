import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getMonthName(month: number): string {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return months[month - 1] || '';
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'Belum Dikonfirmasi': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    'Disetujui': 'bg-blue-100 text-blue-800 border border-blue-300',
    'Aktif/Digunakan': 'bg-green-100 text-green-800 border border-green-300',
    'Selesai': 'bg-gray-100 text-gray-800 border border-gray-300',
    'Dibatalkan': 'bg-red-100 text-red-800 border border-red-300',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800 border border-gray-300';
}

export function calculateTotalPrice(
  pricePerHour: number,
  duration: number,
  discountPercentage?: number
): number {
  let total = pricePerHour * duration;
  if (discountPercentage) {
    total = total - (total * discountPercentage) / 100;
  }
  return Math.round(total);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function generateQRCode(data: string): string {
  // This returns a data URI for QR code
  // Implementation depends on qrcode.react library
  return data;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function convertDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function convertTimeToISO(time: string): string {
  // Assuming time is in HH:mm format
  return time;
}

export function getDayName(date: string): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const d = new Date(date + 'T00:00:00');
  return days[d.getDay()];
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getUpcomingReservations(reservations: any[]): any[] {
  const now = new Date();
  return reservations
    .filter(
      (r) =>
        new Date(r.tanggal_reservasi) >= now &&
        r.status !== 'Dibatalkan'
    )
    .sort(
      (a, b) =>
        new Date(a.tanggal_reservasi).getTime() -
        new Date(b.tanggal_reservasi).getTime()
    );
}

export function getImageUrl(path?: string, fallbackType: 'space' | 'avatar' = 'space'): string {
  if (!path) {
    return fallbackType === 'avatar'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80';
  }
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://learn.smktelkom-mlg.sch.id/coworking';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

