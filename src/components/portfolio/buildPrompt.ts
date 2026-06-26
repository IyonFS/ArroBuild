// Portfolio Prompt Generator — builds a complete prompt from form data

import type {
  PortfolioFormState,
  ColorTheme,
  FontPair,
} from "./types";
import {
  COLOR_THEMES,
  FONT_PAIRS,
} from "./types";

export function buildPortfolioPrompt(state: PortfolioFormState): string {
  const { identitas, konten, design } = state;

  // Resolve color theme
  let bg: string, primary: string, text: string;
  if (design.themeId === "custom") {
    bg = design.customBg || "#0A0A0A";
    primary = design.customPrimary || "#CCFF00";
    text = design.customText || "#FFFFFF";
  } else {
    const theme = COLOR_THEMES.find((t) => t.id === design.themeId) ?? COLOR_THEMES[0];
    bg = theme.bg;
    primary = theme.primary;
    text = theme.text;
  }

  // Resolve font pair
  const fontPair = FONT_PAIRS.find((f) => f.id === design.fontPairId) ?? FONT_PAIRS[0];
  const fontDesc =
    fontPair.id === "ai-pick"
      ? "Pilihkan font yang paling sesuai dengan profesi dan suasana visual yang diminta"
      : `${fontPair.display} untuk heading, ${fontPair.body} untuk body text (import keduanya via Google Fonts CDN)`;

  // Profesi label
  const profesiLabel =
    identitas.profesi === "lainnya"
      ? identitas.profesiCustom || "Creative Professional"
      : identitas.profesi;

  // Social links
  const sosialLines = [
    identitas.sosial.github && `GitHub: ${identitas.sosial.github}`,
    identitas.sosial.linkedin && `LinkedIn: ${identitas.sosial.linkedin}`,
    identitas.sosial.instagram && `Instagram: ${identitas.sosial.instagram}`,
    identitas.sosial.whatsapp && `WhatsApp/Telegram: ${identitas.sosial.whatsapp}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Skills
  const skillsLine =
    konten.skills.length > 0
      ? konten.skills.join(", ")
      : "(Tampilkan skill sesuai profesinya secara umum)";

  // Projects
  const proyekLines = konten.proyek
    .filter((p) => p.nama.trim())
    .map((p, i) => {
      const parts = [`${i + 1}. ${p.nama}: ${p.deskripsi || "(deskripsi tidak diisi)"}`];
      if (p.tech) parts.push(`   Tech: ${p.tech}`);
      if (p.tipe) parts.push(`   Kategori: ${p.tipe}`);
      if (p.linkDemo) parts.push(`   Demo: ${p.linkDemo}`);
      if (p.linkGithub) parts.push(`   GitHub: ${p.linkGithub}`);
      return parts.join("\n");
    })
    .join("\n\n");

  // Services
  const layananSection =
    design.sections.layanan && konten.layanan.length > 0
      ? `\n=== LAYANAN / SERVICES ===\n${konten.layanan
          .filter((l) => l.nama.trim())
          .map((l) => {
            let line = `- ${l.nama}`;
            if (l.deskripsi) line += `: ${l.deskripsi}`;
            if (l.hargaMulai) line += ` (mulai dari ${l.hargaMulai})`;
            return line;
          })
          .join("\n")}`
      : "";

  // Hero layout
  const heroLayoutDesc =
    design.heroLayout === "centered"
      ? "Hero rata tengah (centered), tanpa foto, fokus pada teks dan tagline"
      : "Hero 2 kolom — teks di kiri, visual/ilustrasi SVG di kanan";

  // Background effect
  const bgEffectMap: Record<string, string> = {
    "dot-grid": "dot grid pattern (CSS background dots)",
    "diagonal-lines": "diagonal lines pattern",
    noise: "subtle noise texture",
    geometric: "geometric pattern abstrak",
    "gradient-mesh": "gradient mesh background",
    plain: "polos, tidak ada background effect",
  };
  const bgEffectDesc = bgEffectMap[design.bgEffect] || "polos";

  // Border style
  const borderMap: Record<string, string> = {
    rounded: "rounded-xl hingga rounded-2xl (modern, soft)",
    "slightly-rounded": "rounded-md (sedikit rounded)",
    sharp: "border-radius: 0 (brutalist, kotak)",
  };
  const borderDesc = borderMap[design.borderStyle] || "rounded-xl";

  // Active sections
  const activeSections = [
    "Hero / About",
    design.sections.skills && "Skills & Tools",
    design.sections.proyek && "Proyek",
    design.sections.layanan && konten.layanan.length > 0 && "Layanan / Services",
    design.sections.kontak && "Kontak",
    design.sections.testimonial && "Testimonial",
  ]
    .filter(Boolean)
    .join(", ");

  return `Buat sebuah website portfolio satu halaman menggunakan HTML, CSS, dan JavaScript murni (TANPA framework, TANPA npm, TANPA build tools).
Semua kode dalam SATU FILE index.html. Mulai langsung dari <!DOCTYPE html>.

=== DATA PEMILIK ===
Nama: ${identitas.nama}
Profesi: ${profesiLabel}
Tagline: ${identitas.tagline}
Bio: ${identitas.bio || "(buat bio yang sesuai dengan profesi dan tagline di atas)"}${identitas.kota ? `\nLokasi: ${identitas.kota}` : ""}${identitas.email ? `\nEmail: ${identitas.email}` : ""}${sosialLines ? `\n${sosialLines}` : ""}

=== SKILLS & TOOLS ===
${skillsLine}

=== PROYEK ===
${proyekLines || "(Buat 2-3 proyek fiktif yang realistis sesuai profesi)"}
${layananSection}

=== DESAIN ===
Color palette:
- Background: ${bg}
- Primary/Accent: ${primary}
- Text utama: ${text}

Font: ${fontDesc}

Suasana visual: ${design.vibe || "Sesuaikan dengan profesi — buat terasa premium dan modern"}
Hero layout: ${heroLayoutDesc}
Background effect: ${bgEffectDesc}
Border radius: ${borderDesc}

=== REQUIREMENTS TEKNIS ===
- Satu file index.html yang bisa langsung dibuka di browser tanpa server
- Semua CSS di dalam <style> tag di <head>
- Semua JS di dalam <script> tag sebelum </body>
- Font diimport via Google Fonts CDN link di <head>
- Fully responsive — mobile (320px+) dan desktop (1280px+)
- Smooth scroll antar section (CSS scroll-behavior: smooth)
- Animasi subtle saat elemen masuk viewport menggunakan Intersection Observer API
- Hover effects pada card proyek, button, dan link sosial
- Section yang ditampilkan: ${activeSections}
- Tidak ada placeholder seperti [YOUR NAME] atau [YOUR EMAIL] — semua sudah terisi dengan data di atas
- Pastikan kontras warna memenuhi aksesibilitas (WCAG AA)
- Meta tags lengkap: title, description, og:image placeholder

=== OUTPUT ===
Berikan HANYA kode HTML lengkap, tanpa penjelasan apapun, tanpa markdown code block.
Langsung dimulai dari <!DOCTYPE html> dan diakhiri dengan </html>.`;
}
