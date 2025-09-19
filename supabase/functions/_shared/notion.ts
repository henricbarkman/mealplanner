import { Client } from "npm:@notionhq/client";

export const NOTION_API_TOKEN_ENV = "NOTION_API_TOKEN";
export const NOTION_MEALS_DATABASE_ID_ENV = "NOTION_MEALS_DATABASE_ID";

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
