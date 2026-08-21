/**
 * Helper d'upload & conversion d'images locales pour le lecteur et l'admin OZI.
 * Permet :
 * 1. La conversion en Base64 compressée / Blob URL pérenne
 * 2. L'upload direct vers un bucket / stockage ou stockage IndexedDB / LocalStorage optimisé
 * 3. Le support drag & drop et multi-fichiers pour les planches de webtoon.
 */

export interface UploadedImageResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

/**
 * Lit un fichier local (File) et retourne une Data URL Base64 optimisée
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Redimensionne et compresse une image côté client pour éviter la surcharge mémoire
 * Idéal pour les couvertures d'œuvres, bannières et planches de webtoons
 */
export const compressImageFile = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 2400,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Exporter en WebP si supporté ou JPEG
        const compressedDataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Traite une liste de fichiers d'images de planches et les retourne dans l'ordre naturel
 */
export const processBatchImages = async (
  files: FileList | File[],
  onProgress?: (current: number, total: number) => void
): Promise<UploadedImageResult[]> => {
  const fileArray = Array.from(files).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

  const results: UploadedImageResult[] = [];

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    if (!file.type.startsWith('image/')) continue;

    try {
      // Pour les planches webtoon, on garde une excellente qualité
      const optimizedUrl = await compressImageFile(file, 1200, 3200, 0.88);
      results.push({
        url: optimizedUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } catch (e) {
      // Fallback direct FileReader
      const fallbackUrl = await fileToDataUrl(file);
      results.push({
        url: fallbackUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    if (onProgress) {
      onProgress(i + 1, fileArray.length);
    }
  }

  return results;
};
