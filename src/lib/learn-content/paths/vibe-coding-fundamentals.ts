import type { LearningPath } from "../types";
import { buildPlaceholderLessonBlocks } from "../build-lesson";

export const vibeCodingFundamentals: LearningPath = {
  slug: "vibe-coding-fundamentals",
  title: "Vibe Coding Fundamentals",
  description:
    "Pahami mindset, peran, dan alur kerja dasar membangun software bersama AI agent — dari konsep sampai iterasi pertama.",
  level: "pemula",
  estimasi: "35 menit",
  tag: "Gratis",
  icon: "foundation",
  track: "foundation",
  featured: true,
  objective:
    "Membangun fondasi mental model vibe coding: apa peran kamu, apa peran AI, dan bagaimana kolaborasinya berjalan.",
  prerequisites: [],
  outcome:
    "Kamu bisa menjelaskan vibe coding, memilih tool awal, dan menjalankan iterasi pertama dengan AI secara terstruktur.",
  lessons: [
    {
      slug: "apa-itu-vibe-coding",
      title: "Apa itu Vibe Coding?",
      estimasi: "8 menit",
      outcome: "Kamu bisa membedakan vibe coding dari coding tradisional dan menjelaskan peran kamu vs AI.",
      blocks: buildPlaceholderLessonBlocks(
        "Apa itu Vibe Coding?",
        "Kamu bisa membedakan vibe coding dari coding tradisional dan menjelaskan peran kamu vs AI."
      ),
    },
    {
      slug: "peran-arsitek-dan-eksekutor",
      title: "Peran Arsitek dan Eksekutor",
      estimasi: "8 menit",
      outcome: "Kamu tahu kapan harus merancang, kapan harus mereview, dan kapan harus menolak output AI.",
      blocks: buildPlaceholderLessonBlocks(
        "Peran Arsitek dan Eksekutor",
        "Kamu tahu kapan harus merancang, kapan harus mereview, dan kapan harus menolak output AI."
      ),
    },
    {
      slug: "ekosistem-tools-ai-coding",
      title: "Ekosistem Tools AI Coding",
      estimasi: "10 menit",
      outcome: "Kamu bisa memilih tool pertama (Cursor, Claude Code, dll.) sesuai kebutuhan dan level.",
      blocks: buildPlaceholderLessonBlocks(
        "Ekosistem Tools AI Coding",
        "Kamu bisa memilih tool pertama (Cursor, Claude Code, dll.) sesuai kebutuhan dan level."
      ),
    },
    {
      slug: "iterasi-pertama",
      title: "Iterasi Pertama dengan AI",
      estimasi: "9 menit",
      outcome: "Kamu menyelesaikan satu siklus prompt → output → review → perbaikan dengan checklist sederhana.",
      blocks: buildPlaceholderLessonBlocks(
        "Iterasi Pertama dengan AI",
        "Kamu menyelesaikan satu siklus prompt → output → review → perbaikan dengan checklist sederhana."
      ),
    },
  ],
};
