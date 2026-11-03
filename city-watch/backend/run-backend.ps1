$ErrorActionPreference = "Stop"
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn spring-boot:run
} elseif (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd spring-boot:run
} else {
    Write-Host "Maven was not found. Install Maven or use the Maven copy provided by your IDE/Antigravity."
    exit 1
}
