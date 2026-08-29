import type { LearningPath } from "../types";
import { buildPlaceholderLessonBlocks } from "../build-lesson";

export const productPlanningForAi: LearningPath = {
  slug: "product-planning-for-ai",
  status: "draft",
  title: "Product Planning for AI",
  description:
    "Rancang PRD, context.md, design-system.md, dan agents.md yang benar-benar berguna sebagai konteks untuk AI agent.",
  level: "menengah",
  estimasi: "45 menit",
  tag: "Gratis",
  icon: "document",
  track: "workflow",
  objective:
    "Membuat dokumentasi produk yang menjadi single source of truth untuk setiap sesi AI.",
  prerequisites: ["vibe-coding-fundamentals", "setup-tooling"],
  outcome:
    "Kamu punya set dokumentasi MVP (PRD + context + design system + agents) siap dipakai AI.",
  lessons: [
    {
      slug: "anatomi-prd-untuk-ai",
      title: "Anatomi PRD untuk AI",
      estimasi: "12 menit",
      outcome: "Kamu menulis PRD MVP dengan section wajib termasuk Non-Goals yang eksplisit.",
      blocks: buildPlaceholderLessonBlocks(
        "Anatomi PRD untuk AI",
        "Kamu menulis PRD MVP dengan section wajib termasuk Non-Goals yang eksplisit."
      ),
    },
    {
      slug: "context-md-living-doc",
      title: "context.md sebagai Living Doc",
      estimasi: "11 menit",
      outcome: "Kamu membuat dan memelihara context.md yang mencerminkan state project terkini.",
      blocks: buildPlaceholderLessonBlocks(
        "context.md sebagai Living Doc",
        "Kamu membuat dan memelihara context.md yang mencerminkan state project terkini."
      ),
    },
    {
      slug: "design-system-md",
      title: "design-system.md untuk Konsistensi UI",
      estimasi: "11 menit",
      outcome: "Kamu mendefinisikan token visual dan pola komponen agar output AI konsisten.",
      blocks: buildPlaceholderLessonBlocks(
        "design-system.md untuk Konsistensi UI",
        "Kamu mendefinisikan token visual dan pola komponen agar output AI konsisten."
      ),
    },
    {
      slug: "agents-md-dan-scope-control",
      title: "agents.md dan Scope Control",
      estimasi: "11 menit",
      outcome: "Kamu mengonfigurasi role, batasan, dan workflow agent untuk mencegah scope creep.",
      blocks: buildPlaceholderLessonBlocks(
        "agents.md dan Scope Control",
        "Kamu mengonfigurasi role, batasan, dan workflow agent untuk mencegah scope creep."
      ),
    },
  ],
};
