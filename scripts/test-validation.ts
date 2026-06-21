import {
  endsAbruptly,
  validateGeneratedContent,
  countHeadings,
} from "../src/lib/ai/validation";

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

console.log("\n=== Validation Tests ===\n");

assert("complete sentence is not abrupt", !endsAbruptly("This is done."));
assert("open paren is abrupt", endsAbruptly("The reliance on staff ("));
assert(
  "long incomplete line is abrupt",
  endsAbruptly("This is a very long sentence that never finishes properly")
);

const truncatedPrd = `# Product Requirements Document

## 1. Problem Statement

Restaurant owners face many challenges:
- Manual Menu Management
- High Labor Dependency — The reliance on staff for every customer interaction (`;

const truncatedResult = validateGeneratedContent(truncatedPrd, "prd", "MAX_TOKENS");
assert("truncated PRD fails validation", !truncatedResult.valid);
assert("truncated PRD detected as truncated", truncatedResult.truncated);

const completePrd = `# PRD

## 1. Problem Statement
${"Pain points with detail for restaurant owners managing orders. ".repeat(60)}

## 2. Solution
${"Step by step solution flow for the platform. ".repeat(20)}

## 3. Target Users
| Segment | Description | Pain Point |
|---|---|---|
| Owners | Restaurant owners | Manual processes |

## 4. Core Value Proposition
Headline and differentiators here.

## 5. Features
### 5.1 Core Features
${"Feature detail with acceptance criteria. ".repeat(15)}

### 5.2 Premium Features
${"Premium feature details for post-MVP. ".repeat(10)}

## 6. MVP Scope
- [x] Included feature one
- [ ] Not in MVP feature

## 7. Success Metrics
Launch, growth, and revenue targets with numbers.

## 8. User Stories
As a restaurant owner, I want QR ordering, so that customers can order faster.

## 9. Constraints & Assumptions
Technical, business, and user assumptions listed here.

## 10. Open Questions
1. Payment integration approach?
2. Multi-location support timing?
3. Offline mode requirements?
4. Staff role permissions model?
`;

assert("complete PRD has enough headings", countHeadings(completePrd) >= 8);
const completeResult = validateGeneratedContent(completePrd, "prd", "STOP");
assert("complete PRD passes validation", completeResult.valid);
assert(
  "complete PRD long enough",
  completePrd.length >= 2500
);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
