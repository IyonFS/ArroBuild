// ─── Learn Hub Content Types ─────────────────────────────────────────────────

export type LessonLevel = "pemula" | "menengah" | "lanjut";

export type LearnTrack = "foundation" | "workflow" | "advanced";

export type PublicationStatus = "published" | "draft";

export type PathIconId = "foundation" | "document" | "workflow" | "toolkit";

export type BlockType =
  | "text"
  | "code"
  | "callout"
  | "tip"
  | "warning"
  | "cta-link"
  | "heading"
  | "list";

export interface Block {
  type: BlockType;
  content?: string;
  language?: string;
  label?: string;
  href?: string;
  items?: string[];
}

export interface Lesson {
  slug: string;
  title: string;
  estimasi: string;
  /** Satu kalimat hasil yang dicapai setelah lesson selesai */
  outcome: string;
  blocks: Block[];
}

export interface LearningPath {
  slug: string;
  status: PublicationStatus;
  title: string;
  description: string;
  level: LessonLevel;
  estimasi: string;
  tag: string;
  icon: PathIconId;
  track: LearnTrack;
  /** Tujuan pembelajaran path secara keseluruhan */
  objective: string;
  /** Slug path yang disarankan diselesaikan dulu; kosong = tidak ada prerequisite */
  prerequisites: string[];
  /** Output konkret setelah menyelesaikan seluruh path */
  outcome: string;
  featured?: boolean;
  lessons: Lesson[];
}
