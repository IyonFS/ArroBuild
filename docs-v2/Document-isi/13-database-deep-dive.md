# Template Modul Opsional: Database Deep-Dive

> **Tersedia di tier:** Pro Max saja
> **Kelas model:** Flagship (Claude Sonnet)
> **Token budget:** 4.500
> **Kredit:** 158
> **Paling relevan untuk:** Marketplace, E-commerce, Internal Tool (data kompleks, banyak entitas & relasi)

> [!WARNING]
> **Ini perluasan, bukan pengganti:** `02-architecture.md` Bagian 2 sudah berisi skema database dasar. Dokumen ini **memperluas** untuk entitas kompleks yang tidak tercakup di sana — jangan tulis ulang tabel yang sudah ada di Architecture.md, cukup rujuk dan tambahkan yang belum dibahas.

---

## 1. Entitas Tambahan yang Belum Dibahas di Architecture.md
*Tabel-tabel pendukung yang biasanya luput di skema dasar: tabel riwayat/log, tabel relasi many-to-many, tabel status/state machine.*

```
Tabel: {{nama_tabel}}
- ...
→ Mendukung: FEAT-00X
→ Melengkapi tabel "{{nama_tabel_dasar}}" dari 02-architecture.md
```

## 2. Diagram Relasi Lengkap
*Mermaid ER diagram yang mencakup SEMUA tabel (dasar dari Architecture.md + tambahan di atas), supaya ada 1 gambar utuh.*

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    ...
```

## 3. Strategi Indexing
*Kolom mana yang butuh index, dan kenapa — dikaitkan dengan pola query yang paling sering terjadi di fitur utama.*

| Tabel | Kolom | Jenis Index | Alasan |
|---|---|---|---|
| ... | ... | ... | Query ini dipanggil setiap kali fitur FEAT-00X diakses |

## 4. Aturan Integritas Data
*Constraint yang wajib ada — foreign key, cascade delete/update, unique constraint gabungan.*

## 5. Strategi Pertumbuhan Data & Arsip
*Untuk tabel yang volumenya akan terus bertambah (transaksi, log aktivitas): kapan data lama perlu diarsipkan/dipindah, supaya performa tidak menurun seiring waktu.*

---

**Catatan implementasi:** Dokumen ini butuh context dari `02-architecture.md` (bukan generate dari nol) — pastikan prompt builder mengirim skema dasar dari Architecture.md sebagai referensi, supaya tidak terjadi duplikasi atau kontradiksi skema.
