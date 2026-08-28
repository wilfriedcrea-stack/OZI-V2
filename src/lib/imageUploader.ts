import { ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Helper d'upload vers Serveur LWS (PHP) & Firebase Storage
 * avec compression WebP client, fallback Base64 / Blob et progression temps-réel.
 */

export interface UploadedImageResult {
  url: string;
  name: string;
  size: number;
  type: string;
  storagePath?: string;
  source?: 'lws' | 'firebase' | 'base64';
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
  maxWidth: number = 1400,
  maxHeight: number = 2800,
  quality: number = 0.88
): Promise<{ dataUrl: string; blob: Blob }> => {
  return new Promise((resolve, reject) => {
    // Si c'est un SVG ou un fichier audio, pas de compression canvas
    if (file.type === 'image/svg+xml' || file.type.startsWith('audio/')) {
      resolve({ dataUrl: '', blob: file });
      return;
    }

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

        // Exporter en WebP
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
 * Upload d'un fichier vers le serveur LWS via /api/upload.php
 */
export const uploadToLwsServer = async (
  file: Blob | File,
  fileName: string,
  folder: string = 'general',
  onProgress?: (progress: number) => void
): Promise<UploadedImageResult | null> => {
  const endpoints = [
    '/api/upload.php',
    'https://ozibd.net/api/upload.php'
  ];

  for (const endpoint of endpoints) {
    try {
      const formData = new FormData();
      formData.append('file', file, fileName);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<{ success: boolean; url: string; size?: number }>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.success && res.url) {
                resolve(res);
              } else {
                reject(new Error(res.error || 'Erreur serveur PHP LWS'));
              }
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Timeout'));
        xhr.open('POST', endpoint, true);
        xhr.timeout = 30000; // 30s timeout
        xhr.send(formData);
      });

      const response = await uploadPromise;
      if (response && response.url) {
        return {
          url: response.url,
          name: fileName,
          size: file.size,
          type: file.type || 'image/webp',
          storagePath: `uploads/${folder}/${fileName}`,
          source: 'lws'
        };
      }
    } catch (err) {
      console.warn(`Tentative d'upload LWS sur ${endpoint} non aboutie (mode local ou hors ligne):`, err);
    }
  }

  return null;
};

/**
 * Upload d'une image : priorité au serveur LWS, fallback Firebase Storage & Base64
 * @param file Le fichier image
 * @param folder Le dossier cible (ex: 'covers', 'banners', 'chapters')
 * @param onProgress Callback de progression (0 à 100%)
 */
export const uploadImageToStorage = async (
  file: File,
  folder: string = 'covers',
  onProgress?: (progress: number) => void
): Promise<UploadedImageResult> => {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `${Date.now()}_${cleanName}`;
  const storagePath = `${folder}/${uniqueName}`;

  try {
    // 1. Optimisation préalable
    const { dataUrl, blob } = await compressImageFile(file, 1400, 2800, 0.88);
    const finalBlob = blob || file;

    // 2. PRIORITÉ : Tentative d'upload direct sur le serveur LWS (htdocs/uploads/...)
    const lwsResult = await uploadToLwsServer(finalBlob, cleanName, folder, onProgress);
    if (lwsResult) {
      console.log('✅ Image stockée sur le serveur LWS :', lwsResult.url);
      return lwsResult;
    }

    // 3. Fallback : Firebase Storage (si configuré)
    if (storage) {
      try {
        const storageRef = ref(storage, storagePath);
        const metadata = {
          contentType: finalBlob.type || 'image/webp',
          customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        };

        const uploadTask = uploadBytesResumable(storageRef, finalBlob, metadata);

        const downloadUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) onProgress(Math.round(progress));
            },
            (error) => {
              console.warn('Firebase Storage fallback warning:', error);
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
          size: finalBlob.size,
          type: finalBlob.type || 'image/webp',
          storagePath,
          source: 'firebase'
        };
      } catch (storageError) {
        console.warn('Utilisation du fallback Data URL optimisé:', storageError);
      }
    }

    // 4. Fallback ultime instantané : Data URL base64 compressée
    return {
      url: dataUrl || (await fileToDataUrl(file)),
      name: file.name,
      size: finalBlob.size,
      type: finalBlob.type || 'image/webp',
      source: 'base64'
    };
  } catch (err) {
    console.error('Upload image processing error:', err);
    const fallback = await fileToDataUrl(file);
    return {
      url: fallback,
      name: file.name,
      size: file.size,
      type: file.type,
      source: 'base64'
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
  const folder = workId && chapterNumber ? `chapters/${workId}/ch_${chapterNumber}` : 'chapters/general';

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
        source: 'base64'
      });
    }

    if (onProgress) {
      onProgress(i + 1, fileArray.length);
    }
  }

  return results;
};
