#!/bin/bash

set -e

echo "====================================="
echo " Building all microservices with mvnw"
echo "====================================="

cd authentication-service && ./mvnw clean package -DskipTests
cd ../auction-service && ./mvnw clean package -DskipTests
cd ../item-service && ./mvnw clean package -DskipTests
cd ../payment-service && ./mvnw clean package -DskipTests
cd ../api-gateway-service && ./mvnw clean package -DskipTests
cd ../service-registry && ./mvnw clean package -DskipTests
cd ..

echo "====================================="
echo " Docker Compose down (with volumes)"
echo "====================================="
docker compose down -v

echo "====================================="
echo " Rebuilding docker images (no cache)"
echo "====================================="
docker compose build --no-cache

echo "====================================="
echo " Starting containers"
echo "====================================="
docker compose up