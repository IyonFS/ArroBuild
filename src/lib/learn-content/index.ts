import type { LearningPath } from "./types";
import { vibeCodingFundamentals } from "./paths/vibe-coding-fundamentals";
import { setupTooling } from "./paths/setup-tooling";
import { productPlanningForAi } from "./paths/product-planning-for-ai";
import { implementationWorkflow } from "./paths/implementation-workflow";
import { multiAgentOrchestration } from "./paths/multi-agent-orchestration";
import { reliabilityDeployment } from "./paths/reliability-deployment";

export type {
  Block,
  BlockType,
  LearnTrack,
  LearningPath,
  Lesson,
  LessonLevel,
  PathIconId,
} from "./types";

export { buildLessonBlocks, buildPlaceholderLessonBlocks } from "./build-lesson";
export type { LessonContentInput } from "./build-lesson";

export const LEARNING_PATHS: LearningPath[] = [
  vibeCodingFundamentals,
  setupTooling,
  productPlanningForAi,
  implementationWorkflow,
  multiAgentOrchestration,
  reliabilityDeployment,
];

export function getPath(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug);
}

export function getLesson(
  pathSlug: string,
  lessonSlug: string
): { path: LearningPath; lesson: import("./types").Lesson; index: number } | undefined {
  const path = getPath(pathSlug);
  if (!path) return undefined;
  const index = path.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return undefined;
  return { path, lesson: path.lessons[index], index };
}

export function getPathByPrerequisite(slug: string): LearningPath[] {
  return LEARNING_PATHS.filter((p) => p.prerequisites.includes(slug));
}
