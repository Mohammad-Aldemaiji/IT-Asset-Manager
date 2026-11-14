$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
    & npm.cmd run lint
    if ($LASTEXITCODE -ne 0) { throw 'Frontend lint failed.' }
    & npm.cmd test
    if ($LASTEXITCODE -ne 0) { throw 'Frontend tests failed.' }
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
    Push-Location backend
    try {
        & .\mvnw.cmd -B clean verify
        if ($LASTEXITCODE -ne 0) { throw 'Backend verification failed. Use JDK 21 and check JAVA_HOME.' }
    } finally { Pop-Location }
    Write-Host 'Ready: backend\target\it-asset-manager-2.0.0.jar'
    Write-Host 'Run from backend: java -jar target\it-asset-manager-2.0.0.jar'
} finally { Pop-Location }
