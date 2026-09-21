<?php
/**
 * OZI Platform - Récepteur Automatique de Déploiement APK pour LWS
 * Permet à GitHub Actions de remplacer automatiquement le fichier APK sur le serveur LWS
 * dès que la compilation se termine sur GitHub, sans aucune intervention manuelle.
 */

// Augmenter les limites pour les gros fichiers APK (30 Mo - 150 Mo)
@ini_set('upload_max_filesize', '150M');
@ini_set('post_max_size', '150M');
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', 300);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Deploy-Token, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Répondre aux requêtes préliminaires CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Clé secrète de déploiement (peut être surchargée par variable d'environnement ou fichier de config)
$configuredToken = getenv('OZI_DEPLOY_TOKEN');
if (!$configuredToken && file_exists(__DIR__ . '/deploy_token.txt')) {
    $configuredToken = trim(file_get_contents(__DIR__ . '/deploy_token.txt'));
}
if (!$configuredToken) {
    // Clé de sécurité par défaut pour le pipeline OZI
    $configuredToken = 'ozi_deploy_secret_2026_x9k';
}

// Vérification en mode GET (pour tester si l'endpoint est en ligne)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rootDir = dirname(__DIR__);
    $apkExists = file_exists($rootDir . '/ozi-webtoon.apk');
    $apkSize = $apkExists ? filesize($rootDir . '/ozi-webtoon.apk') : 0;
    $apkDate = $apkExists ? date('Y-m-d H:i:s', filemtime($rootDir . '/ozi-webtoon.apk')) : null;

    echo json_encode([
        "success" => true,
        "service" => "OZI APK Auto-Deploy Receiver (LWS)",
        "status" => "ready",
        "current_apk" => [
            "exists" => $apkExists,
            "filename" => "ozi-webtoon.apk",
            "size_bytes" => $apkSize,
            "size_mb" => round($apkSize / (1024 * 1024), 2),
            "last_modified" => $apkDate,
            "url" => "https://" . ($_SERVER['HTTP_HOST'] ?? 'ozibd.net') . "/ozi-webtoon.apk"
        ],
        "instructions" => "Envoyez une requête POST avec l'en-tête X-Deploy-Token et le champ de fichier 'apk'."
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit();
}

// Vérifier que la méthode est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "Méthode non autorisée. Utilisez POST pour envoyer l'APK."
    ]);
    exit();
}

// Vérification de la clé d'authentification
$receivedToken = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? $_POST['token'] ?? $_GET['token'] ?? '';
if (empty($receivedToken) || !hash_equals($configuredToken, $receivedToken)) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "error" => "Authentification refusée : jeton de déploiement invalide ou manquant."
    ]);
    exit();
}

// Récupérer le fichier téléversé
$fileField = null;
if (isset($_FILES['apk']) && $_FILES['apk']['error'] === UPLOAD_ERR_OK) {
    $fileField = $_FILES['apk'];
} elseif (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $fileField = $_FILES['file'];
}

if (!$fileField) {
    $errCode = isset($_FILES['apk']['error']) ? $_FILES['apk']['error'] : (isset($_FILES['file']['error']) ? $_FILES['file']['error'] : 'Aucun fichier reçu');
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Aucun fichier APK valide reçu dans la requête POST.",
        "upload_error_code" => $errCode
    ]);
    exit();
}

$tmpPath = $fileField['tmp_name'];
$originalName = $fileField['name'];
$fileSize = filesize($tmpPath);

// Vérification de l'extension
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if ($ext !== 'apk') {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Format de fichier invalide. Seuls les fichiers .apk sont autorisés."
    ]);
    exit();
}

// Vérification de l'en-tête ZIP/APK (les APK sont des archives ZIP commençant par 'PK\x03\x04')
$fp = fopen($tmpPath, 'rb');
$header = fread($fp, 4);
fclose($fp);

if ($header !== "PK\x03\x04") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Le fichier transmis n'est pas un package binaire Android APK valide."
    ]);
    exit();
}

// Racine du site web (où index.html et ozi-lws-dist sont situés)
$rootDir = dirname(__DIR__);

// Liste des emplacements cibles à remplacer automatiquement
$targets = [
    $rootDir . '/ozi-reader.apk',
    $rootDir . '/ozi-webtoon.apk',
    $rootDir . '/ozi-app.apk',
    $rootDir . '/app-debug.apk'
];

// Dossier uploads/apk/ également pour archivage
$archiveDir = $rootDir . '/uploads/apk';
if (!is_dir($archiveDir)) {
    @mkdir($archiveDir, 0755, true);
}
$targets[] = $archiveDir . '/latest.apk';

$copiedCount = 0;
$primaryDestination = $targets[0];

// Déplacer le fichier temporaire vers la première cible
if (!move_uploaded_file($tmpPath, $primaryDestination)) {
    // Si move_uploaded_file échoue (ex: restrictions de dossier temporaire), tenter un copy direct
    if (!copy($tmpPath, $primaryDestination)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Impossible d'écrire le fichier APK sur le serveur LWS dans " . $primaryDestination
        ]);
        exit();
    }
}
@chmod($primaryDestination, 0644);
$copiedCount++;

// Copier vers les alias pour assurer la rétro-compatibilité
for ($i = 1; $i < count($targets); $i++) {
    if (@copy($primaryDestination, $targets[$i])) {
        @chmod($targets[$i], 0644);
        $copiedCount++;
    }
}

// Calcul du checksum SHA256 pour vérification d'intégrité
$sha256 = hash_file('sha256', $primaryDestination);
$sizeMb = round($fileSize / (1024 * 1024), 2);
$timestamp = time();
$dateHuman = date('Y-m-d H:i:s', $timestamp);
$host = $_SERVER['HTTP_HOST'] ?? 'ozibd.net';

// Écrire un fichier d'informations sur la version actuelle
$versionInfo = [
    "status" => "success",
    "version_name" => "1.0.0",
    "build_number" => $timestamp,
    "filename" => "ozi-webtoon.apk",
    "aliases" => ["ozi-app.apk", "app-debug.apk", "uploads/apk/latest.apk"],
    "size_bytes" => $fileSize,
    "size_mb" => $sizeMb,
    "sha256" => $sha256,
    "updated_at" => $dateHuman,
    "timestamp" => $timestamp,
    "download_url" => "https://" . $host . "/ozi-webtoon.apk",
    "deploy_method" => "GitHub Actions CI/CD"
];

file_put_contents(__DIR__ . '/apk-version.json', json_encode($versionInfo, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

// Réponse réussie retournée à GitHub Actions
http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "🎉 APK Android remplacé avec succès sur le serveur LWS !",
    "details" => [
        "filename" => "ozi-webtoon.apk",
        "size_mb" => $sizeMb . " Mo",
        "size_bytes" => $fileSize,
        "updated_at" => $dateHuman,
        "sha256" => substr($sha256, 0, 16) . '...',
        "download_url" => "https://" . $host . "/ozi-webtoon.apk",
        "targets_updated" => $copiedCount
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
