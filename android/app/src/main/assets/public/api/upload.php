<?php
/**
 * OZI Platform - Script d'Upload Haute Performance pour Hébergement LWS
 * Permet de stocker toutes les images, couvertures, planches webtoon et sons
 * directement sur le serveur LWS dans le dossier /uploads/
 */

// Headers CORS pour autoriser l'envoi depuis le site web et l'application mobile
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Répondre immédiatement aux requêtes préliminaires OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que la requête est en POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "Méthode non autorisée. Utilisez POST."
    ]);
    exit();
}

// Vérifier si un fichier a été transmis
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = isset($_FILES['file']) ? $_FILES['file']['error'] : 'Aucun fichier transmis';
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Erreur de téléversement : " . $errorCode
    ]);
    exit();
}

$file = $_FILES['file'];

// Dossier de destination demandé (sécurisé)
$folder = isset($_POST['folder']) ? trim($_POST['folder']) : 'general';
// Nettoyage strict du nom de dossier pour éviter les traversées de répertoire
$folder = preg_replace('/[^a-zA-Z0-9_\-\/]/', '', $folder);
$folder = trim($folder, '/');
if (empty($folder) || strpos($folder, '..') !== false) {
    $folder = 'general';
}

// Extensions et types MIME autorisés
$allowedExtensions = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
    'mp3' => 'audio/mpeg',
    'wav' => 'audio/wav',
    'ogg' => 'audio/ogg'
];

$fileInfo = pathinfo($file['name']);
$extension = strtolower($fileInfo['extension'] ?? '');

if (!array_key_exists($extension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Format de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, GIF, SVG, MP3, WAV, OGG."
    ]);
    exit();
}

// Taille max : 50 Mo
$maxSizeBytes = 50 * 1024 * 1024;
if ($file['size'] > $maxSizeBytes) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Le fichier est trop volumineux. Taille max : 50 Mo."
    ]);
    exit();
}

// Racine du répertoire uploads (à côté ou au-dessus de /api/)
$baseUploadDir = dirname(__DIR__) . '/uploads';
$targetDir = $baseUploadDir . '/' . $folder;

// Création récursive du dossier si inexistant avec permissions 0755
if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0755, true)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Impossible de créer le dossier de stockage sur le serveur LWS : " . $folder
        ]);
        exit();
    }
}

// Génération d'un nom de fichier unique et propre
$cleanOriginalName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $fileInfo['filename'] ?? 'file');
$cleanOriginalName = substr($cleanOriginalName, 0, 40);
$uniqueFilename = time() . '_' . bin2hex(random_bytes(4)) . '_' . $cleanOriginalName . '.' . $extension;
$targetFilePath = $targetDir . '/' . $uniqueFilename;

// Déplacement du fichier temporaire vers le stockage final
if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    // Détermination du protocole (HTTPS recommandé)
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'] ?? 'ozibd.net';
    
    // Construction de l'URL publique
    $publicUrl = $protocol . $host . '/uploads/' . $folder . '/' . $uniqueFilename;

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Fichier stocké avec succès sur le serveur LWS.",
        "url" => $publicUrl,
        "filename" => $uniqueFilename,
        "originalName" => $file['name'],
        "size" => $file['size'],
        "type" => $file['type'],
        "folder" => $folder,
        "path" => '/uploads/' . $folder . '/' . $uniqueFilename
    ]);
    exit();
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Échec du déplacement du fichier vers le dossier final."
    ]);
    exit();
}
