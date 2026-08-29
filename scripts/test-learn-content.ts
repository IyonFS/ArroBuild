import { ALL_LEARNING_PATHS, LEARNING_PATHS, getPath } from "../src/lib/learn-content";
import { LEARN_REFERENCE_ITEMS } from "../src/lib/learn-nav";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

console.log("\n=== Published Learn Content Tests ===\n");

const publishedPath = LEARNING_PATHS[0];
const publishedText = JSON.stringify(LEARNING_PATHS).toLowerCase();

assert("all six authored paths remain available internally", ALL_LEARNING_PATHS.length === 6);
assert("only one reviewed path is public", LEARNING_PATHS.length === 1);
assert(
  "public collection contains published paths only",
  LEARNING_PATHS.every((p) => p.status === "published"),
);
assert(
  "Vibe Coding Fundamentals is the published path",
  publishedPath?.slug === "vibe-coding-fundamentals",
);
assert("published path contains four lessons", publishedPath?.lessons.length === 4);
assert("public content contains no placeholder copy", !publishedText.includes("placeholder"));
assert("draft paths cannot be resolved publicly", getPath("setup-tooling") === undefined);
assert("published path resolves publicly", getPath("vibe-coding-fundamentals") === publishedPath);
assert(
  "navigation references published lessons only",
  LEARN_REFERENCE_ITEMS.length === 4 &&
    LEARN_REFERENCE_ITEMS.every((item) => item.href.includes("/vibe-coding-fundamentals/")),
);
assert(
  "every published lesson has a measurable outcome",
  publishedPath?.lessons.every((lesson) => lesson.outcome.length >= 40) === true,
);
assert(
  "every published lesson includes concept, practice, pitfalls, and CTA",
  publishedPath?.lessons.every((lesson) => {
    const headings = lesson.blocks
      .filter((block) => block.type === "heading")
      .map((block) => block.content);
    return (
      headings.includes("Core Concept") &&
      headings.includes("Practice Task") &&
      headings.includes("Common Pitfalls") &&
      lesson.blocks.some((block) => block.type === "cta-link" && Boolean(block.href))
    );
  }) === true,
);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
