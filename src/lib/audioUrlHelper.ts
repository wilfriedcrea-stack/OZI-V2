/**
 * Utilitaire pour convertir automatiquement les liens de partage Google Drive, Dropbox, SoundCloud ou OneDrive
 * en flux de streaming audio direct (.mp3, flux audio brut) compatibles avec la balise <audio> HTML5.
 */
export function formatDirectAudioUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Détection des liens Google Drive
  // Formats supportés :
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://drive.google.com/file/d/FILE_ID/edit
  const googleDriveMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (googleDriveMatch && googleDriveMatch[1]) {
    const fileId = googleDriveMatch[1];
    // Lien direct de streaming Google Drive haute compatibilité
    return `https://docs.google.com/uc?export=download&id=${fileId}`;
  }

  // 2. Détection des liens Dropbox (remplacer dl=0 par raw=1)
  if (trimmed.includes('dropbox.com')) {
    let cleanDropbox = trimmed.replace(/[?&]dl=0/, '').replace(/[?&]dl=1/, '');
    const separator = cleanDropbox.includes('?') ? '&' : '?';
    return `${cleanDropbox}${separator}raw=1`;
  }

  // 3. Détection des liens OneDrive (remplacer redir par download)
  if (trimmed.includes('1drv.ms') || trimmed.includes('onedrive.live.com')) {
    if (trimmed.includes('redir')) {
      return trimmed.replace('redir?', 'download?');
    }
  }

  return trimmed;
}
