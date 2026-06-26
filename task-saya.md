# Daftar Tugas Manual (To-Do List Owner)

Aplikasi Vibe Coding SaaS Anda (*ArroBuild*) secara sistematis sudah rampung 100% dari segi kode, logika, sinkronisasi UI harga, penegakan limit, hingga integrasi database.

Untuk membuat sistem ini benar-benar berjalan dan dapat menerima uang/koneksi AI di *production*, Anda hanya perlu melakukan hal-hal administratif di bawah ini:

### 1. Dapatkan & Masukkan API Key AI
Silakan daftar ke *platform* AI di bawah, dapatkan *API Key*-nya, dan masukkan ke dalam file `.env.local`:
- [ ] **Anthropic API Key** (Untuk Claude Sonnet, andalan fitur *Pro Max*)
  - Daftar di: [console.anthropic.com](https://console.anthropic.com/)
  - Masukkan ke `ANTHROPIC_API_KEY=`
- [ ] **OpenAI API Key** (Opsional, untuk opsi GPT-4o)
  - Daftar di: [platform.openai.com](https://platform.openai.com/)
  - Masukkan ke `OPENAI_API_KEY=`
- [ ] **DeepSeek API Key** (Opsional, untuk opsi DeepSeek V3)
  - Daftar di: [platform.deepseek.com](https://platform.deepseek.com/)
  - Masukkan ke `DEEPSEEK_API_KEY=`

*(Catatan: `GEMINI_API_KEY` saat ini sudah terisi dan dapat langsung digunakan sebagai mesin default)*

### 2. Atur Midtrans (Untuk Pembayaran)
Meskipun kodenya sudah ada di aplikasi, Anda wajib menyambungkan akun Midtrans Anda agar uang bisa masuk:
- [ ] **Ubah API Key Midtrans:** Masuk ke Dashboard Midtrans Anda -> Settings -> Access Keys. Salin *Server Key* dan *Client Key* milik Anda sendiri lalu timpa isinya pada variabel `MIDTRANS_SERVER_KEY` dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` di `.env.local`.
- [ ] **Pasang Webhook URL:** Di Dashboard Midtrans, buka menu Settings -> Configuration. Pada bagian **Payment Notification URL**, isi dengan:
  `https://domain-anda.com/api/payment/webhook`
  *(Ganti `domain-anda.com` dengan domain asli Anda saat deploy, atau gunakan `ngrok` jika ingin mengetes pembayaran saat masih di localhost)*

### 3. Pantau Batas Tagihan (Billing Limits)
- [ ] Buka platform Google AI, Anthropic, dan OpenAI, lalu **atur Hard Limit / Auto-recharge** agar kartu kredit Anda tidak membengkak tanpa sadar saat banyak pengguna menggunakan website Anda.
