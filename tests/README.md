# Action Validation Tests

These manual tests exercise the Notion API endpoints used by the Custom GPT. They rely on `curl.exe`, which ships with Windows 10+.

## 1. Environment variables
Run the following in PowerShell (no output if it succeeds):

```powershell
$env:NOTION_TOKEN = "<your-notion-token>"
$env:NOTION_DB_ID = "250b0484bfa480b99341f936bcce2f6d"
$env:NOTION_SAMPLE_PAGE_ID = "<any-existing-page-id>"
```

Optional:

```powershell
$env:NOTION_CREATE_TITLE = "Testrecept via script"  # used when running the create test
```

## 2. Payload files
Edit the JSON files in `tests/payloads/` so they align with the live properties in your database. The templates never contain secrets.
- `update-full.json` - patch an existing page
- `query-by-category.json` - filtered database query
- `create-page.json` - minimal payload for creating a new recipe (placeholders are replaced by the script)

## 3. Run the tests
From the project root:

```powershell
scripts/test-actions.ps1              # runs metadata, query, update, getPage, children
scripts/test-actions.ps1 -IncludeCreate  # also runs the create test
```

Use `-Only <Name>` to run a single test (names: `Metadata`, `Query`, `Update`, `GetPage`, `Children`, `Create`). Run `scripts/test-actions.ps1 -Help` for a quick reminder.

## 4. Review results
- Inspect console output for HTTP status codes (expect `200` or `201`).
- The script stores headers and bodies under `tests/responses/` for traceability.
- After each run, append a line to `tests/TEST_LOG.md` with the date, targets touched, and outcome.

