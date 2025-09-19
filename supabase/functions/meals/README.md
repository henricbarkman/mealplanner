# Supabase Edge Function: meals

Edge-funktionen hanterar läsning och skapande av receptsidor i Notion.

## Förutsättningar
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli)
- [Deno](https://deno.land/#installation) 2.x (för tester och lokal körning)
- En Notion-integration med åtkomst till receptdatabasen

## Miljövariabler
1. Kopiera supabase/functions/.env.example till supabase/functions/.env och fyll i:
   `env
   NOTION_API_TOKEN=din-notion-integration-token
   NOTION_MEALS_DATABASE_ID=250b0484bfa480b99341f936bcce2f6d
   `
2. När du ska deploya till Supabase, se till att samma värden sätts som secrets:
   `ash
   supabase secrets set \
     NOTION_API_TOKEN=din-token \
     NOTION_MEALS_DATABASE_ID=250b0484bfa480b99341f936bcce2f6d
   `

## Köra lokalt
`ash
cd supabase
supabase functions serve meals --env-file functions/.env
`
Funktionen exponeras på http://localhost:54321/functions/v1/meals.

### Exempelkommandon
Lista recept:
`ash
curl "http://localhost:54321/functions/v1/meals?query=gryta"
`

Hämta ett specifikt recept:
`ash
curl "http://localhost:54321/functions/v1/meals/<page-id>"
`

Skapa recept:
`ash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
        "title": "Kikärtsgryta med ajvar",
        "categories": ["Baljväxter"],
        "ratings": ["A1"],
        "comment": "Barnen tyckte det var ok",
        "content_markdown": "# Kikärtsgryta med ajvar\n\n4 portioner ..."
      }' \
  "http://localhost:54321/functions/v1/meals"
`

## Tester
`ash
cd supabase/functions
deno task test
`
Tester täcker validering och Markdown/Notion-konvertering utan att kontakta externa API:er.

## Felhantering
Funktionen svarar med { "error": "..." } och relevant HTTP-status vid valideringsfel eller svar från Notion. Loggar skrivs till stdout/stderr för felsökning i Supabase CLI.
