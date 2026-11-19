param(
    [string]$Container = "daytracker-postgres",
    [string]$Database = "tracker",
    [string]$DatabaseUser = "yomio",
    [string]$OutputDirectory = ".\backups"
)

$ErrorActionPreference = "Stop"
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$fileName = "$Database-$timestamp.dump"
$containerFile = "/tmp/$fileName"
$hostFile = Join-Path $resolvedOutput $fileName

docker exec $Container pg_dump -U $DatabaseUser -d $Database --format=custom --no-owner --no-acl --file=$containerFile
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed" }
docker cp "${Container}:$containerFile" $hostFile
if ($LASTEXITCODE -ne 0) { throw "docker cp failed" }
docker exec $Container rm -f $containerFile

Write-Output $hostFile
