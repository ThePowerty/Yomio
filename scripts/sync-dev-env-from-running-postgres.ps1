$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env"
$containerName = "daytracker-postgres"

if (-not (Test-Path -LiteralPath $envPath)) {
    throw ".env does not exist. Run .\scripts\init-dev-env.ps1 first."
}

$containerEnv = docker inspect $containerName --format '{{range .Config.Env}}{{println .}}{{end}}'
if ($LASTEXITCODE -ne 0) {
    throw "Could not inspect $containerName. Make sure the PostgreSQL container is running."
}

$values = @{}
foreach ($line in $containerEnv) {
    $separator = $line.IndexOf('=')
    if ($separator -gt 0) {
        $values[$line.Substring(0, $separator)] = $line.Substring($separator + 1)
    }
}

foreach ($required in @("POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD")) {
    if ([string]::IsNullOrWhiteSpace($values[$required])) {
        throw "$containerName does not expose $required. No files were changed."
    }
}

$replacements = @{
    POSTGRES_DB = $values["POSTGRES_DB"]
    POSTGRES_USER = $values["POSTGRES_USER"]
    POSTGRES_PASSWORD = $values["POSTGRES_PASSWORD"]
    DB_URL = "jdbc:postgresql://localhost:55432/$($values['POSTGRES_DB'])"
    DB_USERNAME = $values["POSTGRES_USER"]
    DB_PASSWORD = $values["POSTGRES_PASSWORD"]
}

$updated = foreach ($line in [System.IO.File]::ReadAllLines($envPath)) {
    $separator = $line.IndexOf('=')
    if ($separator -gt 0) {
        $key = $line.Substring(0, $separator)
        if ($replacements.ContainsKey($key)) {
            "$key=$($replacements[$key])"
            continue
        }
    }
    $line
}

[System.IO.File]::WriteAllLines($envPath, $updated, [System.Text.UTF8Encoding]::new($false))
Write-Host "Synchronized .env with the running PostgreSQL container without exposing credentials."
