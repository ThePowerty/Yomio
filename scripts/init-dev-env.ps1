param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env"

if ((Test-Path -LiteralPath $envPath) -and -not $Force) {
    Write-Host ".env already exists. Use -Force only if you intentionally want to replace the local credentials."
    exit 0
}

function New-RandomHex([int]$byteCount) {
    $bytes = [byte[]]::new($byteCount)
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToHexString($bytes).ToLowerInvariant()
}

$postgresPassword = New-RandomHex 24
$jwtSecret = New-RandomHex 48
$content = @"
POSTGRES_DB=tracker
POSTGRES_USER=yomio
POSTGRES_PASSWORD=$postgresPassword
DB_URL=jdbc:postgresql://localhost:55432/tracker
DB_USERNAME=yomio
DB_PASSWORD=$postgresPassword
JWT_SECRET=$jwtSecret
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
HIBERNATE_DDL_AUTO=update
PASSWORD_RESET_SMTP_ENABLED=false
PASSWORD_RESET_FROM=
PASSWORD_RESET_BASE_URL=http://localhost:5173/reset-password
VITE_ANALYTICS_ENABLED=false
"@

[System.IO.File]::WriteAllText($envPath, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host "Created .env with random local credentials. The file is ignored by Git."
