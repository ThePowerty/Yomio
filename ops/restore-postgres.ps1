param(
    [Parameter(Mandatory = $true)][string]$BackupFile,
    [string]$Container = "daytracker-postgres",
    [string]$TargetDatabase = "tracker_restore_test",
    [string]$DatabaseUser = "yomio",
    [switch]$AllowNonTestDatabase
)

$ErrorActionPreference = "Stop"
$resolvedBackup = (Resolve-Path -LiteralPath $BackupFile).Path
if (-not $AllowNonTestDatabase -and -not $TargetDatabase.EndsWith("_restore_test")) {
    throw "For safety, the target database must end in _restore_test. Use -AllowNonTestDatabase only after an explicit production restore decision."
}
if ($TargetDatabase -notmatch '^[A-Za-z0-9_]+$') { throw "Invalid database name" }

$containerFile = "/tmp/yomio-restore.dump"
docker cp $resolvedBackup "${Container}:$containerFile"
if ($LASTEXITCODE -ne 0) { throw "docker cp failed" }

docker exec $Container dropdb -U $DatabaseUser --if-exists $TargetDatabase
if ($LASTEXITCODE -ne 0) { throw "dropdb failed" }
docker exec $Container createdb -U $DatabaseUser $TargetDatabase
if ($LASTEXITCODE -ne 0) { throw "createdb failed" }
docker exec $Container pg_restore -U $DatabaseUser -d $TargetDatabase --no-owner --no-acl --exit-on-error $containerFile
if ($LASTEXITCODE -ne 0) { throw "pg_restore failed" }
docker exec $Container psql -U $DatabaseUser -d $TargetDatabase -v ON_ERROR_STOP=1 -c "SELECT count(*) AS users FROM usuarios;"
if ($LASTEXITCODE -ne 0) { throw "restore verification failed" }
docker exec $Container rm -f $containerFile

Write-Output "Restore verified in database $TargetDatabase"
