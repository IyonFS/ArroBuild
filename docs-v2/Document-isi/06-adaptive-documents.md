# Template: Dokumen Adaptif (berubah total sesuai Tipe Produk) — v2, terintegrasi

> **Tipe dokumen:** Wajib (Core Module) — dokumen #6, 1 slot dengan isi yang berganti total tergantung `product_type`
> **Tersedia di tier:** Pro Max saja
> **Kelas model:** Flagship (Claude Sonnet — pastikan versi 4.6/5 yang dipanggil, cek `arrobuild_pricing_monetisasi_v2.md` Bag. 4.4)
> **Token budget:** 6.500
> **Kredit (default mix):** 228
> **Catatan:** Ini dokumen yang paling boleh "mahal" — porsi biaya AI paling besar difokuskan di sini karena butuh pertimbangan strategis kontekstual, bukan sekadar merapikan informasi seperti dokumen lain.

> [!WARNING]
> **Batas dengan modul opsional:** dokumen ini adalah ringkasan strategi (arahan besar, beberapa paragraf per poin). Kalau user juga membeli modul opsional yang temanya berdekatan (misal Onboarding & Email Flow, Analytics & Metrics Spec, Security & Launch Checklist — lihat `00-overview.md` Bag. 3), modul opsional itu yang berisi eksekusi detail/siap-pakai. Jangan generate isi yang sama persis di dua tempat.

---

## Jika `product_type = saas` → **"Growth & Retention"**
1. **Strategi Onboarding** — arahan besar (ringkas; detail email/urutan lengkap ada di modul opsional Onboarding & Email Flow jika dibeli)
2. **Metrik Retensi Utama** — apa yang dipantau (activation rate, churn rate) dan kenapa relevan (daftar event lengkap ada di modul opsional Analytics & Metrics Spec jika dibeli)
3. **Strategi Mengurangi Churn** — 2–3 taktik konkret sesuai jenis SaaS ini
4. **Model Ekspansi Revenue** — upsell/cross-sell yang masuk akal dari fitur yang sudah ada

## Jika `product_type = marketplace` → **"Trust & Transaction"**
1. **Cara Membangun Kepercayaan** — verifikasi, rating, review antar penjual-pembeli
2. **Aturan Transaksi & Komisi** — alur uang, kapan komisi diambil, kebijakan refund
3. **Penanganan Dispute** — alur ketika terjadi konflik penjual-pembeli
4. **Strategi Liquidity** — cara memastikan ada cukup penjual DAN pembeli di masa awal ("cold start" khas marketplace)

## Jika `product_type = mobile` → **"Store & Distribution"**
1. **Checklist App Store / Play Store** — hal wajib dipenuhi sebelum submit
2. **Strategi Offline-First** — data apa yang harus tetap tersedia tanpa koneksi internet
3. **Push Notification Strategy** — kapan dan untuk apa saja notifikasi dikirim
4. **Update & Versioning** — cara menangani user yang masih memakai versi app lama

## Jika `product_type = api` → **"API Reference"**
1. **Daftar Endpoint Lengkap** — method, path, parameter, response
2. **Autentikasi & Rate Limit** — cara developer lain melakukan autentikasi, batas pemakaian
3. **Contoh Kode (Request/Response)** — minimal 2 contoh skenario umum
4. **Error Code Convention** — daftar kode error dan artinya

## Jika `product_type = ecommerce` → **"Commerce Ops"**
1. **Manajemen Stok & Inventory** — cara sistem melacak ketersediaan produk
2. **Alur Pembayaran** — metode pembayaran yang didukung, penanganan pembayaran gagal
3. **Strategi Kurangi Keranjang Ditinggal** — reminder, insentif checkout
4. **Kebijakan Retur & Refund**

## Jika `product_type = ai-app` → **"AI Ops & Safety"**
1. **Pemantauan Biaya Token/API AI** — cara mencegah biaya AI membengkak tak terkendali
2. **Batasan Privasi Data** — data apa yang boleh/tidak boleh dikirim ke model AI (rujuk keputusan database vector di Architecture.md jika ada)
3. **Strategi Fallback** — apa yang terjadi jika model AI utama gagal merespons
4. **Evaluasi Kualitas Output AI** — cara memastikan output AI tetap relevan seiring waktu

## Jika `product_type = internal` → **"Adoption Runbook"**
1. **Strategi Adopsi Tim** — cara memastikan tim internal benar-benar memakai tool ini
2. **Integrasi dengan Sistem Lama** — sistem existing yang harus terhubung
3. **Training & Dokumentasi Internal** — materi onboarding untuk karyawan
4. **Support & Maintenance Internal** — siapa yang bertanggung jawab jika ada masalah

## Jika `product_type = portfolio` → **"Visibility Playbook"**
1. **Strategi SEO Dasar** — kata kunci, meta tag, struktur URL
2. **Strategi Personal Branding** — cara menonjolkan keahlian secara konsisten
3. **Call-to-Action** — hal yang diharapkan dilakukan pengunjung (hubungi, download CV, dll)

## Jika `product_type = other` → **"Catatan Peluncuran Umum"**
*Isi generik: checklist dasar sebelum diluncurkan, saran langkah selanjutnya berdasarkan freeText user.*

---

**Catatan implementasi:** Prompt builder WAJIB menerima `product_type` sebagai parameter penentu template. Context yang di-inject ke dokumen ini cukup blok YAML FEAT-ID dari PRD + ringkasan Architecture (bukan isi penuh) — tetap mengikuti cap token context Pro Max (8.000 token, lihat `00-overview.md` Bag. 2).
