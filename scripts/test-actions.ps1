[CmdletBinding()]
param(
    [ValidateSet("Metadata","Query","Update","GetPage","Children","Create")]
    [string[]]$Only,
    [switch]$IncludeCreate,
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: scripts/test-actions.ps1 [-Only <TestName> ...] [-IncludeCreate]" -ForegroundColor Cyan
    Write-Host "Tests: Metadata, Query, Update, GetPage, Children, Create" -ForegroundColor Cyan
    Write-Host "Set NOTION_TOKEN, NOTION_DB_ID, and (optionally) NOTION_SAMPLE_PAGE_ID + NOTION_CREATE_TITLE." -ForegroundColor Cyan
    exit 0
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot '..')).Path
$payloadDir = Join-Path $repoRoot 'tests' 'payloads'
$responsesDir = Join-Path $repoRoot 'tests' 'responses'

New-Item -ItemType Directory -Force -Path $responsesDir | Out-Null

$curl = Get-Command curl.exe -CommandType Application -ErrorAction SilentlyContinue
if (-not $curl) {
    throw 'curl.exe not found on PATH. Install curl or run the commands manually.'
}

$token = $env:NOTION_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
    throw 'Environment variable NOTION_TOKEN is required.'
}

$dbId = $env:NOTION_DB_ID
if ([string]::IsNullOrWhiteSpace($dbId)) {
    throw 'Environment variable NOTION_DB_ID is required.'
}

$pageId = $env:NOTION_SAMPLE_PAGE_ID
$createTitle = if ($env:NOTION_CREATE_TITLE) { $env:NOTION_CREATE_TITLE } else { "Testrecept " + (Get-Date -Format 'yyyyMMdd-HHmm') }

function Should-Run {
    param([Parameter(Mandatory=$true)][string]$Name)
    if ($Only -and $Only.Count -gt 0) {
        return $Only -contains $Name
    }
    if ($Name -eq 'Create') {
        return $IncludeCreate.IsPresent
    }
    return $true
}

function Invoke-CurlTest {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [Parameter(Mandatory=$true)][string]$Method,
        [Parameter(Mandatory=$true)][string]$Url,
        [string]$PayloadPath
    )

    $safeName = ($Name.ToLowerInvariant() -replace '[^a-z0-9]+','-').Trim('-')
    if (-not $safeName) { $safeName = 'response' }
    $bodyPath = Join-Path $responsesDir "$safeName-body.json"
    $headerPath = Join-Path $responsesDir "$safeName-headers.txt"

    $args = @('-sS','-D', $headerPath)
    if ($Method -and $Method -ne 'GET') {
        $args += @('-X', $Method)
    }
    $args += @($Url,
        '-H', "Authorization: Bearer $token",
        '-H', 'Notion-Version: 2022-06-28')
    if ($PayloadPath) {
        $args += @('-H', 'Content-Type: application/json', '-d', "@$PayloadPath")
    }

    Write-Host "--> $Name ($Method $Url)" -ForegroundColor Cyan
    & $curl.Path @args | Set-Content -Encoding UTF8 $bodyPath
    if ($LASTEXITCODE -ne 0) {
        throw "curl.exe exited with code $LASTEXITCODE for test '$Name'"
    }

    $statusLine = (Get-Content $headerPath | Where-Object { $_ -match '^HTTP/' } | Select-Object -Last 1)
    if ($statusLine) {
        Write-Host "    Status: $statusLine" -ForegroundColor Green
    } else {
        Write-Warning "    Status line not found in response headers for '$Name'."
    }
    Write-Host "    Saved body: $bodyPath" -ForegroundColor DarkGray
    Write-Host "    Saved headers: $headerPath" -ForegroundColor DarkGray
}

function Get-TempPayload {
    param(
        [Parameter(Mandatory=$true)][string]$TemplatePath,
        [Parameter(Mandatory=$true)][hashtable]$Replacements
    )
    if (-not (Test-Path $TemplatePath)) {
        throw "Payload template not found: $TemplatePath"
    }
    $content = Get-Content $TemplatePath -Raw
    foreach ($key in $Replacements.Keys) {
        $content = $content.Replace($key, $Replacements[$key])
    }
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Encoding UTF8 -Path $tempFile -Value $content
    return $tempFile
}

if (Should-Run -Name 'Metadata') {
    Invoke-CurlTest -Name 'Metadata' -Method 'GET' -Url "https://api.notion.com/v1/databases/$dbId"
}

if (Should-Run -Name 'Query') {
    $payload = Join-Path $payloadDir 'query-by-category.json'
    Invoke-CurlTest -Name 'Query' -Method 'POST' -Url "https://api.notion.com/v1/databases/$dbId/query" -PayloadPath $payload
}

if (Should-Run -Name 'Update' -or Should-Run -Name 'GetPage' -or Should-Run -Name 'Children') {
    if ([string]::IsNullOrWhiteSpace($pageId)) {
        Write-Warning 'NOTION_SAMPLE_PAGE_ID not set; skipping Update/GetPage/Children tests.'
    } else {
        if (Should-Run -Name 'Update') {
            $updatePayload = Join-Path $payloadDir 'update-full.json'
            Invoke-CurlTest -Name 'Update' -Method 'PATCH' -Url "https://api.notion.com/v1/pages/$pageId" -PayloadPath $updatePayload
        }
        if (Should-Run -Name 'GetPage') {
            Invoke-CurlTest -Name 'GetPage' -Method 'GET' -Url "https://api.notion.com/v1/pages/$pageId"
        }
        if (Should-Run -Name 'Children') {
            Invoke-CurlTest -Name 'Children' -Method 'GET' -Url "https://api.notion.com/v1/blocks/$pageId/children"
        }
    }
}

if (Should-Run -Name 'Create') {
    $createTemplate = Join-Path $payloadDir 'create-page.json'
    $tempPayload = Get-TempPayload -TemplatePath $createTemplate -Replacements @{
        '__NOTION_DB_ID__' = $dbId
        '__NOTION_CREATE_TITLE__' = $createTitle
    }
    try {
        Invoke-CurlTest -Name 'Create' -Method 'POST' -Url 'https://api.notion.com/v1/pages' -PayloadPath $tempPayload
    }
    finally {
        Remove-Item $tempPayload -ErrorAction SilentlyContinue
    }
}

Write-Host 'Done.' -ForegroundColor Cyan
