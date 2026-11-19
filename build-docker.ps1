param(
    [string]$be = "v22",
    [string]$fe = "v25",
    [switch]$onlyBE,
    [switch]$onlyFE,
    [switch]$noPush
)

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Tự động thêm tiền tố "v" nếu chỉ nhập số (VD: -be 22 -> v22)
if ($be -match "^\d+$") { $be = "v$be" }
if ($fe -match "^\d+$") { $fe = "v$fe" }

$beTag = "nvtaikma/quizizz-app:manager-BE-$be"
$feTag = "nvtaikma/quizizz-app:manager-FE-$fe"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 BẮT ĐẦU BUILD & PUSH DOCKER (MANAGER QUIZ HMC)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
if (-not $onlyFE) { Write-Host "📦 Backend Image : $beTag" -ForegroundColor Yellow }
if (-not $onlyBE) { Write-Host "📦 Frontend Image: $feTag" -ForegroundColor Yellow }
Write-Host ""

# 1. Build Backend
if (-not $onlyFE) {
    Write-Host "🔨 [1/4] Đang build Docker cho Backend ($beTag)..." -ForegroundColor Green
    Push-Location "$rootDir\BE"
    try {
        docker build -t $beTag .
        if ($LASTEXITCODE -ne 0) { throw "Build Backend thất bại!" }
    } finally {
        Pop-Location
    }
}

# 2. Build Frontend
if (-not $onlyBE) {
    Write-Host "🔨 [2/4] Đang build Docker cho Frontend ($feTag)..." -ForegroundColor Green
    Push-Location "$rootDir\FE"
    try {
        docker build --build-arg NEXT_PUBLIC_API_URL=https://manager-api.testhmc.site/api -t $feTag .
        if ($LASTEXITCODE -ne 0) { throw "Build Frontend thất bại!" }
    } finally {
        Pop-Location
    }
}

# 3. Push lên Docker Hub
if (-not $noPush) {
    if (-not $onlyFE) {
        Write-Host "☁️  [3/4] Đang push Backend lên Docker Hub ($beTag)..." -ForegroundColor Green
        docker push $beTag
        if ($LASTEXITCODE -ne 0) { throw "Push Backend thất bại!" }
    }

    if (-not $onlyBE) {
        Write-Host "☁️  [4/4] Đang push Frontend lên Docker Hub ($feTag)..." -ForegroundColor Green
        docker push $feTag
        if ($LASTEXITCODE -ne 0) { throw "Push Frontend thất bại!" }
    }
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "✅ HOÀN TẤT BUILD & PUSH THÀNH CÔNG!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "📋 Copy các lệnh dưới đây để chạy trên VPS:" -ForegroundColor Yellow
Write-Host ""
if (-not $onlyFE) {
    Write-Host "docker run -d --name manager-BE-$be --restart always --network host $beTag" -ForegroundColor White
}
if (-not $onlyBE) {
    Write-Host "docker run -d --name manager-FE-$fe --restart always -p 127.0.0.1:3001:3001 $feTag" -ForegroundColor White
}
Write-Host ""
