import type { LearningPath } from "../types";
import { buildPlaceholderLessonBlocks } from "../build-lesson";

export const reliabilityDeployment: LearningPath = {
  slug: "reliability-deployment",
  status: "draft",
  title: "Reliability & Deployment",
  description:
    "Deploy project pertama, observability dasar, safety rails untuk AI di production, dan maintenance dokumentasi.",
  level: "lanjut",
  estimasi: "50 menit",
  tag: "Gratis",
  icon: "toolkit",
  track: "advanced",
  objective:
    "Membawa project dari local ke production dengan praktik reliability dan dokumentasi yang sustainable.",
  prerequisites: ["implementation-workflow"],
  outcome:
    "Project kamu live di production dengan checklist deploy, monitoring dasar, dan docs terawat.",
  lessons: [
    {
      slug: "deploy-ke-vercel",
      title: "Deploy ke Vercel",
      estimasi: "13 menit",
      outcome: "Kamu mendeploy aplikasi Next.js ke Vercel dengan environment variables yang benar.",
      blocks: buildPlaceholderLessonBlocks(
        "Deploy ke Vercel",
        "Kamu mendeploy aplikasi Next.js ke Vercel dengan environment variables yang benar."
      ),
    },
    {
      slug: "pre-launch-checklist",
      title: "Pre-Launch Checklist",
      estimasi: "12 menit",
      outcome: "Kamu menjalankan checklist pre-launch sebelum membuka akses ke user.",
      blocks: buildPlaceholderLessonBlocks(
        "Pre-Launch Checklist",
        "Kamu menjalankan checklist pre-launch sebelum membuka akses ke user."
      ),
    },
    {
      slug: "observability-dasar",
      title: "Observability Dasar",
      estimasi: "12 menit",
      outcome: "Kamu memasang error monitoring dan tahu cara membaca sinyal production.",
      blocks: buildPlaceholderLessonBlocks(
        "Observability Dasar",
        "Kamu memasang error monitoring dan tahu cara membaca sinyal production."
      ),
    },
    {
      slug: "maintenance-dokumentasi",
      title: "Maintenance Dokumentasi",
      estimasi: "13 menit",
      outcome: "Kamu punya rutinitas update docs (context.md, PRD) setelah setiap milestone.",
      blocks: buildPlaceholderLessonBlocks(
        "Maintenance Dokumentasi",
        "Kamu punya rutinitas update docs (context.md, PRD) setelah setiap milestone."
      ),
    },
  ],
};
