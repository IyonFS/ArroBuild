import type { LearningPath } from "../types";
import { buildLessonBlocks } from "../build-lesson";

export const vibeCodingFundamentals: LearningPath = {
  slug: "vibe-coding-fundamentals",
  status: "published",
  title: "Vibe Coding Fundamentals",
  description:
    "Pahami mindset, pembagian peran, pilihan tool, dan siklus kerja dasar membangun software bersama AI agent.",
  level: "pemula",
  estimasi: "35 menit",
  tag: "Gratis",
  icon: "foundation",
  track: "foundation",
  featured: true,
  objective:
    "Membangun mental model yang sehat: manusia menentukan intent dan kualitas, sedangkan AI mempercepat eksplorasi serta implementasi.",
  prerequisites: [],
  outcome:
    "Kamu bisa memilih tool awal dan menyelesaikan satu iterasi fitur kecil dengan brief, review, dan acceptance criteria yang jelas.",
  lessons: [
    {
      slug: "apa-itu-vibe-coding",
      title: "Apa itu Vibe Coding?",
      estimasi: "8 menit",
      outcome:
        "Kamu bisa menjelaskan vibe coding dan menulis brief fitur dengan tujuan, konteks, batasan, serta ukuran selesai.",
      blocks: buildLessonBlocks({
        outcome:
          "Setelah lesson ini, kamu dapat mengubah satu ide kabur menjadi brief empat bagian yang bisa dikerjakan dan diperiksa.",
        coreConcept:
          "Vibe coding adalah cara membangun software dengan memberi arah kepada AI menggunakan bahasa natural, lalu menilai hasilnya melalui kode dan perilaku aplikasi. Kecepatannya datang dari loop yang singkat, bukan dari menerima semua output AI. Kamu tetap memegang intent produk, keputusan penting, dan standar kualitas.",
        corePoints: [
          "**Tujuan:** jelaskan perubahan yang harus dirasakan pengguna, bukan hanya nama fitur.",
          "**Konteks:** sebutkan bagian aplikasi, stack, dan perilaku yang sudah ada.",
          "**Batasan:** nyatakan hal yang tidak boleh rusak, termasuk data, keamanan, dan kompatibilitas.",
          "**Ukuran selesai:** tulis acceptance criteria yang dapat diamati atau diuji.",
        ],
        workedExample: {
          heading: "Dari permintaan kabur ke brief terukur",
          language: "markdown",
          content: `# Terlalu kabur
Buat halaman login yang bagus.

# Lebih terarah
Tujuan: pengguna dapat masuk dengan email dan password.
Konteks: aplikasi Next.js sudah memakai Supabase Auth.
Batasan: pertahankan route callback dan pesan error berbahasa Indonesia.
Selesai jika:
- input memiliki label yang dapat diakses;
- error kredensial tampil tanpa membocorkan detail internal;
- login berhasil mengarah ke /dashboard;
- lint dan test auth lulus.`,
        },
        practiceTask:
          "Pilih satu fitur kecil dari project-mu. Tulis empat baris berjudul Tujuan, Konteks, Batasan, dan Selesai jika. Pastikan minimal dua acceptance criteria dapat kamu cek langsung di browser atau lewat test.",
        pitfalls: [
          "Meminta AI membuat seluruh aplikasi sekaligus sehingga perubahan sulit direview.",
          "Menganggap output yang terlihat rapi pasti benar secara data, aksesibilitas, dan keamanan.",
          "Memberi instruksi tanpa menyebut perilaku lama yang harus dipertahankan.",
        ],
        tip: "Jika kamu belum bisa menuliskan ukuran selesai, kecilkan scope fitur sampai hasilnya dapat diverifikasi dalam satu sesi.",
        cta: { label: "Susun blueprint idemu di ArroBuild →", href: "/generate" },
      }),
    },
    {
      slug: "peran-arsitek-dan-eksekutor",
      title: "Peran Arsitek dan Eksekutor",
      estimasi: "8 menit",
      outcome:
        "Kamu tahu keputusan mana yang harus tetap dipegang manusia dan pekerjaan mana yang aman didelegasikan ke AI.",
      blocks: buildLessonBlocks({
        outcome:
          "Setelah lesson ini, kamu dapat membagi satu task menjadi keputusan arsitektur, pekerjaan eksekusi, dan checkpoint review.",
        coreConcept:
          "Dalam kolaborasi dengan AI, kamu berperan sebagai arsitek sekaligus reviewer: menetapkan masalah, trade-off, batas perubahan, dan bukti bahwa hasilnya benar. AI berperan sebagai eksekutor cepat yang dapat membaca codebase, menawarkan opsi, menulis patch, dan menjalankan pemeriksaan. Delegasikan pekerjaan, bukan tanggung jawab.",
        corePoints: [
          "**Manusia memutuskan:** tujuan bisnis, risiko yang dapat diterima, data sensitif, dan trade-off produk.",
          "**AI membantu:** eksplorasi codebase, implementasi terarah, test boilerplate, dan rangkuman dampak.",
          "**Checkpoint bersama:** sebelum edit, setelah patch, dan setelah test—pastikan scope tidak melebar diam-diam.",
          "**Bukti lebih penting dari keyakinan:** minta diff, test result, atau reproduksi yang dapat kamu periksa.",
        ],
        workedExample: {
          heading: "Pembagian peran untuk fitur reset password",
          language: "markdown",
          content: `Keputusan manusia:
- reset hanya melalui tautan sekali pakai;
- pesan UI tidak boleh mengungkap apakah email terdaftar;
- sesi lama dicabut setelah password berubah.

Delegasi ke AI:
- petakan route dan komponen auth yang ada;
- implementasikan form tanpa mengubah callback lama;
- tambah test untuk token invalid dan sukses;
- laporkan file berubah serta hasil lint/test.

Checkpoint review:
- cek redirect, pesan error, dan aturan session;
- baca diff sebelum merge.`,
        },
        practiceTask:
          "Ambil task yang sedang kamu kerjakan. Buat tiga kolom: Keputusan Saya, Delegasi ke AI, dan Bukti yang Harus Ada. Isi minimal dua item per kolom, lalu hapus delegasi yang tidak punya bukti verifikasi.",
        pitfalls: [
          "Membiarkan AI memilih kebijakan produk atau keamanan tanpa konteks yang cukup.",
          "Mereview hanya tampilan akhir tanpa membaca perubahan data flow dan error path.",
          "Terus menambah prompt koreksi ketika task seharusnya dipecah menjadi scope yang lebih kecil.",
        ],
        warning:
          "Untuk auth, pembayaran, permission, migrasi data, dan operasi destruktif, selalu lakukan review manusia dan uji jalur gagal sebelum merilis.",
        cta: { label: "Dokumentasikan keputusan produk →", href: "/generate" },
      }),
    },
    {
      slug: "ekosistem-tools-ai-coding",
      title: "Ekosistem Tools AI Coding",
      estimasi: "10 menit",
      outcome:
        "Kamu bisa memilih kategori tool pertama berdasarkan jenis pekerjaan, kebutuhan konteks, dan tingkat kontrol.",
      blocks: buildLessonBlocks({
        outcome:
          "Setelah lesson ini, kamu dapat memilih satu setup awal tanpa menumpuk tool yang fungsinya sama.",
        coreConcept:
          "Tool AI coding berbeda terutama pada tempat kerja, jumlah konteks yang dapat dibaca, dan tingkat tindakan yang bisa dilakukan. Mulailah dari workflow yang paling sederhana untuk task-mu. Tambahkan tool baru hanya ketika ada batas nyata yang dapat kamu sebutkan.",
        corePoints: [
          "**Chat AI:** cocok untuk memahami konsep, membandingkan opsi, dan menyiapkan brief tanpa akses langsung ke repo.",
          "**Editor dengan AI:** cocok untuk perubahan lokal saat kamu ingin melihat file dan diff sambil bekerja.",
          "**CLI coding agent:** cocok untuk task repo yang membutuhkan pencarian, edit multi-file, dan menjalankan command.",
          "**Blueprint/documentation layer:** menjaga tujuan, keputusan, dan aturan project tetap konsisten lintas sesi serta tool.",
        ],
        workedExample: {
          heading: "Rubrik memilih setup pertama",
          language: "markdown",
          content: `Task: memperbaiki validasi satu form
Pilihan: editor dengan AI
Alasan: scope lokal, diff perlu dilihat cepat, test dapat dijalankan dari terminal.

Task: memetakan arsitektur repo yang belum dikenal
Pilihan: CLI coding agent + dokumentasi project
Alasan: perlu pencarian lintas file dan catatan keputusan yang bertahan antar sesi.

Task: membandingkan dua pendekatan database
Pilihan: chat AI terlebih dahulu
Alasan: masih tahap eksplorasi; belum perlu memberi akses tulis ke repo.`,
        },
        practiceTask:
          "Tuliskan tiga task terdekat di project-mu. Untuk tiap task, pilih satu kategori tool, sebutkan konteks yang dibutuhkan, tindakan yang diizinkan, dan bagaimana kamu akan memeriksa hasilnya.",
        pitfalls: [
          "Menggunakan beberapa agent pada file yang sama tanpa pembagian ownership yang jelas.",
          "Memberi akses repo penuh untuk pertanyaan yang cukup dijawab melalui potongan konteks kecil.",
          "Berpindah tool karena tren, bukan karena bottleneck workflow yang terukur.",
        ],
        tip: "Setup terbaik adalah yang membuat perubahan mudah dipahami, diuji, dan dibatalkan—bukan yang menghasilkan kode paling banyak.",
        cta: { label: "Lihat format integrasi ArroBuild →", href: "/integrations" },
      }),
    },
    {
      slug: "iterasi-pertama",
      title: "Iterasi Pertama dengan AI",
      estimasi: "9 menit",
      outcome:
        "Kamu menyelesaikan satu siklus brief, implementasi, review, perbaikan, dan verifikasi untuk fitur kecil.",
      blocks: buildLessonBlocks({
        outcome:
          "Setelah lesson ini, kamu punya satu perubahan kecil yang lolos acceptance criteria dan quality gate project.",
        coreConcept:
          "Iterasi yang sehat bergerak dalam unit terkecil yang masih memberi nilai: pahami state sekarang, tetapkan satu perubahan, buat patch, periksa dampak, lalu verifikasi. Jika hasil belum benar, koreksi berdasarkan bukti spesifik—bukan dengan prompt seperti 'buat lebih bagus'.",
        corePoints: [
          "**Observe:** baca perilaku sekarang, file terkait, dan aturan project.",
          "**Brief:** nyatakan satu outcome beserta batas scope dan acceptance criteria.",
          "**Implement:** izinkan perubahan sekecil mungkin yang memenuhi brief.",
          "**Review:** cek diff, jalur gagal, aksesibilitas, keamanan, dan perubahan tak terkait.",
          "**Verify:** jalankan lint/test/build yang proporsional lalu cek perilaku utama di UI.",
        ],
        workedExample: {
          heading: "Prompt satu iterasi",
          language: "markdown",
          content: `Analisis komponen form newsletter yang ada.

Ubah hanya perilaku submit agar:
1. email kosong atau invalid ditolak di client;
2. tombol disabled selama request;
3. sukses dan gagal memberi feedback yang dapat dibaca screen reader.

Jangan mengubah layout atau provider email.
Sebelum edit, sebutkan file yang akan disentuh.
Setelah edit, jalankan lint dan test terkait lalu laporkan hasilnya.`,
        },
        practiceTask:
          "Pilih perbaikan yang bisa selesai dalam 20 menit. Tulis brief seperti contoh, jalankan satu iterasi bersama AI, lalu catat: file berubah, satu temuan review, satu koreksi, dan hasil quality gate.",
        pitfalls: [
          "Menggabungkan refactor, fitur, dan perubahan visual dalam satu iterasi tanpa kebutuhan.",
          "Mengulang prompt dari nol tanpa menunjukkan error, diff, atau perilaku yang salah.",
          "Berhenti setelah UI terlihat benar tetapi lint, test, atau build belum dijalankan.",
        ],
        tip: "Simpan brief dan hasil verifikasi. Keduanya menjadi konteks berkualitas untuk iterasi berikutnya.",
        cta: { label: "Mulai dari brief produk terstruktur →", href: "/generate" },
      }),
    },
  ],
};
