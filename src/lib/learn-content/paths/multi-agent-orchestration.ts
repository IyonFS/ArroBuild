import type { LearningPath } from "../types";
import { buildPlaceholderLessonBlocks } from "../build-lesson";

export const multiAgentOrchestration: LearningPath = {
  slug: "multi-agent-orchestration",
  status: "draft",
  title: "Multi-Agent Orchestration",
  description:
    "Desain workflow multi-agent: pembagian role, handoff antar agent, dan manajemen context window untuk project besar.",
  level: "lanjut",
  estimasi: "55 menit",
  tag: "Gratis",
  icon: "workflow",
  track: "advanced",
  objective:
    "Membangun sistem kerja multi-agent yang scalable tanpa kehilangan koherensi arsitektur.",
  prerequisites: ["implementation-workflow"],
  outcome:
    "Kamu bisa merancang dan menjalankan workflow multi-agent untuk satu modul project nyata.",
  lessons: [
    {
      slug: "kapan-perlu-multi-agent",
      title: "Kapan Perlu Multi-Agent?",
      estimasi: "12 menit",
      outcome: "Kamu tahu kriteria kapan single-agent cukup vs kapan perlu multi-agent.",
      blocks: buildPlaceholderLessonBlocks(
        "Kapan Perlu Multi-Agent?",
        "Kamu tahu kriteria kapan single-agent cukup vs kapan perlu multi-agent."
      ),
    },
    {
      slug: "role-dan-handoff",
      title: "Role dan Handoff antar Agent",
      estimasi: "14 menit",
      outcome: "Kamu mendefinisikan role agent dan format handoff antar sesi.",
      blocks: buildPlaceholderLessonBlocks(
        "Role dan Handoff antar Agent",
        "Kamu mendefinisikan role agent dan format handoff antar sesi."
      ),
    },
    {
      slug: "context-window-strategy",
      title: "Context Window Strategy",
      estimasi: "14 menit",
      outcome: "Kamu menerapkan strategi compress, pin, dan reset context untuk sesi panjang.",
      blocks: buildPlaceholderLessonBlocks(
        "Context Window Strategy",
        "Kamu menerapkan strategi compress, pin, dan reset context untuk sesi panjang."
      ),
    },
    {
      slug: "orchestration-playbook",
      title: "Orchestration Playbook",
      estimasi: "15 menit",
      outcome: "Kamu punya playbook orchestration yang bisa diadaptasi ke project berikutnya.",
      blocks: buildPlaceholderLessonBlocks(
        "Orchestration Playbook",
        "Kamu punya playbook orchestration yang bisa diadaptasi ke project berikutnya."
      ),
    },
  ],
};
