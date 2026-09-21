<?php
/**
 * OZI Platform - Récepteur Automatique de Déploiement APK pour LWS
 * Emplacement Racine (au cas où le dossier 'api/' n'existe pas dans htdocs)
 */

@ini_set('upload_max_filesize', '150M');
@ini_set('post_max_size', '150M');
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', 300);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Deploy-Token, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$configuredToken = getenv('OZI_DEPLOY_TOKEN');
if (!$configuredToken && file_exists(__DIR__ . '/deploy_token.txt')) {
    $configuredToken = trim(file_get_contents(__DIR__ . '/deploy_token.txt'));
}
if (!$configuredToken) {
    $configuredToken = 'ozi_deploy_secret_2026_x9k';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $apkExists = file_exists(__DIR__ . '/ozi-webtoon.apk');
    $apkSize = $apkExists ? filesize(__DIR__ . '/ozi-webtoon.apk') : 0;
    $apkDate = $apkExists ? date('Y-m-d H:i:s', filemtime(__DIR__ . '/ozi-webtoon.apk')) : null;

    echo json_encode([
        "success" => true,
        "service" => "OZI APK Auto-Deploy Receiver (LWS Root)",
        "status" => "ready",
        "current_apk" => [
            "exists" => $apkExists,
            "filename" => "ozi-webtoon.apk",
            "size_mb" => round($apkSize / (1024 * 1024), 2),
            "last_modified" => $apkDate,
            "url" => "https://" . ($_SERVER['HTTP_HOST'] ?? 'ozibd.net') . "/ozi-webtoon.apk"
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Méthode non autorisée. Utilisez POST."]);
    exit();
}

$receivedToken = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? $_POST['token'] ?? $_GET['token'] ?? '';
if (empty($receivedToken) || !hash_equals($configuredToken, $receivedToken)) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Jeton de déploiement invalide."]);
    exit();
}

$fileField = null;
if (isset($_FILES['apk']) && $_FILES['apk']['error'] === UPLOAD_ERR_OK) {
    $fileField = $_FILES['apk'];
} elseif (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $fileField = $_FILES['file'];
}

if (!$fileField) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Aucun fichier APK reçu."]);
    exit();
}

$tmpPath = $fileField['tmp_name'];
$dest = __DIR__ . '/ozi-reader.apk';

if (!move_uploaded_file($tmpPath, $dest)) {
    if (!copy($tmpPath, $dest)) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Impossible d'écrire ozi-reader.apk"]);
        exit();
    }
}
@chmod($dest, 0644);
@copy($dest, __DIR__ . '/ozi-webtoon.apk');
@chmod(__DIR__ . '/ozi-webtoon.apk', 0644);
@copy($dest, __DIR__ . '/ozi-app.apk');
@chmod(__DIR__ . '/ozi-app.apk', 0644);

$fileSize = filesize($dest);
$sizeMb = round($fileSize / (1024 * 1024), 2);
$host = $_SERVER['HTTP_HOST'] ?? 'ozibd.net';

echo json_encode([
    "success" => true,
    "message" => "🎉 APK ozi-reader.apk remplacé avec succès sur LWS !",
    "details" => [
        "filename" => "ozi-reader.apk",
        "size_mb" => $sizeMb . " Mo",
        "download_url" => "https://" . $host . "/ozi-reader.apk"
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
