# Stack Advisor — Knowledge Base v1

**Status:** Siap dipakai sebagai basis data Stack Advisor
**Prinsip:** AI Stack Advisor **cuma boleh memilih dari isi dokumen ini** — tidak mengarang rekomendasi dari training data sendiri. Update dokumen ini secara berkala (target: tiap 2-3 bulan) supaya rekomendasinya tidak basi.

---

## 1. Paket per Tipe Produk

Reuse dari 7 "Rakitan Siap Pakai" yang sudah ada di Generate Flow Step 3, ditambah estimasi biaya bulanan riil:

| Paket | Isi | Estimasi biaya/bulan (traffic kecil-menengah) | Cocok untuk |
|---|---|---|---|
| ⚡ Modern Fullstack | Next.js + TypeScript + PostgreSQL + Supabase + Tailwind + Framer Motion + Vercel | ~$0-25 (Vercel Hobby/free + Supabase free tier di awal) | SaaS, startup cepat |
| 🏛️ Classic Reliable | Laravel + PHP + MySQL + Tailwind + VPS tradisional | ~Rp100-300rb (VPS lokal) | Internal Tool, tim familiar PHP |
| 🤖 AI-Native Stack | Next.js + FastAPI/Python + pgvector + Vercel/Railway | ~$5-30 | AI-Powered App |
| 📱 Mobile Cross-platform | Expo + TypeScript + Firebase + Lottie | ~$0-25 (Firebase Spark/Blaze awal) | Mobile App |
| 🛍️ Marketplace Ready | Next.js + PostgreSQL + Redis + Supabase Auth | ~$10-45 | Marketplace, E-commerce |
| 🎨 Portfolio Cepat | Astro + Tailwind + Vercel, tanpa database | $0 (Vercel Hobby cukup) | Portfolio/Personal Site |
| 🛠️ Rakit Sendiri | — | Tergantung pilihan | Power user |

---

## 2. Provider AI (Kalau Proyek Butuh AI Feature)

Reuse langsung dari riset stack ArroBuild sendiri — bukan rekomendasi terpisah, karena ini benar-benar data yang sudah divalidasi:

| Kelas kebutuhan | Model | Penyedia | Kenapa |
|---|---|---|---|
| Murah, task ringan | DeepSeek V4 Flash | DeepSeek langsung | Murah, kualitas layak untuk task sederhana |
| Seimbang | MiMo-V2.5-Pro / GLM-4.6 | OpenRouter | Satu integrasi, banyak pilihan model, harga jauh lebih murah dari model Barat setara |
| Kualitas tinggi, biaya terkontrol | GLM-5.2 / Qwen3.7-Max | OpenRouter | Mendekati performa flagship Barat, harga jauh di bawahnya |
| Butuh reasoning/vision terbaik | Gemini 3.1 Pro | Google AI Studio langsung | Kualitas reasoning tertinggi, tapi mahal — pakai selektif |

**Catatan penting untuk vision/multimodal:** Tidak semua model "flagship" punya vision — GLM-5.2 dan Qwen3.7-Max text-only. Untuk kebutuhan gambar, pakai **Qwen3-VL-235B-A22B-Instruct** (juga via OpenRouter).

---

## 3. Hosting & Deploy

| Provider | Harga mulai | Kekuatan | Trade-off |
|---|---|---|---|
| **Vercel** | $0 (Hobby) → $20/seat (Pro) | Zero-config untuk Next.js, edge network kelas dunia, DX terbaik | Mahal kalau full-stack dengan banyak background job/websocket persisten |
| **Railway** | $5/bulan (termasuk $5 usage) | Usage-based, bagus untuk full-stack + database, scale-to-zero | Komunitas lebih kecil dari Vercel |
| **Render** | $7/service/bulan | Harga prediktable, Postgres/Redis managed bagus, cocok background worker | Free tier auto-sleep 15 menit idle |
| **Niagahoster VPS** (Indonesia) | Rp104rb-630rb/bulan | Lokal, support Bahasa Indonesia, murah untuk traffic kecil | Perlu setup manual (bukan zero-config), tidak ada CDN edge global |
| **IDCloudHost VPS** (Indonesia) | Rp100rb/bulan ke atas | Data center Indonesia (latensi rendah untuk user lokal), harga transparan (bukan trik promo-lalu-naik) | Kebijakan refund cuma 10 hari |

**Pola 2026 yang umum dipakai:** hybrid — Vercel untuk frontend, Railway/Render untuk backend yang butuh proses persisten. Ini pola yang sama dipakai ArroBuild sendiri.

> [!WARNING]
> Hindari hosting promo di bawah Rp10rb/bulan — harga perpanjangan biasanya 3-5× lebih mahal dari harga awal. Selalu hitung biaya 2-3 tahun, bukan cuma harga tahun pertama.

---

## 4. Database

| Kategori | Opsi | Cocok untuk |
|---|---|---|
| Relational | PostgreSQL, MySQL, SQLite | Marketplace, E-commerce, Internal Tool |
| Document/NoSQL | MongoDB | Content-heavy app |
| Cache/Realtime | Redis | Session, cache, rate limit |
| Backend-as-a-Service | Supabase, Firebase, PlanetScale, Turso | Mobile realtime, SaaS solo developer |
| Vector | pgvector, Pinecone, Weaviate, Qdrant | AI-Powered App |

---

## 5. Estimasi Total Stack — 3 Skenario Budget

**Hemat (~Rp150-400rb/bulan):**
Next.js + Supabase (free tier) + Niagahoster VPS untuk backend ringan + DeepSeek V4 Flash untuk AI feature

**Menengah (~Rp700rb-1,5jt/bulan):**
Next.js di Vercel Hobby/Pro awal + Railway untuk backend+DB + OpenRouter (GLM/MiMo) untuk AI feature

**Mapan (~Rp2-4jt/bulan):**
Vercel Pro + Railway/Render Production tier + Gemini 3.1 Pro untuk fitur AI premium

---

## 6. Aturan Update

- Review tiap 2-3 bulan minimum — harga hosting dan AI API berubah cepat
- Kalau ada provider baru yang relevan (Chinese lab model baru, PaaS baru), tambahkan ke tabel yang sesuai, bukan bikin kategori baru tanpa alasan kuat
- Setiap rekomendasi yang keluar dari Stack Advisor harus bisa ditelusuri ke baris spesifik di dokumen ini
