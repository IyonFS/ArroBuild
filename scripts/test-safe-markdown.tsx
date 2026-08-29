import { renderToStaticMarkup } from "react-dom/server";
import SafeMarkdown, {
  filterInferredMarkdown,
  safeMarkdownUrl,
} from "../src/components/ui/SafeMarkdown";

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

console.log("\n=== Safe Markdown Tests ===\n");

const malicious = `# Result

<script>alert("xss")</script>

<img src=x onerror="alert(1)">

[unsafe](javascript:alert(1))

[safe](https://example.com)

[INFERRED] inferred line

[EXTRACTED] extracted line`;

const html = renderToStaticMarkup(<SafeMarkdown content={malicious} />);

assert("script elements are not rendered", !html.includes("<script"));
assert("event handlers are not rendered", !html.includes("onerror"));
assert("javascript URLs are removed", !html.includes("javascript:"));
assert("raw image elements are not rendered", !html.includes("<img"));
assert("raw SVG payloads are not rendered", !html.includes("<svg"));
assert("safe HTTPS links remain available", html.includes('href="https://example.com"'));
assert("INFERRED tag uses a React-rendered badge", html.includes('data-confidence="inferred"'));
assert("EXTRACTED tag uses a React-rendered badge", html.includes('data-confidence="extracted"'));

const filtered = filterInferredMarkdown(malicious, false);
assert("pure inferred lines can be hidden", !filtered.includes("inferred line"));
assert("extracted lines remain visible", filtered.includes("extracted line"));
assert("mailto links are rejected", safeMarkdownUrl("mailto:test@example.com", "href") === "");
assert("HTTPS links are accepted", safeMarkdownUrl("https://example.com", "href") !== "");
assert(
  "remote image sources are rejected",
  safeMarkdownUrl("https://example.com/a.png", "src") === "",
);

const malformedHtml = renderToStaticMarkup(
  <SafeMarkdown content={'[broken](javascript:alert(1)\n<svg onload="alert(1)">'} />,
);
assert(
  "malformed Markdown cannot restore unsafe links",
  !malformedHtml.includes('href="javascript:'),
);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
