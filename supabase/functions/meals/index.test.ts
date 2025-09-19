import {
  assert,
  assertEquals,
  assertFalse,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";

import {
  blocksToMarkdown,
  markdownToBlocks,
  normaliseNotionId,
  normaliseStringArray,
  validateCreatePayload,
} from "./index.ts";

Deno.test("validateCreatePayload trims and normalises input", () => {
  const result = validateCreatePayload({
    title: "  Pasta  ",
    categories: ["  Veg  ", 42, ""],
    ratings: "A1, B2",
    comment: "  Hello  ",
    content_markdown: "  Text  ",
  });

  assert(result.ok);
  assertEquals(result.value.title, "Pasta");
  assertEquals(result.value.categories, ["Veg"]);
  assertEquals(result.value.ratings, ["A1", "B2"]);
  assertEquals(result.value.comment, "Hello");
  assertEquals(result.value.content_markdown, "Text");
});

Deno.test("validateCreatePayload rejects missing title", () => {
  const result = validateCreatePayload({ title: "   " });
  assertFalse(result.ok);
  if (!result.ok) {
    assertEquals(result.error, "title is required");
  }
});

Deno.test("normaliseNotionId adds hyphen formatting", () => {
  const compact = "1234567890abcdef1234567890abcdef";
  const formatted = normaliseNotionId(compact);
  assertEquals(formatted, "12345678-90ab-cdef-1234-567890abcdef");
});

Deno.test("markdown parsing handles bullets and numbering", () => {
  const markdown =
    "# Title\n\n- First item\n- Second item\n\n1. Step one\n2. Step two\n\n---\n\nSummary";
  const requestBlocks = markdownToBlocks(markdown);
  const notionBlocks = requestBlocks.map((block) => toNotionStyleBlock(block));
  const types = notionBlocks.map((block) => block.type);
  assertEquals(types, [
    "heading_1",
    "bulleted_list_item",
    "bulleted_list_item",
    "numbered_list_item",
    "numbered_list_item",
    "divider",
    "paragraph",
  ]);
  const roundTrip = blocksToMarkdown(notionBlocks as any);
  assert(roundTrip.includes("# Title"));
  assert(roundTrip.includes("- First item"));
  assert(roundTrip.includes("1. Step one"));
});

Deno.test("normaliseStringArray handles strings and arrays", () => {
  assertEquals(normaliseStringArray([" A ", null, "B"]), ["A", "B"]);
  assertEquals(normaliseStringArray("X, Y ,, Z"), ["X", "Y", "Z"]);
  assertEquals(normaliseStringArray(42), []);
});

function toNotionStyleBlock(block: any) {
  const clone = structuredClone(block);
  const target = clone[clone.type];
  if (target?.rich_text) {
    target.rich_text = target.rich_text.map((item: any) => ({
      ...item,
      plain_text: item.text?.content ?? "",
    }));
  }
  return clone;
}
