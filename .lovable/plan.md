# Rencana Implementasi Middig — Fase 2

Scope besar, jadi saya kelompokkan supaya jelas apa yang masuk dan apa yang tidak. Semua akan menyesuaikan tampilan putih bersih yang sudah ada.

## 1. Database (migrasi baru)

- Tabel baru `categories` (name, slug) — CRUD admin.
- Tabel baru `site_categories` (site_id, category_id) untuk many-to-many.
- Kolom baru di `sites`: `tags text[]`, `owner_id uuid` (member pemilik), `status` enum `pending|approved|rejected`, `rejection_reason text`. Field `styles/types/subjects` lama tetap ada agar tidak break, tapi form baru pakai kategori+tags.
- Tabel `profiles` (user_id, display_name, avatar_url, tier `free|paid`, paid_until, sites_used_this_period, period_started_at). Trigger auto-create saat signup.
- Tabel `payments` (user_id, provider `stripe`, amount, currency, status, stripe_session_id, created_at) untuk histori.
- Function `can_submit_site(user_id)` — cek kuota (free: 5 total; paid: +20 per bulan sejak paid_until aktif).
- RLS + GRANT lengkap. Approval publik: hanya row `status='approved' AND published=true` yang boleh dibaca `anon`; owner boleh baca miliknya sendiri via `authenticated`.
- Seed 35 dummy sites (approved, published) + ~10 kategori standar (Portfolio, E-commerce, Editorial, Agency, Brand, Photography, Fashion, Food, Technology, Publication).

## 2. Payments — Stripe $3/bulan

- Enable `Seamless Payments via Stripe` (Lovable built-in). Setelah aktif, buat satu produk **Middig Pro — $3/month** recurring via `batch_create_product`.
- Checkout via server function → redirect ke Stripe Checkout (kartu + link/wallets; PayPal tersedia sebagai payment method di Stripe Checkout untuk mata uang yang mendukung, kalau tidak akan otomatis fallback ke kartu saja).
- Webhook `/api/public/webhooks/stripe` update `profiles.tier='paid'`, `paid_until=now()+1 month`, reset quota bulanan.
- Halaman `/portal/billing` — tampilkan status membership + tombol upgrade / manage.

## 3. Portal Member (`/portal/*`, protected `_authenticated`)

Semua di bawah layout `_authenticated` yang sudah ada:
- `/portal` — dashboard: status tier, kuota tersisa, link cepat.
- `/portal/profile` — edit display_name, avatar.
- `/portal/password` — ubah password (via `supabase.auth.updateUser`).
- `/portal/sites` — list situs milik member (semua status), edit & hapus.
- `/portal/sites/new` — form daftar situs dengan **TipTap** rich text editor untuk deskripsi, multi-select kategori, tags (comma / chip input). Cek kuota sebelum submit. Status awal `pending`.
- `/portal/billing` — upgrade / status membership.

Header publik dapat menu "Portal" saat login, "Sign in" saat tidak.

## 4. Frontend publik

- **Halaman detail situs** `/site/$slug` (slug dari title): hero thumbnail, judul, studio, deskripsi (render HTML dari TipTap yang sudah disanitasi via DOMPurify), kategori & tags, link kunjungi. Head metadata dinamis + og:image dari thumbnail.
- Galeri (`/gallery` & index): judul situs jadi link ke detail. Filter kategori dari tabel `categories`, filter tags dari tags array. Hanya tampilkan `status='approved'`.
- Form submit publik `/submit` diarahkan ke `/portal/sites/new` (butuh login). Kalau belum login → redirect ke `/auth` dengan pesan.

## 5. Admin baru

- `/admin/categories` — CRUD kategori (list, add, rename, delete).
- `/admin/sites` diperluas: tab **Pending approval** (approve / reject dengan alasan), tab **Approved**, tab **Rejected**. Approve set `status='approved'` + `published=true`.
- `/admin/members` — list member, ubah tier manual, lihat kuota.
- Sidebar admin dapat entry baru untuk Categories & Members.

## 6. Dependencies

- `bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-link isomorphic-dompurify`
- Stripe checkout via built-in — tidak perlu SDK sendiri.

## 7. Yang **tidak** saya kerjakan di iterasi ini (biar realistis)

- Email verifikasi custom, template email transaksional.
- Manajemen billing lanjutan (proration, downgrade, invoice PDF).
- Refund flow.
- Rate limiting.
- Multi-bahasa.

Setelah kamu setuju, saya akan mulai dengan (a) enable Stripe payments, (b) migrasi DB + seed 35 dummy, (c) install deps TipTap, lalu bangun UI/logic secara paralel. Bilang **lanjut** kalau OK, atau koreksi bagian yang perlu diubah dulu.