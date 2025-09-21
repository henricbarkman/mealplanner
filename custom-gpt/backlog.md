# Custom GPT Action Backlog

## Current State
- ✅ `custom-gpt/actions-minimal.md` defines a minimal Notion API surface (query database, get page, update page, list child blocks, create page). We used it to validate end-to-end calls for fetching and updating the trimmed database.
- ✅ Focused title update action was validated in the GPT builder (see `custom-gpt/actions-updatePageTitle.md`). The file is currently empty because the action lives in the builder; consider re-exporting into this repo if we want local traceability.
- 📝 Notion database currently exposes only `Name` (title) and the auto-generated `Status`. All other properties were temporarily removed.

## Guiding Goal
Deliver a Custom GPT that can read, create, and update meal entries in Notion (title, metadata, recipe content) with predictable tests after each change.

## Epics and Stories
### Epic 0 – Baseline actions (Done)
- [x] **Story 0.1 – Minimal Notion schema exported**
  - Outcome: `actions-minimal.md` ingested by GPT builder; confirmed `queryMatDatabase`, `getPage`, and `updateMatPage` return 200 responses against the slim database.
  - Validation log: GPT builder Test Action run against a sample page id returned updated `Name`.

- [x] **Story 0.2 – Focused update title action**
  - Outcome: Single-operation schema to PATCH the `Name` property succeeded; we proved we can isolate one action when debugging.
  - Validation log: GPT builder Test Action with title payload succeeded (manual confirmation in Notion).

### Epic 1 – Restore meal metadata properties
- [ ] **Story 1.1 – Recreate Notion properties**
  - Tasks: Add back `URL`, `Kommentar`, `Kategori`, `Betyg`, and any other required fields (e.g. `Tillagningstid`, `Portioner`) in the Notion database; document their names and types.
  - Validation: In Notion UI, open Database > Properties and confirm the new fields. Run `GET https://api.notion.com/v1/databases/{db_id}` with headers `Authorization: Bearer <NOTION_TOKEN>` and `Notion-Version: 2022-06-28` to verify property metadata.
    ```bash
    curl https://api.notion.com/v1/databases/250b0484bfa480b99341f936bcce2f6d \
      -H "Authorization: Bearer $NOTION_TOKEN" \
      -H "Notion-Version: 2022-06-28"
    ```

- [ ] **Story 1.2 – Align `UpdateMatPageRequest` with live schema**
  - Tasks: Update `custom-gpt/actions-minimal.md` so each property matches the exact Notion field names, include examples for optional fields, and regenerate the condensed action if needed.
  - Validation: PATCH a page with all fields populated and ensure Notion reflects the change.
    ```bash
    curl -X PATCH https://api.notion.com/v1/pages/<page_id> \
      -H "Authorization: Bearer $NOTION_TOKEN" \
      -H "Content-Type: application/json" \
      -H "Notion-Version: 2022-06-28" \
      -d @tests/payloads/update-full.json
    ```
    Expected: 200 OK and updated values visible in Notion.

- [ ] **Story 1.3 – Update GPT builder action examples**
  - Tasks: Re-upload the schema, update example payloads, and capture screenshots or notes of the GPT builder test run.
  - Validation: In builder, run Test Action with a payload covering every property; result must be 200 and property changes must appear in Notion.

### Epic 2 – Reliable reads for planning
- [ ] **Story 2.1 – Filtered database queries**
  - Tasks: Provide request examples for filtering by categories, ratings, and status inside `QueryRequest` (e.g. multi_select filters).
  - Validation: `POST /v1/databases/.../query` with a filter returns narrowed results; confirm expected page ids.
    ```bash
    curl -X POST https://api.notion.com/v1/databases/250b0484bfa480b99341f936bcce2f6d/query \
      -H "Authorization: Bearer $NOTION_TOKEN" \
      -H "Content-Type: application/json" \
      -H "Notion-Version: 2022-06-28" \
      -d @tests/payloads/query-by-category.json
    ```

- [ ] **Story 2.2 – Map `getPage` responses**
  - Tasks: Document how each property appears in the Notion response (title text, multi_select arrays, etc.) so GPT can parse data reliably.
  - Validation: `GET /v1/pages/{page_id}` returns all properties with expected structure; log output sample under `tests/responses/get-page-example.json`.

### Epic 3 – Recipe content retrieval
- [ ] **Story 3.1 – Block children example**
  - Tasks: Provide a canonical example for `listBlockChildren`, including pagination handling.
  - Validation: `GET /v1/blocks/{page_id}/children` returns markdown-capable blocks saved under `tests/responses/children-example.json`.

- [ ] **Story 3.2 – Post-process content guidelines**
  - Tasks: Update system prompt or instructions to describe how GPT should summarize blocks into user-facing recipe text.
  - Validation: Dry-run in GPT builder ensuring retrieved blocks are summarized correctly in Swedish, with no hallucinated ingredients.

### Epic 4 – Create and duplicate meals
- [ ] **Story 4.1 – Flesh out `createPage`**
  - Tasks: Define the minimum create payload, including default tags and empty-rich_text placeholders when values are optional.
  - Validation: `POST /v1/pages` with a sample payload creates a new entry; confirm page appears in the database with correct defaults.

- [ ] **Story 4.2 – Duplicate workflow**
  - Tasks: Document a flow for duplicating an existing meal (read > create with modifications) and ensure GPT instructions cover confirmation prompts.
  - Validation: Manual scenario test in GPT builder—ask GPT to duplicate a recipe, verify creation, and ensure no unintended edits.

### Epic 5 – Automation and regression safety
- [ ] **Story 5.1 – Test harness**
  - Tasks: Add a lightweight test folder (`tests/payloads`, `tests/responses`) plus a README describing how to run curl checks; optionally create a `scripts/test-actions.ps1`.
  - Validation: Running the harness (with env vars set) exercises all CRUD endpoints and logs HTTP 200 responses.

- [ ] **Story 5.2 – Change log / release checklist**
  - Tasks: Maintain a change log for schema updates and a checklist to run before publishing to GPT builder (export schema, run tests, capture evidence).
  - Validation: Completed checklist stored with timestamp for each release; no deployment without passing tests.

## Validation Checklist Template
Before moving to the next story:
1. Confirm schema and Notion properties stay in sync (names, types, requirement flags).
2. Run the relevant curl or script test and store response under `tests/responses/`.
3. Record results (date, page id, outcome) in `tests/TEST_LOG.md`.
4. Update GPT builder examples/screenshots if the action schema changed.
