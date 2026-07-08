# Template: Design System — v2, terintegrasi

> **Tipe dokumen:** Wajib (Core Module) — dokumen #3
> **Tersedia di tier:** Pro, Pro Max saja (Starter tidak dapat dokumen ini)
> **Kelas model:** Pro → Menengah (Gemini 2.5 Pro) | Pro Max → Menengah (Gemini 2.5 Pro)
> **Token budget:** Pro 3.000 | Pro Max 5.000
> **Kredit (default mix):** Pro 72 | Pro Max 120
> **Catatan:** Pro Max sengaja tetap pakai kelas Menengah (bukan Flagship) — dokumen ini kombinatorial dari preset desain, tidak butuh reasoning tinggi, jadi tidak perlu model mahal.

---

## 1. Palet Warna
```css
:root {
  --color-primary: #...;
  --color-secondary: #...;
  --color-success: #...;
  --color-error: #...;
  --color-background: #...;
  --color-text: #...;
}
```

## 2. Tipografi
| Elemen | Font | Ukuran | Weight |
|---|---|---|---|
| Heading 1 | ... | ... | ... |
| Heading 2 | ... | ... | ... |
| Body | ... | ... | ... |

## 3. Komponen Dasar
```css
.button-primary { ... }
.card { ... }
.input-field { ... }
```
> 🔒 **Pro Max saja:** tambahkan varian state (hover, active, disabled, loading) untuk tiap komponen, dan token khusus mode gelap (dark mode).

## 4. Spasi & Layout Grid
*Skala spasi (4px/8px system), lebar container, breakpoint responsif.*

## 5. Animasi & Motion *(section baru, kontekstual)*
*Section ini HANYA muncul jika `product_type` termasuk: saas, mobile, ecommerce, portfolio, ai-app. Disembunyikan total untuk `api` dan `internal` — jangan digenerate kalau tidak relevan, ini menghemat token dan mencegah dokumen terasa penuh section yang tidak perlu.*

| Elemen | Library/Pendekatan yang dipilih | Kegunaan |
|---|---|---|
| Transisi halaman | `{{animationLibrary}}` | ... |
| Micro-interaction | ... | ... |

> Jika `animationLibrary = "Biarkan AI pilih"`, AI wajib merekomendasikan 1 opsi (Framer Motion / GSAP / Lottie / Rive / CSS-only) berdasarkan `product_type` dan platform (mobile cenderung ke Lottie/Rive, web ke Framer Motion/GSAP).

---

**Catatan implementasi:**
- Dokumen ini TIDAK bergantung pada `product_type` untuk Bagian 1-4 (murni bergantung `design_preset` dari Step 3) — hanya Bagian 5 (Animasi) yang kontekstual per tipe.
- Jika user mengisi `designReferenceNote` (field "Punya referensi sendiri?" di form-flow v2 Bag. 2.5), perlakukan sebagai catatan konteks tambahan saja — **bukan** hasil scraping otomatis. Ekstraksi desain dari URL adalah scope mini tool terpisah (Design Reference Scraper), jangan dibangun dua kali di sini.
