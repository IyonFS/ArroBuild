import type { LearningPath } from "../types";
import { buildPlaceholderLessonBlocks } from "../build-lesson";

export const setupTooling: LearningPath = {
  slug: "setup-tooling",
  status: "draft",
  title: "Setup Tooling",
  description:
    "Konfigurasi Cursor, Claude Code, dan file aturan project (.cursorrules, CLAUDE.md) dari nol sampai siap dipakai.",
  level: "pemula",
  estimasi: "40 menit",
  tag: "Gratis",
  icon: "toolkit",
  track: "foundation",
  objective:
    "Menyiapkan environment dan file konfigurasi agar AI agent konsisten di setiap sesi kerja.",
  prerequisites: ["vibe-coding-fundamentals"],
  outcome:
    "Project pertamamu punya tool terpasang, model terpilih, dan file aturan dasar yang dibaca AI otomatis.",
  lessons: [
    {
      slug: "install-dan-konfigurasi-cursor",
      title: "Install dan Konfigurasi Cursor",
      estimasi: "10 menit",
      outcome: "Cursor terinstall, model dipilih, dan shortcut utama sudah kamu kenal.",
      blocks: buildPlaceholderLessonBlocks(
        "Install dan Konfigurasi Cursor",
        "Cursor terinstall, model dipilih, dan shortcut utama sudah kamu kenal."
      ),
    },
    {
      slug: "cursorrules-dasar",
      title: ".cursorrules Dasar",
      estimasi: "10 menit",
      outcome: "Kamu punya file .cursorrules minimal dengan context, stack, dan coding rules.",
      blocks: buildPlaceholderLessonBlocks(
        ".cursorrules Dasar",
        "Kamu punya file .cursorrules minimal dengan context, stack, dan coding rules."
      ),
    },
    {
      slug: "claude-code-dan-claude-md",
      title: "Claude Code dan CLAUDE.md",
      estimasi: "10 menit",
      outcome: "Kamu bisa menjalankan Claude Code dan membuat CLAUDE.md untuk project.",
      blocks: buildPlaceholderLessonBlocks(
        "Claude Code dan CLAUDE.md",
        "Kamu bisa menjalankan Claude Code dan membuat CLAUDE.md untuk project."
      ),
    },
    {
      slug: "checklist-environment-siap",
      title: "Checklist Environment Siap",
      estimasi: "10 menit",
      outcome: "Kamu memverifikasi environment dengan checklist sebelum mulai build fitur.",
      blocks: buildPlaceholderLessonBlocks(
        "Checklist Environment Siap",
        "Kamu memverifikasi environment dengan checklist sebelum mulai build fitur."
      ),
    },
  ],
};
