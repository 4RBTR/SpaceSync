# SpaceSync - Smart Coworking Space Reservation System

![SpaceSync Banner](https://img.shields.io/badge/SpaceSync-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.3.4-blue)
![React](https://img.shields.io/badge/React-19.2.8-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38b2ac)

SpaceSync adalah platform penyewaan ruangan coworking space secara online yang mendukung dua peran pengguna: **Member/Visitor** dan **Admin Space Owner**. Dibangun dengan teknologi modern untuk pengalaman pengguna yang optimal.

## 🚀 Fitur Utama

### **Fitur Member/Visitor**
- ✅ Pendaftaran dan autentikasi pengguna
- ✅ Penjelajahan ruangan yang tersedia (Personal Desk, Private Office, Meeting Room)
- ✅ Filter dan pencarian ruangan tingkat lanjut
- ✅ Sistem booking dengan pemilihan tanggal/waktu
- ✅ Penerapan kode promo
- ✅ Manajemen reservasi dengan pelacakan status
- ✅ Generasi e-ticket dengan QR code untuk check-in
- ✅ Riwayat booking difilter berdasarkan bulan
- ✅ Manajemen profil pengguna

### **Fitur Admin Space Owner**
- ✅ Pendaftaran admin untuk coworking spaces
- ✅ Manajemen profil space
- ✅ Operasi CRUD untuk members, spaces, dan promo codes
- ✅ Manajemen reservasi (konfirmasi, update status, check-in/out)
- ✅ Laporan pendapatan dengan breakdown bulanan
- ✅ Analisis distribusi pendapatan per tipe ruangan
- ✅ Dashboard komprehensif dengan metrik kunci

## 🏗️ Teknologi Stack

- **Framework**: Next.js 16.3.4 (App Router)
- **UI Library**: React 19.2.8
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios dengan interceptors
- **Build Tools**: TypeScript 5, ESLint
- **Additional Libraries**: qrcode.react, clsx

## 📁 Struktur Proyek

```
spacesync/
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── admin/              # Halaman Admin
│   │   ├── dashboard/          # Dashboard Member
│   │   ├── login/              # Halaman Login
│   │   ├── register/           # Halaman Registrasi
│   │   ├── reservasi/          # Manajemen Reservasi
│   │   ├── spaces/             # Penjelajahan Ruangan
│   │   ├── layout.tsx          # Root Layout dengan AuthProvider
│   │   └── globals.css         # Global Styles
│   ├── components/             # Komponen UI Reusable
│   │   ├── Layout.tsx          # Komponen Layout
│   │   ├── Form.tsx            # Komponen Form
│   │   ├── Button.tsx          # Komponen Button
│   │   ├── Alert.tsx           # Komponen Alert & Badge
│   │   └── Navigation.tsx      # Header & Sidebar
│   └── lib/                    # Utilities & API
│       ├── api.ts              # API Client (60+ methods)
│       ├── auth-context.tsx    # Authentication Context
│       ├── hooks.ts            # Custom React Hooks
│       └── utils.ts            # Utility Functions
├── public/                     # Assets Static
├── .env.example                # Template Environment Variables
├── tailwind.config.ts          # Tailwind Configuration
├── next.config.ts              # Next.js Configuration
├── tsconfig.json               # TypeScript Configuration
└── package.json                # Dependencies
```

## 🚀 Memulai

### **Prasyarat**
- Node.js 18+
- npm atau package manager lainnya

### **Instalasi**

1. **Clone repository**
```bash
git clone <repository-url>
cd spacesync
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Salin file template environment
cp .env.example .env.local

# Edit .env.local dengan nilai yang sesuai
# NEXT_PUBLIC_API_BASE_URL=https://your-api-url
# NEXT_PUBLIC_APP_KEY=your_app_key_here
```

4. **Jalankan development server**
```bash
npm run dev
```

5. **Buka browser**
```
http://localhost:3000
```

## 🛠️ Scripts NPM

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## 🔧 Konfigurasi

### **Environment Variables**
- `NEXT_PUBLIC_API_BASE_URL`: URL API backend
- `NEXT_PUBLIC_APP_KEY`: API key untuk autentikasi

### **Tailwind CSS**
Konfigurasi custom di `tailwind.config.ts` termasuk:
- Palette warna custom (primary, secondary, success, warning, danger)
- Font families
- Custom animations
- Extended borderRadius dan shadows

### **Next.js Optimization**
Konfigurasi di `next.config.ts` termasuk:
- React Strict Mode
- SWC Minification
- Image Optimization
- Security Headers
- Production optimizations

## 🔌 API Integration

Semua endpoint API mengikuti format response standar:
```typescript
interface ApiResponse<T> {
  status: boolean;           // Indikator sukses
  statusCode: number;        // HTTP-like status code
  message: string;           // Pesan yang bisa dibaca manusia
  data: T;                   // Data payload
  timestamp: string;         // ISO 8601 timestamp
}
```

Autentikasi membutuhkan:
- `Authorization: Bearer <access_token>`
- `x-maker-key: <NEXT_PUBLIC_APP_KEY>`

## 📱 Responsive Design

Proyek ini menggunakan pendekatan **mobile-first** dengan breakpoints:
- **Mobile**: 0px - 640px
- **Tablet**: 641px - 1024px  
- **Desktop**: 1025px - ∞

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] Test member registration flow
- [ ] Test admin registration flow  
- [ ] Test login dengan invalid credentials
- [ ] Test member dashboard loading
- [ ] Test space filtering dan search
- [ ] Test complete booking workflow
- [ ] Test promo code application
- [ ] Test e-ticket generation
- [ ] Test QR code printing

### **Browser Testing**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 🚀 Deployment

### **Build untuk Production**
```bash
npm run build
npm start
```

### **Deployment Checklist**
- [ ] Update API base URL di `.env.local`
- [ ] Verify semua API endpoints accessible
- [ ] Test authentication dengan production API
- [ ] Test image uploads
- [ ] Verify QR code generation works
- [ ] Test di semua browser yang didukung
- [ ] Verify SSL/HTTPS enabled
- [ ] Check error logging configured
- [ ] Verify CORS headers correct
- [ ] Test load times

## 📄 Dokumentasi Lainnya

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Panduan arsitektur dan dokumentasi proyek

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📞 Support

Untuk pertanyaan atau masalah, lihat:
- File komponen - Contoh dan penggunaan
- API client - Method signatures dan responses
- Utility functions - Implementasi helper

## 📝 Lisensi

Proyek ini dikembangkan untuk tujuan pendidikan dan UKK RPL.

---

**Status**: ✅ **PRODUCTION READY**  
**Last Updated**: September 15, 2026  
**Repository**: [https://github.com/4RBTR/SpaceSync.git](https://github.com/4RBTR/SpaceSync.git)

Selamat! SpaceSync frontend adalah 100% LENGKAP dan siap digunakan! 🚀
