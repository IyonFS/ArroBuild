import type { LearningPath } from "../types";
import { buildPlaceholderLessonBlocks } from "../build-lesson";

export const implementationWorkflow: LearningPath = {
  slug: "implementation-workflow",
  status: "draft",
  title: "Implementation Workflow",
  description:
    "Alur implementasi harian: prompt yang tepat, iterasi cepat, debugging output AI, dan quality gates sebelum merge.",
  level: "menengah",
  estimasi: "50 menit",
  tag: "Gratis",
  icon: "workflow",
  track: "workflow",
  objective:
    "Menguasai workflow implementasi yang sustainable — bukan sekadar cepat di awal, tapi tetap terkontrol.",
  prerequisites: ["product-planning-for-ai"],
  outcome:
    "Kamu punya playbook iterasi, debugging, dan quality check yang bisa dipakai ulang tiap fitur.",
  lessons: [
    {
      slug: "prompt-satu-tugas",
      title: "Prompt Satu Tugas",
      estimasi: "12 menit",
      outcome: "Kamu memecah fitur besar menjadi prompt kecil yang terukur dan bisa diverifikasi.",
      blocks: buildPlaceholderLessonBlocks(
        "Prompt Satu Tugas",
        "Kamu memecah fitur besar menjadi prompt kecil yang terukur dan bisa diverifikasi."
      ),
    },
    {
      slug: "iterasi-dan-feedback-loop",
      title: "Iterasi dan Feedback Loop",
      estimasi: "13 menit",
      outcome: "Kamu memberikan feedback spesifik ke AI dan menyelesaikan 3 iterasi tanpa kehilangan arah.",
      blocks: buildPlaceholderLessonBlocks(
        "Iterasi dan Feedback Loop",
        "Kamu memberikan feedback spesifik ke AI dan menyelesaikan 3 iterasi tanpa kehilangan arah."
      ),
    },
    {
      slug: "debugging-output-ai",
      title: "Debugging Output AI",
      estimasi: "13 menit",
      outcome: "Kamu mengidentifikasi pola error AI (hallucination, over-engineering) dan memperbaikinya.",
      blocks: buildPlaceholderLessonBlocks(
        "Debugging Output AI",
        "Kamu mengidentifikasi pola error AI (hallucination, over-engineering) dan memperbaikinya."
      ),
    },
    {
      slug: "quality-gates-sebelum-merge",
      title: "Quality Gates Sebelum Merge",
      estimasi: "12 menit",
      outcome: "Kamu menerapkan checklist review kode sebelum merge ke branch utama.",
      blocks: buildPlaceholderLessonBlocks(
        "Quality Gates Sebelum Merge",
        "Kamu menerapkan checklist review kode sebelum merge ke branch utama."
      ),
    },
  ],
};
