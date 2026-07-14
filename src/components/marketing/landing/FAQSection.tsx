"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "Apa bedanya ArroBuild dengan ChatGPT biasa?",
    a: "ChatGPT menghasilkan teks generik berdasarkan prompt tunggal. ArroBuild membuat dokumen yang saling terhubung lewat sistem FEAT-ID — setiap fitur yang kamu tulis di PRD otomatis direferensi di Architecture, Design System, dan Agent Rules. Hasilnya bukan sekadar teks, tapi konteks yang bisa langsung dibaca AI coding tool kamu.",
  },
  {
    q: "Apakah file yang dihasilkan bisa langsung dipakai di Cursor/Claude Code?",
    a: "Ya. Output ArroBuild dirancang spesifik untuk paste langsung ke root proyek. Cursor akan membaca CLAUDE.md dan agent-rules.md secara otomatis, Claude Code membaca AGENTS.md, Windsurf membaca .windsurfrules. Tidak ada modifikasi manual yang dibutuhkan.",
  },
  {
    q: "Apakah data proyek saya aman?",
    a: "Deskripsi proyek hanya digunakan untuk generate dokumen saat itu. Kami tidak menggunakan data kamu untuk melatih model atau berbagi ke pihak ketiga. Setiap proyek tersimpan di akun kamu dan bisa dihapus kapan saja.",
  },
  {
    q: "Bisa coba sebelum bayar?",
    a: "Bisa. Kamu bisa explore Mini Tools, Learn Hub, hingga mengisi seluruh form spesifikasi proyek (Step 0-4) sepenuhnya gratis. Paywall (kredit) baru akan diminta di akhir saat kamu siap melakukan generate dokumen AI.",
  },
  {
    q: "Metode pembayaran apa yang didukung?",
    a: "Pembayaran diproses via Midtrans. Mendukung transfer bank (BCA, BRI, Mandiri, BNI), virtual account, GoPay, OVO, Dana, dan kartu kredit/debit Visa/Mastercard.",
  },
  {
    q: "Bagaimana kalau dokumen yang dihasilkan tidak sesuai ekspektasi?",
    a: "Kamu bisa melakukan revisi / regenerate pada fitur yang spesifik tanpa harus bayar / generate ulang semuanya. Paket Prime bahkan memberikan revisi unlimited.",
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="faq"
      style={{
        background: "var(--lp-bg-surface)",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 800,
            fontSize: "clamp(22px, 3vw, 32px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--lp-text-primary)",
            margin: "0 0 40px",
          }}
        >
          Pertanyaan yang sering muncul.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                borderBottom: "0.5px solid var(--lp-border-default)",
              }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "20px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 14,
                    fontWeight: openIdx === i ? 700 : 500,
                    color: openIdx === i ? "var(--lp-text-primary)" : "var(--lp-text-secondary)",
                    lineHeight: 1.5,
                    transition: "color 0.15s",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {item.q}
                </span>
                <motion.span
                  animate={{ rotate: openIdx === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    color: openIdx === i ? "var(--lp-amber)" : "var(--lp-text-tertiary)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        paddingBottom: 20,
                        borderLeft: "2px solid var(--lp-amber)",
                        paddingLeft: 16,
                        marginLeft: 0,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: 13,
                          color: "var(--lp-text-secondary)",
                          margin: 0,
                          lineHeight: 1.85,
                          maxWidth: 520,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {item.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
