<?php
/**
 * OZI Platform - Informations et Téléchargement Sécurisé de l'APK
 * Retourne les détails de la dernière version d'APK disponible sur LWS
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$rootDir = dirname(__DIR__);
$apkPath = $rootDir . '/ozi-webtoon.apk';
if (!file_exists($apkPath)) {
    $apkPath = $rootDir . '/ozi-app.apk';
}
if (!file_exists($apkPath)) {
    $apkPath = $rootDir . '/app-debug.apk';
}

$jsonFile = __DIR__ . '/apk-version.json';
if (file_exists($jsonFile)) {
    $data = json_decode(file_get_contents($jsonFile), true);
    if (is_array($data)) {
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit();
    }
}

$host = $_SERVER['HTTP_HOST'] ?? 'ozibd.net';

if (file_exists($apkPath)) {
    $size = filesize($apkPath);
    $time = filemtime($apkPath);
    echo json_encode([
        "status" => "available",
        "filename" => basename($apkPath),
        "size_bytes" => $size,
        "size_mb" => round($size / (1024 * 1024), 2),
        "updated_at" => date('Y-m-d H:i:s', $time),
        "timestamp" => $time,
        "download_url" => "https://" . $host . "/" . basename($apkPath)
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} else {
    echo json_encode([
        "status" => "pending",
        "message" => "L'APK sera automatiquement disponible après la première compilation GitHub Actions.",
        "expected_url" => "https://" . $host . "/ozi-webtoon.apk"
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
