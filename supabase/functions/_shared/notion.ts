import { Client } from "npm:@notionhq/client";

export const NOTION_API_TOKEN_ENV = "NOTION_API_TOKEN";
export const NOTION_MEALS_DATABASE_ID_ENV = "NOTION_MEALS_DATABASE_ID";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function notionHeaders(): Headers {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${requireEnv(NOTION_API_TOKEN_ENV)}`);
  headers.set("Notion-Version", NOTION_VERSION);
  return headers;
}

export async function notionApi(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = notionHeaders();
  if (init.headers) {
    const extra = new Headers(init.headers);
    extra.forEach((value, key) => headers.set(key, value));
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return await fetch(`${NOTION_API_BASE}${path}`, { ...init, headers });
}


function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getNotionClient(): Client {
  return new Client({ auth: requireEnv(NOTION_API_TOKEN_ENV) });
}

export function getMealsDatabaseId(): string {
  return requireEnv(NOTION_MEALS_DATABASE_ID_ENV);
}
