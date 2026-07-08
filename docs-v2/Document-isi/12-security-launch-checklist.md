# Template Modul Opsional: Security & Launch Checklist

> **Tersedia di tier:** Pro Max saja
> **Kelas model:** Flagship (Claude Sonnet)
> **Token budget:** 5.000
> **Kredit:** 175
> **Paling relevan untuk:** Semua tipe, terutama SaaS, Marketplace, E-commerce
> **Format:** Checklist P0/P1/P2, bukan prose panjang — lebih actionable dan lebih hemat token dibanding format lama (`production-hardening.md` versi sebelumnya).

---

## 1. Security Checklist
*Tiap item wajib ditandai relevan/tidak ke `FEAT-ID` tertentu — jangan generate checklist generik yang tidak terkait fitur nyata di proyek ini.*

- [ ] **P0** — Rate limiting di endpoint autentikasi (terkait: fitur login/signup)
- [ ] **P0** — Data sensitif (kartu pembayaran, password) tidak disimpan dalam bentuk mentah (terkait: FEAT-ID fitur pembayaran/auth jika ada)
- [ ] **P1** — Validasi input di semua form yang menerima data dari user
- [ ] **P1** — HTTPS wajib di semua environment, termasuk staging
- [ ] **P2** — Audit log untuk aksi sensitif (perubahan role, perubahan data pembayaran)

*(AI melanjutkan daftar ini menyesuaikan fitur aktual dari PRD — bukan daftar generik OWASP Top 10 yang tidak dikontekstualisasi.)*

## 2. Pre-Launch Checklist
- [ ] Domain & SSL aktif
- [ ] Backup database otomatis terjadwal
- [ ] Monitoring/error tracking aktif (contoh: Sentry)
- [ ] Environment variable production terpisah dari development

## 3. Scale Readiness
> *Section ini HANYA digenerate jika `stage = production` atau user menandai ekspektasi traffic tinggi di form. Untuk `stage = idea`/`prototype`, lewati section ini sepenuhnya — tidak relevan dan hanya membuang token.*

- [ ] **P1** — Index database untuk query yang sering dipanggil (rujuk tabel di `02-architecture.md`)
- [ ] **P2** — Caching layer untuk endpoint yang paling sering diakses

## 4. Dasar Incident Response
- [ ] Siapa yang dihubungi/bertindak jika terjadi insiden (relevan untuk solo developer: catat prosedur minimal, bukan tim besar)
- [ ] Rencana rollback jika deployment baru bermasalah

---

**Catatan implementasi:** Checklist harus dihasilkan sebagai daftar tercentang (`- [ ]`) bukan paragraf — ini yang membuatnya bisa langsung dipakai developer, dan jauh lebih hemat token dibanding prose untuk cakupan yang sama.
