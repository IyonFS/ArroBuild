import {
  endsAbruptly,
  validateGeneratedContent,
  countHeadings,
  sanitizeGeneratedContent,
  dedupeRepeatedDocument,
  mergeContinuationContent,
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

## 1. Masalah yang Diselesaikan

Restaurant owners face many challenges:
- Manual Menu Management
- High Labor Dependency — The reliance on staff for every customer interaction (`;

const truncatedResult = validateGeneratedContent(truncatedPrd, "prd", "MAX_TOKENS");
assert("truncated PRD fails validation", !truncatedResult.valid);
assert("truncated PRD detected as truncated", truncatedResult.truncated);

const completePrd = `# Product Requirements Document

## 1. Ringkasan Produk
${"Platform untuk restoran digital. ".repeat(40)}

## 2. Masalah yang Diselesaikan
${"Pain points with detail for restaurant owners managing orders. ".repeat(30)}

## 3. Target Pengguna
| Segment | Description |
|---|---|
| Owners | Restaurant owners |

## 4. Fitur Utama
| ID | Fitur |
|---|---|
| FEAT-001 | QR ordering |

## 5. Cara Kerja Tiap Fitur
FEAT-001: scan QR, order, pay.

## 6. Alur Pengguna Utama
Scan → order → pay.

## 7. Batasan
MVP scope listed here.

## 8. Model Harga & Langganan
Freemium with Pro tier.
`;

assert("complete PRD has enough headings", countHeadings(completePrd) >= 5);
const completeResult = validateGeneratedContent(completePrd, "prd", "STOP");
assert("complete PRD passes validation", completeResult.valid);

const duplicated = `${completePrd}

\`\`\`yaml
project_id: "x"
\`\`\`

# Product Requirements Document

## 1. Ringkasan Produk
Duplicate start.
`;

const deduped = dedupeRepeatedDocument(duplicated);
assert("dedupe removes second document copy", !deduped.includes("Duplicate start"));
assert("dedupe keeps first document", deduped.includes("Model Harga"));

const merged = mergeContinuationContent(
  "## 6. Alur Pengguna Utama\nStep one.",
  "Step one. Step two completes the flow."
);
assert("merge removes overlap", merged === "## 6. Alur Pengguna Utama\nStep one. Step two completes the flow.");

const dupResult = validateGeneratedContent(duplicated, "prd", "STOP");
assert("duplicate structure auto-healed and passes validation", dupResult.valid);

const partialFirst = `# Product Requirements Document

## 1. Ringkasan Produk
Short only.

## 2. Masalah
Brief.
`;

const completeSecond = `${partialFirst}
\`\`\`yaml
project_id: "x"
\`\`\`

# Product Requirements Document

## 1. Ringkasan Produk
${"Platform untuk restoran digital. ".repeat(40)}

## 2. Masalah yang Diselesaikan
${"Pain points with detail for restaurant owners managing orders. ".repeat(30)}

## 3. Target Pengguna
| Segment | Description |
|---|---|
| Owners | Restaurant owners |

## 4. Fitur Utama
| ID | Fitur |
|---|---|
| FEAT-001 | QR ordering |

## 5. Cara Kerja Tiap Fitur
FEAT-001: scan QR, order, pay.

## 6. Alur Pengguna Utama
Scan → order → pay.

## 7. Batasan
MVP scope listed here.

## 8. Model Harga & Langganan
Freemium with Pro tier.
`;

const picked = dedupeRepeatedDocument(completeSecond);
assert("dedupe keeps more complete second half", picked.includes("Model Harga") && !picked.endsWith("Brief."));

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
