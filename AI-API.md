# Dokumentasi & Konteks AI API ArroBuild

Dokumen ini berisi ringkasan arsitektur, alur kerja, dan kondisi terkini dari sistem AI API pada proyek ArroBuild. Dokumen ini dibuat sebagai referensi dan konteks dasar untuk melakukan pengembangan lanjutan, penyempurnaan, serta memaksimalkan kualitas dan keberlanjutan backend AI.

## 1. Arsitektur Utama

Sistem AI API di ArroBuild dibangun menggunakan **Next.js Route Handlers** dengan kapabilitas *streaming* menggunakan **Server-Sent Events (SSE)**. Sistem ini memiliki 4 komponen utama:

1. **API Endpoint (`src/app/api/generate/route.ts`)**
   - Menangani *request* `POST` dari *client*.
   - Memvalidasi input (Idea, Presets, Clarifications, Tier, dll) menggunakan **Zod**.
   - Mengecek *authorization*, *tier/quota* pengguna melalui integrasi Supabase.
   - Menyimpan *Project* awal ke database melalui **Prisma**.
   - Mengatur aliran data SSE ke *client* dan menyimpan setiap *file* yang selesai digenerasi ke database secara *real-time*.

2. **Orkestrator (`src/lib/ai/orchestrator.ts`)**
   - Mengelola eksekusi sekuensial (berurutan) dari berbagai dokumen (Context, PRD, Plan, Design System, Agents, dll).
   - Memastikan bahwa *output* dari dokumen sebelumnya (seperti PRD dan Context) digunakan sebagai konteks dasar untuk meng-generate dokumen berikutnya agar tetap kohesif.
   - Mengatur *retry mechanism* (dengan *exponential backoff*) dan mendeteksi apabila *output* terpotong (truncated) untuk membuat perintah lanjutan otomatis (*continuation prompt*).

3. **Generator (*Adapter*) (`src/lib/ai/generator.ts`)**
   - Menjadi jembatan yang menghubungkan ArroBuild dengan berbagai LLM Providers.
   - Mendukung 4 provider utama: **Google (Gemini)**, **OpenAI (GPT & DeepSeek via baseURL)**, dan **Anthropic (Claude)**.
   - Menangani pemanggilan *stream* per-provider dan menyeragamkan balasan beserta *finish reason*.

4. **Prompt Templates (`src/lib/ai/prompts/`)**
   - Berisi kumpulan instruksi spesifik untuk setiap jenis dokumen (*prd, plan, design-system, dll*).
   - `shared.ts` mengatur struktur tipe data, tipe konfigurasi model, limit token, dan fungsi *utility* (seperti `summarizeForContext`).

## 2. Alur Generasi (*Generation Flow*)

1. **Inisiasi**: *Client* mengirim payload konfigurasi yang berisi `idea`, `presets` (framework, design), tier, dll.
2. **Validasi & Database**: Server memvalidasi data dan membuat rekaman `Project` di DB dengan status `GENERATING`.
3. **Streaming Dimulai**: Server membuka koneksi SSE. Status `project_created` langsung dikirim.
4. **Proses Sekuensial (Orkestrator)**: 
   - Sistem akan menyusun urutan dokumen yang harus digenerasi (selalu mendahulukan *Context* sebelum *PRD*).
   - Menggunakan *looping*, AI akan meng-generate *file* satu per satu.
   - *Chunk* data teks di-stream langsung ke *client* secara statis tanpa menunda (*real-time*).
   - Saat satu *file* selesai (`file_done`), teks penuhnya dimasukkan ke DB (`GeneratedFile`), lalu dirangkum dan dimasukkan ke dalam variabel `AccumulatedContext` untuk pembuatan *file* selanjutnya.
5. **Penyelesaian**: Setelah semua *file* selesai, status project diubah menjadi `DONE` (atau `FAILED` jika ada error fatal yang melewati batas maksimal percobaan).

## 3. Konfigurasi Model yang Tersedia

Secara *default*, sistem membedakan akses berdasarkan `UserTier` (Free, Paid, Unlimited). Daftar model yang di dukung saat ini (didefinisikan di `MODEL_OPTIONS`):
- **Gemini 2.5 Flash** (`gemini-2.5-flash`) - Default untuk Free Tier.
- **DeepSeek V3** (`deepseek-chat`)
- **Gemini 2.5 Pro** (`gemini-2.5-pro`) - Default untuk Paid Tier.
- **GPT-4o** (`gpt-4o`)
- **Claude Sonnet 4** (`claude-sonnet-4-20250514`)

## 4. Analisis & Peluang Penyempurnaan (Untuk Pengembangan Selanjutnya)

Untuk menjadikan AI API ini lebih *scalable*, persisten, dan *perfect*, beberapa ide yang dapat dieksplorasi di sesi pengembangan bersama AI berikutnya:

1. **Manajemen Konteks yang Lebih Cerdas (RAG / Vector)**
   - *Saat ini*: Menggunakan fungsi `summarizeForContext` dengan logika pemotongan teks sederhana berbasis jumlah karakter dan heading.
   - *Peluang*: Seiring bertambahnya dokumen, konteks akan membengkak atau kehilangan inti penting. Bisa di-upgrade menggunakan pendekatan pemeringkatan *chunk* atau ringkasan LLM (*LLM Summarizer loop*).

2. **Decoupling Orchestrator & Error Recovery**
   - *Saat ini*: `orchestrator.ts` sangat tebal (menangani *prompting*, *context state*, koneksi stream, dan retry error).
   - *Peluang*: Memisahkan *state machine* ke dalam *class* atau *module* terpisah. Mengimplementasikan **Fallback Model Strategy** (Contoh: Jika Anthropic error/timeout 429 berulang kali, otomatis pindah ke OpenAI GPT-4o untuk menyelamatkan proses).

3. **Database Write Asynchrony (Non-blocking)**
   - *Saat ini*: Penyimpanan dokumen ke DB dilakukan di dalam iterasi *looping* stream. Walaupun menggunakan `.catch()`, proses `await prisma.generatedFile.create` bisa melambatkan atau mengunci proses berantai jika koneksi database sedang berat.
   - *Peluang*: Menggunakan *message queue* sederhana, Webhooks, atau *background job* / *serverless functions* terpisah untuk menyimpan *state* tanpa memblokir SSE Stream.

4. **Kualitas Prompt & Validation Logic**
   - *Saat ini*: Terdapat `validateGeneratedContent` di file terpisah (`validation.ts`).
   - *Peluang*: Menambahkan sistem evaluasi kualitas output terintegrasi (misal: "Self-Reflection" step oleh model sebelum dokumen final dikirim).

5. **Isolasi Lingkungan Pengujian (Testing)**
   - API streaming kompleks dengan pihak ketiga rentan gagal di *production*. Perlu ada *mock layer* pada `generator.ts` untuk memfasilitasi E2E *Testing* dari *frontend* ke *backend*.

---
**Gunakan dokumen ini sebagai *prompt context* untuk instruksi berikutnya kepada AI agar dapat merancang pembaruan kode API secara aman, modular, dan efisien.**
