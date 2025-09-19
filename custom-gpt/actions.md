# Supabase Edge Actions

## Meals API (/meals)
Bas-URL: https://<project-ref>.functions.supabase.co

### GET /meals
- **query** *(string, valfri)*: fritext i titel.
- **categories** *(string|list, valfri)*: en eller flera Kategori-taggar.
- **ratings** *(string|list, valfri)*: en eller flera Betyg-taggar.
- **cursor** *(string, valfri)*: Supabase-forward cursor (värdet från 
ext_cursor).
- **limit** *(int, valfri)*: max 1–100 (default 10).

`json
{
  "meals": [
    {
      "id": "uuid",
      "title": "Kikärtsgryta med ajvar",
      "categories": ["Baljväxter"],
      "ratings": ["A1", "H1"],
      "comment": "Barnen tyckte det var ok",
      "url": "https://www.notion.so/..."
    }
  ],
  "has_more": false,
  "next_cursor": null
}
`

### GET /meals/{pageId}
Returerar samma metadata som listan plus content_markdown med sidans innehåll i Markdown.

`json
{
  "id": "...",
  "title": "Kikärtsgryta med ajvar",
  "categories": ["Baljväxter"],
  "ratings": ["A1", "H1"],
  "comment": "Barnen tyckte det var ok",
  "url": "https://www.notion.so/...",
  "content_markdown": "# Kikärtsgryta\n\n4 portioner..."
}
`

### POST /meals
Body (JSON):
`json
{
  "title": "Kikärtsgryta med ajvar",
  "categories": ["Baljväxter"],
  "ratings": ["A1"],
  "comment": "Barnen tyckte det var ok",
  "content_markdown": "# Kikärtsgryta med ajvar ..."
}
`

Svar 201 Created:
`json
{
  "id": "...",
  "url": "https://www.notion.so/..."
}
`

**Fel:** 400 vid ogiltig input, 404 om sidan saknas, 5xx vid Notion/Supabase-fel. Alla svar: { "error": "..." } plus ev. code från Notion.

> Autentisering: hanteras av Supabase Functions (Bearer Authorization header från GPT Actions). Ingen extra token behövs här.
