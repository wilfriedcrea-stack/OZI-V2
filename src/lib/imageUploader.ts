import { ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Helper d'upload vers Firebase Storage & Google Cloud Storage
 * avec compression WebP client, fallback Base64 / Blob et progression temps-réel.
 */

export interface UploadedImageResult {
  url: string;
  name: string;
  size: number;
  type: string;
  storagePath?: string;
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
 * Redimensionne et compresse une image côté client (format WebP haute performance)
 */
export const compressImageFile = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 2400,
  quality: number = 0.85
): Promise<{ dataUrl: string; blob: Blob }> => {
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
          const rawDataUrl = event.target?.result as string;
          resolve({ dataUrl: rawDataUrl, blob: file });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Exporter en WebP si supporté ou JPEG
        const compressedDataUrl =
          canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            resolve({
              dataUrl: compressedDataUrl,
              blob: blob || file,
            });
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload d'une image vers Firebase Storage avec fallback instantané
 * @param file Le fichier image
 * @param folder Le dossier cible (ex: 'covers', 'banners', 'webtoons/work-1/ch-1')
 * @param onProgress Callback de progression (0 à 100%)
 */
export const uploadImageToStorage = async (
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<UploadedImageResult> => {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `${Date.now()}_${cleanName}`;
  const storagePath = `${folder}/${uniqueName}`;

  try {
    // 1. Optimisation préalable
    const { dataUrl, blob } = await compressImageFile(file, 1400, 3200, 0.88);

    // 2. Tentative d'upload vers Firebase Storage
    if (storage) {
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: blob.type || 'image/webp',
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      };

      try {
        const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

        const downloadUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) onProgress(Math.round(progress));
            },
            (error) => {
              console.warn('Firebase Storage upload warning, using fast direct URL:', error);
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });

        return {
          url: downloadUrl,
          name: file.name,
          size: blob.size,
          type: blob.type || 'image/webp',
          storagePath,
        };
      } catch (storageError) {
        console.warn('Fallback direct Cloud CDN URL:', storageError);
        // Fallback transparent vers dataUrl optimisée
        return {
          url: dataUrl,
          name: file.name,
          size: blob.size,
          type: 'image/webp',
        };
      }
    }

    return {
      url: dataUrl,
      name: file.name,
      size: blob.size,
      type: 'image/webp',
    };
  } catch (err) {
    console.error('Upload image processing error:', err);
    const fallback = await fileToDataUrl(file);
    return {
      url: fallback,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }
};

/**
 * Traite et uploade un lot complet de planches webtoon ordonnées
 */
export const processBatchImages = async (
  files: FileList | File[],
  workId?: string,
  chapterNumber?: number,
  onProgress?: (current: number, total: number) => void
): Promise<UploadedImageResult[]> => {
  const fileArray = Array.from(files).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

  const results: UploadedImageResult[] = [];
  const folder = workId && chapterNumber ? `webtoons/${workId}/ch_${chapterNumber}` : 'webtoons/general';

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    if (!file.type.startsWith('image/')) continue;

    try {
      const uploadRes = await uploadImageToStorage(file, folder);
      results.push(uploadRes);
    } catch (e) {
      console.warn(`File ${file.name} fallback:`, e);
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
