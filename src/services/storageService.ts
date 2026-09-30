import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
}

const MEDIA_FILES_COLLECTION = 'media_files';
const MEDIA_CHUNKS_COLLECTION = 'media_chunks';
const CHUNK_SIZE = 650 * 1024; // ~650KB per Firestore chunk (well under 1MB limit)

// In-memory cache of resolved firestore-media:// or gs:// URLs -> permanent Data/HTTPS URLs
const resolvedMediaCache = new Map<string, string>();
const pendingResolutions = new Map<string, Promise<string>>();

/**
 * Compress an image file via HTML5 canvas so product/banner images load fast and stay crisp
 */
async function compressImageToDataUrl(file: File, maxDim = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const renderAtScale = (limitDim: number, q: number): string => {
          let { width, height } = img;
          if (width > limitDim || height > limitDim) {
            if (width > height) {
              height = Math.round((height * limitDim) / width);
              width = limitDim;
            } else {
              width = Math.round((width * limitDim) / height);
              height = limitDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return rawDataUrl;
          ctx.drawImage(img, 0, 0, width, height);
          const outMime = file.type === 'image/png' || file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
          return canvas.toDataURL(outMime, q);
        };

        let compressed = renderAtScale(maxDim, quality);
        if (compressed.length > 220 * 1024) {
          compressed = renderAtScale(900, 0.76);
        }
        resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Reads any File into a Data URL string
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Saves a Data URL into Firestore chunks and returns a `firestore-media://{mediaId}` reference string.
 */
async function saveDataUrlToFirestoreChunks(
  dataUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const totalLength = dataUrl.length;
  const chunkCount = Math.ceil(totalLength / CHUNK_SIZE);

  // Save metadata document
  await setDoc(doc(db, MEDIA_FILES_COLLECTION, mediaId), {
    id: mediaId,
    name: file.name.slice(0, 250),
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    chunkCount,
    createdAt: new Date().toISOString()
  });

  for (let i = 0; i < chunkCount; i++) {
    const chunkData = dataUrl.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    await setDoc(doc(db, MEDIA_CHUNKS_COLLECTION, `${mediaId}_${i}`), {
      mediaId,
      index: i,
      data: chunkData
    });
    if (onProgress) {
      const pct = Math.min(99, Math.round(((i + 1) / chunkCount) * 95) + 5);
      onProgress(pct);
    }
  }

  const refUri = `firestore-media://${mediaId}`;
  // For images, cache the permanent Data URL directly so it never expires in memory
  if (dataUrl.startsWith('data:image/')) {
    resolvedMediaCache.set(refUri, dataUrl);
  } else {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      resolvedMediaCache.set(refUri, objectUrl);
    } catch {
      resolvedMediaCache.set(refUri, dataUrl);
    }
  }

  if (onProgress) onProgress(100);
  return refUri;
}

/**
 * Resolves a media URL.
 * - If it is a `firestore-media://{mediaId}` URI, fetches chunks from Firestore and returns a permanent Data URL (for images) or Blob URL (for videos).
 * - If it is a `gs://` URI or relative Firebase Storage reference, resolves via `getDownloadURL`.
 * - If it is already an `https://` or `data:` URL, returns it directly.
 */
export async function resolveMediaUrl(url?: string): Promise<string> {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Standard HTTP(S) or Data URLs can be used directly
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  const cached = resolvedMediaCache.get(trimmed);
  if (cached) return cached;

  const pending = pendingResolutions.get(trimmed);
  if (pending) return pending;

  // Handle Firebase Storage gs:// or relative storage paths
  if (!trimmed.startsWith('firestore-media://')) {
    const storagePromise = (async () => {
      try {
        const storageRef = ref(storage, trimmed);
        const downloadUrl = await getDownloadURL(storageRef);
        resolvedMediaCache.set(trimmed, downloadUrl);
        return downloadUrl;
      } catch (err) {
        console.warn('Error resolving Firebase Storage path:', err);
        return trimmed;
      } finally {
        pendingResolutions.delete(trimmed);
      }
    })();
    pendingResolutions.set(trimmed, storagePromise);
    return storagePromise;
  }

  // Handle firestore-media://{mediaId}
  const promise = (async () => {
    try {
      const mediaId = trimmed.replace('firestore-media://', '').trim();
      const metaSnap = await getDoc(doc(db, MEDIA_FILES_COLLECTION, mediaId));
      if (!metaSnap.exists()) return '';

      const meta = metaSnap.data() as { chunkCount: number; mimeType: string };
      const chunkPromises: Promise<string>[] = [];
      for (let i = 0; i < meta.chunkCount; i++) {
        chunkPromises.push(
          getDoc(doc(db, MEDIA_CHUNKS_COLLECTION, `${mediaId}_${i}`)).then((snap) =>
            snap.exists() ? (snap.data().data as string) : ''
          )
        );
      }

      const chunks = await Promise.all(chunkPromises);
      const fullDataUrl = chunks.join('');
      if (!fullDataUrl) return '';

      // For images, return the self-contained Data URL directly so it never expires
      if (fullDataUrl.startsWith('data:image/') || (meta.mimeType && meta.mimeType.startsWith('image/'))) {
        resolvedMediaCache.set(trimmed, fullDataUrl);
        return fullDataUrl;
      }

      try {
        const response = await fetch(fullDataUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        resolvedMediaCache.set(trimmed, blobUrl);
        return blobUrl;
      } catch {
        resolvedMediaCache.set(trimmed, fullDataUrl);
        return fullDataUrl;
      }
    } catch (err) {
      console.warn('Error resolving Firestore media URL:', err);
      return '';
    } finally {
      pendingResolutions.delete(trimmed);
    }
  })();

  pendingResolutions.set(trimmed, promise);
  return promise;
}

/**
 * React hook to transparently resolve `firestore-media://`, `gs://`, or normal HTTPS/Data URLs
 */
export function useResolvedMediaUrl(url?: string): string {
  const [resolved, setResolved] = useState<string>(() => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('/')
    ) {
      return trimmed;
    }
    return resolvedMediaCache.get(trimmed) || '';
  });

  useEffect(() => {
    let active = true;
    if (!url) {
      setResolved('');
      return;
    }
    const trimmed = url.trim();
    if (!trimmed) {
      setResolved('');
      return;
    }
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('/')
    ) {
      setResolved(trimmed);
      return;
    }
    const cached = resolvedMediaCache.get(trimmed);
    if (cached) {
      setResolved(cached);
      return;
    }
    resolveMediaUrl(trimmed).then((res) => {
      if (active) setResolved(res);
    });
    return () => {
      active = false;
    };
  }, [url]);

  return resolved;
}

/**
 * Uploads a file (image or video) to Firebase Storage or persistent Firestore chunked storage.
 */
export async function uploadFileToStorage(
  file: File,
  folder = 'uploads',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${sanitizedName}`;
  const isVideo = file.type.startsWith('video/');

  // Persistent Firestore storage helper
  const fallbackStoreInFirestore = async (): Promise<UploadResult> => {
    if (onProgress) onProgress(10);
    if (!isVideo && file.type.startsWith('image/')) {
      const compressedDataUrl = await compressImageToDataUrl(file);
      const mediaUri = await saveDataUrlToFirestoreChunks(compressedDataUrl, file, onProgress);
      return {
        url: mediaUri,
        path: storagePath,
        name: file.name
      };
    }

    const rawDataUrl = await readFileAsDataUrl(file);
    const mediaUri = await saveDataUrlToFirestoreChunks(rawDataUrl, file, onProgress);
    return {
      url: mediaUri,
      path: storagePath,
      name: file.name
    };
  };

  try {
    if (!storage.app.options.storageBucket) {
      return await fallbackStoreInFirestore();
    }

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg')
    });

    return await new Promise<UploadResult>((resolve, reject) => {
      let settled = false;
      // If Firebase Storage doesn't transfer bytes within 2.5 seconds (e.g. unprovisioned bucket/CORS), persist in Firestore
      const stallTimer = setTimeout(() => {
        if (!settled && uploadTask.snapshot.bytesTransferred === 0) {
          settled = true;
          try {
            uploadTask.cancel();
          } catch {}
          fallbackStoreInFirestore().then(resolve).catch(reject);
        }
      }, 2500);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.bytesTransferred > 0) {
            clearTimeout(stallTimer);
          }
          if (snapshot.totalBytes > 0 && onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        () => {
          clearTimeout(stallTimer);
          if (!settled) {
            settled = true;
            fallbackStoreInFirestore().then(resolve).catch(reject);
          }
        },
        async () => {
          clearTimeout(stallTimer);
          if (settled) return;
          settled = true;
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({
              url: downloadUrl,
              path: storagePath,
              name: file.name
            });
          } catch {
            fallbackStoreInFirestore().then(resolve).catch(reject);
          }
        }
      );
    });
  } catch {
    return await fallbackStoreInFirestore();
  }
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  try {
    if (
      storagePath &&
      !storagePath.startsWith('http') &&
      !storagePath.startsWith('data:') &&
      !storagePath.startsWith('firestore-media://')
    ) {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    }
  } catch (err) {
    console.warn('Storage deletion notice:', err);
  }
}
