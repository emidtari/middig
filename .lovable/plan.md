## Tujuan
Tambah hero baru, restruktur halaman untuk SEO, dan bangun dashboard admin lengkap dengan Lovable Cloud (auth + database) untuk mengelola konten, SEO, dan kontak.

## 1. Aktifkan Lovable Cloud
- Provision database + auth.
- Atur admin awal: `enils.id@gmail.com` (signup pertama via halaman /auth, role admin diberikan via migration seed).

## 2. Skema database
- `sites` — id, title, studio, url, thumbnail_url, styles[], types[], subjects[], featured (bool), published (bool), created_at.
- `site_settings` — singleton (id=1): site_title, site_description, og_image, twitter_handle, hero_headline, hero_subhead, featured_site_id.
- `contact_messages` — id, name, email, message, created_at, read (bool). Insert publik (anon) dengan rate-limit kolom IP opsional; read admin only.
- `contact_info` — singleton: email, address, social links.
- `user_roles` + enum `app_role` + fungsi `has_role` (pola standar Lovable).
- RLS:
  - `sites`, `site_settings`, `contact_info`: SELECT publik untuk row `published`/settings; semua write hanya admin.
  - `contact_messages`: INSERT anon, SELECT/UPDATE admin.
  - `user_roles`: SELECT authenticated, write service_role.

## 3. Restruktur frontend (SEO friendly)
- Halaman dipecah jadi route terpisah, setiap route punya `head()` sendiri (title, description, og:*, canonical):
  - `/` — Hero split + grid unggulan + CTA.
  - `/gallery` — Grid lengkap + filter (pindahan dari index).
  - `/about` — Tentang Middig.
  - `/contact` — Form kontak (kirim ke `contact_messages`, captcha matematika).
  - `/submit` — Form submit site (insert ke `sites` dengan `published=false`).
  - `/auth` — Login/Signup admin (dengan captcha matematika + link "Lupa password").
  - `/reset-password` — Halaman atur password baru (dipakai link recovery email).
- `__root.tsx`: JSON-LD WebSite/Organization, og defaults, manifest, robots-friendly.
- Semantik HTML: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, satu `<h1>` per halaman, alt text pada thumbnail, lazy loading.
- `public/robots.txt` + `public/sitemap.xml` (root + /gallery + /about + /contact + /submit).

### Hero baru ("Minimal split + featured site")
- Kiri: H1 "Web design inspiration, curated.", subjudul, dua CTA (`Browse gallery`, `Submit a site`), chip kategori populer.
- Kanan: kartu featured site (judul, studio, tag, thumbnail) yang diambil dari `site_settings.featured_site_id` (fallback ke item pertama).
- Responsif: tumpuk di mobile, dua kolom di ≥md. Animasi hover halus pada featured.

## 4. Dashboard admin `/admin` (protected via `_authenticated/`)
Lokasi route: `src/routes/_authenticated/admin/...`
- `/admin` — ringkasan: jumlah sites, draft, pesan baru.
- `/admin/sites` — list, search, toggle published/featured, edit/hapus, tombol "New site".
- `/admin/sites/new` & `/admin/sites/$id` — form (title, studio, url, thumbnail, styles/types/subjects multi-tag, published/featured).
- `/admin/messages` — inbox pesan kontak, tandai sudah dibaca, hapus.
- `/admin/seo` — atur site_title, description, og_image, twitter_handle, hero_headline, hero_subhead, featured_site_id.
- `/admin/contact` — atur contact_info + lihat preview.
- Sidebar responsif (drawer di mobile), header dengan avatar + logout.
- Estetika: putih bersih, kartu border tipis, spacing lega, konsisten dengan public site.

## 5. Auth & keamanan
- Email/password lewat Supabase.
- **Captcha matematika** (mis. "3 + 5 = ?") di form login, signup, lupa password, contact, submit — divalidasi client-side sebelum submit; soal di-randomize setiap render dan reset setelah gagal.
- "Lupa password" → `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`.
- `/reset-password` publik, deteksi `type=recovery`, panggil `updateUser({ password })`.
- Hanya user dengan `has_role(uid, 'admin')` yang lolos `_authenticated/admin` (cek via server fn + redirect ke `/` jika bukan admin).
- Seed admin: setelah `enils.id@gmail.com` signup pertama kali, trigger auto-assign role `admin` (atau migration `INSERT ... ON CONFLICT` berdasarkan email lookup di `auth.users`).

## 6. Detail teknis
- Server functions di `src/lib/*.functions.ts` untuk: list/create/update/delete sites, get/update site_settings & contact_info, list/mark messages, submit contact, submit site (publik).
- Browser Supabase client untuk auth flow.
- Tidak memakai Supabase Edge Functions.
- `__root.tsx` listener `onAuthStateChange` (sudah ada di template) — tidak diduplikasi.
- Form validation: zod + react-hook-form (sudah tersedia di stack shadcn).

## 7. Verifikasi sebelum selesai
- Build lulus.
- `/` menampilkan hero split + featured.
- `/auth` bisa signup → admin pertama otomatis dapat role.
- `/admin` hanya bisa diakses admin.
- CRUD sites berfungsi dan tercermin di `/gallery`.
- Pesan kontak masuk inbox.
- Reset password mengirim email & halaman `/reset-password` bekerja.

Lanjut bangun?
