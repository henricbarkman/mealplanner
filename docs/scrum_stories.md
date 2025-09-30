# Scrum-stories för actions-schemat

## MP-A: Hämta schema först (PropertyResolver)

**User story**  
Som AI-agent vill jag alltid läsa databasens property-metadata först så att jag kan filtrera/uppdatera med aktuella namn/typer även om de ändras i Notion.

**Scope / ändringar**
- I `/v1/databases/{database_id}`: uppdatera `description`/`summary` → “Kalla denna endpoint före `/query` för att hämta property-namn och typer. Bygg ett PropertyResolver dynamiskt.”
- Lista roller i beskrivningen: `titleProp`, `categoryProp`, `labelProp`, `planCheckboxProp`, `lastAteProp`, `cooldownProp`, `planScoreProp`.

**AC**
- Beskrivningen förklarar att metadata alltid ska hämtas först.
- Exempel visar hur man läser `type` per property.

**Test**
1. Läs en databas och identifiera `title`-property.  
2. Byt namn på “Kategori” i Notion → filter fungerar ändå.

---

## MP-B: RequestBody obligatorisk för `/query` och `/search`

**User story**  
Som AI-agent vill jag förhindras att skicka tom body så att connectorn inte faller.

**Scope / ändringar**
- `/v1/databases/{database_id}/query`: `requestBody.required: true`.  
- `/v1/search`: `requestBody.required: true`.  
- Lägg till `page_size` och `start_cursor` i schema.

**AC**
- Validator stoppar POST utan body.
- Båda endpoints har `page_size`/`start_cursor` i schema + exempel.

**Test**
1. POST `/query` utan body → schemafel.  
2. POST `/search` med `{ "query":"lax","page_size":50 }` → 200.

---

## MP-C: Adaptiva filter-exempel (select vs multi_select)

**User story**  
Som AI-agent vill jag ha färdiga filtermallar för både `select` och `multi_select` samt för titel.

**Scope / ändringar**
- Lägg till exempel i `/query`:
  ```json
  { "filter": { "property": "<categoryPropName>", "select": { "equals": "Fisk" } }, "page_size": 25 }
  ```
  ```json
  { "filter": { "property": "<categoryPropName>", "multi_select": { "contains": "Fisk" } }, "page_size": 25 }
  ```
  ```json
  { "filter": { "property": "<titlePropName>", "title": { "contains": "lax" } }, "page_size": 25 }
  ```
  ```json
  { "filter": { "or": [
    { "property": "<categoryPropName>", "select": { "equals": "Fisk" } },
    { "property": "<categoryPropName>", "multi_select": { "contains": "Fisk" } }
  ]}, "page_size": 25 }
  ```

**AC**
- Exempel syntaktiskt korrekta.
- Både select och multi_select visas.

**Test**
1. Kategori=select → `equals`-exempel → 200.  
2. Kategori=multi_select → `contains`-exempel → 200.

---

## MP-D: Strama åt block-append

**User story**  
Som AI-agent vill jag stoppas från att skicka ogiltiga blockfält (t.ex. `is_toggleable` på list-items).

**Scope / ändringar**
- I `AppendChildrenPayload.items`: `additionalProperties: false`.  
- Inför block-specifika scheman: `ParagraphBlock`, `BulletedListItemBlock`, `Heading1Block/2/3Block`.  
- Endast headings tillåter `is_toggleable`.

**AC**
- `is_toggleable` avvisas på list-items.  
- Exempel (`appendParagraph`, `appendList`, `appendTodo`) fungerar.

**Test**
1. Append list-item + `is_toggleable` → schemafel.  
2. Append heading_2 med `is_toggleable:true` → 200.

---

## MP-E: Header-disciplin

**User story**  
Som AI-agent vill jag att alla POST/PATCH kräver `Content-Type` och `Notion-Version`.

**Scope / ändringar**
- Samtliga POST/PATCH ska ha:
  - `Content-Type: application/json` (required).  
  - `Notion-Version: 2022-06-28` (required).

**AC**
- Alla POST/PATCH i schemat visar dessa headers som obligatoriska.

**Test**
1. POST `/pages` utan `Content-Type` → schemafel.  
2. PATCH `/blocks/{id}` utan `Notion-Version` → schemafel.

---

## MP-F: Paginering – schema + exempel

**User story**  
Som AI-agent vill jag ha pagineringsfält i schema och exempel för `/search` och `/query`.

**Scope / ändringar**
- Lägg till `page_size` (int, max 100) och `start_cursor` (string).  
- Exempel:
  ```json
  { "query": "lax", "filter": { "value": "page", "property": "object" }, "page_size": 50 }
  ```
  ```json
  { "page_size": 50 }
  ```

**AC**
- Paginering dokumenteras i båda endpoints.

**Test**
1. `/query` med `page_size:50` → 200 + ev. `next_cursor`.  
2. `/search` med `page_size:50` → 200.

---

## MP-G: Dynamiska property-exempel

**User story**  
Som AI-agent vill jag se exempel för vanliga fälttyper utan att låsa namn.

**Scope / ändringar**
- Lägg till i create/update:
  ```json
  "<lastAtePropName>": { "date": { "start": "2025-09-01" } }
  "<cooldownPropName>": { "number": 45 }
  "<planCheckboxPropName>": { "checkbox": true }
  "<typePropName>": { "select": { "name": "Gryta" } }
  "<categoryPropName>": { "multi_select": [ { "name": "Fisk" }, { "name": "Middag" } ] }
  ```
- Lägg till filter-exempel:
  ```json
  { "filter": { "property": "<planScorePropName>", "formula": { "number": { "greater_than": 0 } } } }
  ```
  ```json
  { "filter": { "and": [
    { "property": "<planScorePropName>", "formula": { "number": { "greater_than": 0 } } },
    { "property": "<planCheckboxPropName>", "checkbox": { "equals": true } }
  ]}}
  ```

**AC**
- Exempel visar date, number, checkbox, select, multi_select.  
- Platshållare `<…PropName>` används.

**Test**
1. Uppdatera datumfält → 200.  
2. Uppdatera checkbox → 200.  
3. Filter på formula number > 0 → 200.

---

## Gemensam DoD

- OpenAPI-YAML validerar (Swagger Editor) utan fel.  
- Alla exempel körs igenom manuell “dry-run” mot Notion API (2022-06-28).  
- Patch-version bump och CHANGELOG uppdaterad.  
- Minst 2 provanrop enligt testfallen ger 200.  
- Schemafel-meddelanden är begripliga.
