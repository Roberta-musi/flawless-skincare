import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdown } from "./markdown";

describe("parseInline", () => {
  it("parses bold, italics and safe links", () => {
    expect(parseInline("A **bold** and *soft* [link](https://x.com) end")).toEqual([
      { type: "text", value: "A " },
      { type: "strong", value: "bold" },
      { type: "text", value: " and " },
      { type: "em", value: "soft" },
      { type: "text", value: " " },
      { type: "link", value: "link", href: "https://x.com" },
      { type: "text", value: " end" },
    ]);
  });

  it("leaves unsafe link targets as text", () => {
    expect(parseInline("[x](javascript:alert(1))")).toEqual([{ type: "text", value: "[x](javascript:alert(1))" }]);
    expect(parseInline("[x](//evil.example)")).toEqual([{ type: "text", value: "[x](//evil.example)" }]);
  });
});

describe("parseMarkdown", () => {
  it("splits headings, paragraphs and lists", () => {
    const blocks = parseMarkdown("## Who\nLine one\nline two\n\n- a\n- **b**\n\n1. first\n2. second\nAfter");
    expect(blocks.map((b) => b.type)).toEqual(["heading", "paragraph", "list", "list", "paragraph"]);
    expect(blocks[1]).toEqual({ type: "paragraph", lines: [[{ type: "text", value: "Line one" }], [{ type: "text", value: "line two" }]] });
    expect(blocks[2]).toMatchObject({ ordered: false, items: [[{ value: "a" }], [{ type: "strong", value: "b" }]] });
    expect(blocks[3]).toMatchObject({ ordered: true });
  });

  it("returns nothing for blank input", () => {
    expect(parseMarkdown("  \n\n")).toEqual([]);
  });
});
