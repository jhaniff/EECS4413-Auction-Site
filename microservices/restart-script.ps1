Write-Host "====================================="
Write-Host " Building all microservices with mvnw"
Write-Host "====================================="


Set-Location authentication-service
.\mvnw.cmd clean package -DskipTests

Set-Location ..\auction-service
.\mvnw.cmd clean package -DskipTests

Set-Location ..\item-service
.\mvnw.cmd clean package -DskipTests

Set-Location ..\payment-service
.\mvnw.cmd clean package -DskipTests

Set-Location ..\api-gateway-service
.\mvnw.cmd clean package -DskipTests

Set-Location ..\service-registry
.\mvnw.cmd clean package -DskipTests

Set-Location ..

Write-Host "====================================="
Write-Host " Docker Compose down"
Write-Host "====================================="
docker compose down

Write-Host "====================================="
Write-Host " Rebuilding docker images (no cache)"
Write-Host "====================================="
docker compose build --no-cache

Write-Host "====================================="
Write-Host " Starting containers"
Write-Host "====================================="
docker compose up -d