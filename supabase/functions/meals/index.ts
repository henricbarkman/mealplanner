// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { APIResponseError } from "npm:@notionhq/client";
import type {
  BlockObjectRequest,
  ListBlockChildrenResponse,
  ListBlockChildrenResponseResults,
  PageObjectResponse,
  QueryDatabaseParameters,
  RichTextItemRequest,
} from "npm:@notionhq/client/build/src/api-endpoints";
import { getMealsDatabaseId, getNotionClient } from "../_shared/notion.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Content-Type": "application/json",
};

let notionApiClient: ReturnType<typeof getNotionClient> | null = null;
let cachedMealsDatabaseId: string | null = null;

function notionClient() {
  if (!notionApiClient) {
    notionApiClient = getNotionClient();
  }
  return notionApiClient;
}

function mealsDatabaseId() {
  if (!cachedMealsDatabaseId) {
    cachedMealsDatabaseId = getMealsDatabaseId();
  }
  return cachedMealsDatabaseId;
}


serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const extraPathSegments = extractExtraPathSegments(url.pathname, "meals");

    if (req.method === "GET") {
      if (extraPathSegments.length > 0) {
        return await handleGetOne(extraPathSegments[0]);
      }
      return await handleGetMany(url.searchParams);
    }

    if (req.method === "POST") {
      if (extraPathSegments.length > 0) {
        return jsonResponse({ error: "Not found" }, 404);
      }
      return await handlePost(req);
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error(error);
    return handleError(error);
  }
});

async function handleGetMany(params: URLSearchParams): Promise<Response> {
  const query = params.get("query")?.trim();
  const categoryFilters = readArraySearchParam(params, "categories");
  const ratingFilters = readArraySearchParam(params, "ratings");
  const limit = clamp(parseInt(params.get("limit") ?? "10", 10), 1, 100);
  const cursor = params.get("cursor")?.trim() || undefined;

  const filters: Array<Record<string, unknown>> = [];
  if (query) {
    filters.push({
      property: "Name",
      title: { contains: query },
    });
  }
  for (const category of categoryFilters) {
    filters.push({
      property: "Kategori",
      multi_select: { contains: category },
    });
  }
  for (const rating of ratingFilters) {
    filters.push({
      property: "Betyg",
      multi_select: { contains: rating },
    });
  }

  const response = await notionClient().databases.query({
    database_id: mealsDatabaseId,
    page_size: limit,
    start_cursor: cursor,
    filter: filters.length > 0 ? { and: filters } : undefined,
    sorts: [{ property: "Name", direction: "ascending" }],
  } as QueryDatabaseParameters);

  const meals = response.results.map((page) => mapMealPage(page));

  return jsonResponse({
    meals,
    has_more: response.has_more ?? false,
    next_cursor: response.next_cursor ?? null,
  });
}

async function handleGetOne(rawPageId: string): Promise<Response> {
  const pageId = normaliseNotionId(rawPageId);
  const page = await notionClient().pages.retrieve({
    page_id: pageId,
  }) as PageObjectResponse;

  if (!isPageInDatabase(page)) {
    return jsonResponse(
      { error: "Page does not belong to meals database" },
      404,
    );
  }

  const blocks = await fetchAllBlocks(pageId);
  const contentMarkdown = blocksToMarkdown(blocks);

  const meal = mapMealPage(page);

  return jsonResponse({
    ...meal,
    content_markdown: contentMarkdown,
  });
}

async function handlePost(req: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch (_error) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const validation = validateCreatePayload(payload);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400);
  }

  const {
    title,
    categories,
    ratings,
    comment,
    content_markdown: contentMarkdown,
  } = validation.value;

  const properties: Record<string, unknown> = {
    Name: {
      title: [{ text: { content: title } }],
    },
  };

  if (categories.length > 0) {
    properties.Kategori = {
      multi_select: categories.map((name) => ({ name })),
    };
  }

  if (ratings.length > 0) {
    properties.Betyg = {
      multi_select: ratings.map((name) => ({ name })),
    };
  }

  if (comment) {
    properties.Kommentar = {
      rich_text: [{ type: "text", text: { content: comment } }],
    };
  }

  const children = markdownToBlocks(contentMarkdown);

  const created = await notionClient().pages.create(
    {
      parent: { database_id: mealsDatabaseId },
      properties,
      children,
    } as Parameters<typeof notionClient().pages.create>[0],
  );

  return jsonResponse(
    {
      id: created.id,
      url: created.url,
    },
    201,
  );
}

function mapMealPage(page: PageObjectResponse) {
  const title = extractTitle(page.properties?.Name);
  const categories = extractMultiSelect(page.properties?.Kategori);
  const ratings = extractMultiSelect(page.properties?.Betyg);
  const comment = extractRichText(page.properties?.Kommentar);

  return {
    id: page.id,
    title,
    categories,
    ratings,
    comment,
    url: page.url,
  };
}

function extractTitle(property: any): string {
  if (!property?.title?.length) return "";
  return property.title.map((item: any) => item.plain_text ?? "").join("")
    .trim();
}

function extractMultiSelect(property: any): string[] {
  if (!property?.multi_select) return [];
  return property.multi_select.map((item: any) => item.name ?? "").filter(
    Boolean,
  );
}

function extractRichText(property: any): string | null {
  if (!property?.rich_text?.length) return null;
  const text = property.rich_text.map((item: any) => item.plain_text ?? "")
    .join("").trim();
  return text.length > 0 ? text : null;
}

function readArraySearchParam(params: URLSearchParams, key: string): string[] {
  const values = params.getAll(key);
  if (values.length === 0) {
    const commaSeparated = params.get(key);
    if (commaSeparated) {
      return commaSeparated.split(",").map((value) => value.trim()).filter(
        Boolean,
      );
    }
  }
  return values
    .flatMap((value) => value.split(",").map((part) => part.trim()))
    .filter(Boolean);
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function extractExtraPathSegments(
  pathname: string,
  resource: string,
): string[] {
  const segments = pathname.split(/\/+/).filter(Boolean);
  const resourceIndex = segments.findIndex((segment) => segment === resource);
  if (resourceIndex === -1) return [];
  return segments.slice(resourceIndex + 1);
}

export function normaliseNotionId(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes("-") || trimmed.length !== 32) {
    return trimmed;
  }
  return `${trimmed.slice(0, 8)}-${trimmed.slice(8, 12)}-${
    trimmed.slice(12, 16)
  }-${trimmed.slice(16, 20)}-${trimmed.slice(20)}`;
}

function isPageInDatabase(page: any): boolean {
  return page.parent?.type === "database_id" &&
    page.parent.database_id === mealsDatabaseId;
}

async function fetchAllBlocks(
  pageId: string,
): Promise<ListBlockChildrenResponseResults[]> {
  const allBlocks: any[] = [];
  let cursor: string | undefined;
  do {
    const response = await notionClient().blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    }) as ListBlockChildrenResponse;
    allBlocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return allBlocks;
}

export function blocksToMarkdown(blocks: any[]): string {
  const lines: string[] = [];
  let numberedCounter = 0;

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph": {
        numberedCounter = 0;
        const text = richTextToPlain(block.paragraph?.rich_text ?? []);
        if (text.length > 0) {
          lines.push(text);
          lines.push("");
        }
        break;
      }
      case "heading_1": {
        numberedCounter = 0;
        lines.push(`# ${richTextToPlain(block.heading_1?.rich_text ?? [])}`);
        lines.push("");
        break;
      }
      case "heading_2": {
        numberedCounter = 0;
        lines.push(`## ${richTextToPlain(block.heading_2?.rich_text ?? [])}`);
        lines.push("");
        break;
      }
      case "heading_3": {
        numberedCounter = 0;
        lines.push(`### ${richTextToPlain(block.heading_3?.rich_text ?? [])}`);
        lines.push("");
        break;
      }
      case "bulleted_list_item": {
        numberedCounter = 0;
        lines.push(
          `- ${richTextToPlain(block.bulleted_list_item?.rich_text ?? [])}`,
        );
        break;
      }
      case "numbered_list_item": {
        numberedCounter += 1;
        lines.push(
          `${numberedCounter}. ${
            richTextToPlain(block.numbered_list_item?.rich_text ?? [])
          }`,
        );
        break;
      }
      case "divider": {
        numberedCounter = 0;
        lines.push("---");
        lines.push("");
        break;
      }
      default: {
        numberedCounter = 0;
        break;
      }
    }
  }

  return lines.join("\n").trim();
}

function richTextToPlain(richText: Array<{ plain_text?: string }>): string {
  return richText.map((item) => item.plain_text ?? "").join("").trim();
}

export function markdownToBlocks(markdown: string | null): BlockObjectRequest[] {
  if (!markdown) return [];

  const lines = markdown.split(/\r?\n/);
  const blocks: BlockObjectRequest[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push(makeHeadingBlock(1, trimmed.substring(2).trim()));
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(makeHeadingBlock(2, trimmed.substring(3).trim()));
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(makeHeadingBlock(3, trimmed.substring(4).trim()));
      continue;
    }

    if (trimmed.startsWith("- ")) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: textToRichText(trimmed.substring(2).trim()),
        },
      });
      continue;
    }

    const orderedMatch = /^\d+\.\s+(.*)$/u.exec(trimmed);
    if (orderedMatch) {
      blocks.push({
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: textToRichText(orderedMatch[1].trim()),
        },
      });
      continue;
    }

    if (trimmed === "---") {
      blocks.push({ type: "divider", divider: {} });
      continue;
    }

    blocks.push({
      type: "paragraph",
      paragraph: { rich_text: textToRichText(trimmed) },
    });
  }

  return blocks;
}

function makeHeadingBlock(level: 1 | 2 | 3, text: string): BlockObjectRequest {
  const rich_text = textToRichText(text);
  if (level === 1) {
    return { type: "heading_1", heading_1: { rich_text } };
  }
  if (level === 2) {
    return { type: "heading_2", heading_2: { rich_text } };
  }
  return { type: "heading_3", heading_3: { rich_text } };
}

function textToRichText(content: string): RichTextItemRequest[] {
  if (content.length === 0) {
    return [];
  }
  return [{ type: "text", text: { content } }];
}

export function validateCreatePayload(payload: unknown):
  | {
    ok: true;
    value: {
      title: string;
      categories: string[];
      ratings: string[];
      comment: string | null;
      content_markdown: string | null;
    };
  }
  | { ok: false; error: string } {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }

  const record = payload as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (title.length === 0) {
    return { ok: false, error: "title is required" };
  }

  const categories = normaliseStringArray(record.categories);
  const ratings = normaliseStringArray(record.ratings ?? record.rating);
  const comment = typeof record.comment === "string"
    ? record.comment.trim()
    : null;
  const contentMarkdown = typeof record.content_markdown === "string"
    ? record.content_markdown.trim()
    : null;

  return {
    ok: true,
    value: {
      title,
      categories,
      ratings,
      comment,
      content_markdown: contentMarkdown,
    },
  };
}

export function normaliseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter((item) =>
      item.length > 0
    );
  }
  return [];
}

function handleError(error: unknown): Response {
  if (error instanceof APIResponseError) {
    return jsonResponse(
      { error: error.message, code: error.code },
      error.status ?? 500,
    );
  }
  if (error instanceof Error) {
    return jsonResponse({ error: error.message }, 500);
  }
  return jsonResponse({ error: "Unknown error" }, 500);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}






