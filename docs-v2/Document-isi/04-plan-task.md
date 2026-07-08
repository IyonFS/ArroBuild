# Template: Plan / Task (Roadmap) — v2, terintegrasi

> **Tipe dokumen:** Wajib (Core Module) — dokumen #4
> **Tersedia di tier:** Starter, Pro, Pro Max
> **Kelas model:** Starter → Hemat (DeepSeek V4 Flash) | Pro → Hemat (DeepSeek V4 Flash) | Pro Max → Menengah (Gemini 2.5 Pro)
> **Token budget:** Starter 2.000 | Pro 3.000 | Pro Max 5.000
> **Kredit (default mix):** Starter 2 | Pro 3 | Pro Max 120
> **Catatan:** Pro Max sengaja "hanya" naik ke kelas Menengah (bukan Flagship) — dokumen ini bersifat templat + kalkulasi jadwal, tidak butuh reasoning mahal meski di tier tertinggi.

---

## 1. Pembagian Fase
| Fase | Fokus Utama | Fitur Terkait (FEAT-ID) | Estimasi Waktu |
|---|---|---|---|
| Fase 1 | Fitur inti (MVP) | FEAT-001, FEAT-002 | ... |
| Fase 2 | Penyempurnaan | FEAT-003 | ... |

> ⚪ **Starter:** cukup sampai di sini (Bagian 1 saja).

## 2. Urutan Pengerjaan & Ketergantungan
*Urutan detail per fase, tandai fitur mana yang harus selesai duluan karena fitur lain bergantung padanya.*
> 🔷 **Pro ke atas.**

## 3. Estimasi Biaya Operasional
*Perkiraan biaya hosting & API pihak ketiga per fase.*
> 🔷 **Pro ke atas.**

| Fase | Item Biaya | Estimasi/bulan |
|---|---|---|
| Fase 1 | Hosting + DB tier gratis | $0 |
| Fase 2 | + API AI, storage tambahan | $... |

## 4. Breakdown Sprint/Minggu
> 🔒 **Pro Max saja:** pecah tiap fase jadi breakdown per sprint/minggu.

---

**Catatan implementasi:** Dokumen ini murni jadwal & prioritas. Keputusan teknis (skema database, struktur folder) ada di `02-architecture.md` — jangan tulis ulang di sini untuk menghindari duplikasi.
