/**
 * ImageKit.io Direct API Integration for GNUTS
 * 
 * Uploads images, flyers, photos, and PDF/Word documents to ImageKit.io CDN.
 * Falls back to local storage seamlessly if ImageKit credentials are not configured.
 */

export interface ImageKitUploadResult {
  url: string;
  fileId?: string;
  name: string;
  size: number;
  filePath?: string;
}

export async function uploadToImageKit(
  buffer: Buffer,
  fileName: string,
  folder: string = '/gnuts_uploads'
): Promise<ImageKitUploadResult | null> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  // If ImageKit is not configured in .env, return null to use local storage fallback
  if (!privateKey || !urlEndpoint) {
    return null;
  }

  try {
    const base64File = buffer.toString('base64');
    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    const formData = new FormData();
    formData.append('file', base64File);
    formData.append('fileName', fileName);
    formData.append('folder', folder);
    formData.append('useUniqueFileName', 'true');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('ImageKit upload warning (falling back to local storage):', errorText);
      return null;
    }

    const data = await response.json();
    return {
      url: data.url,
      fileId: data.fileId,
      name: data.name,
      size: data.size,
      filePath: data.filePath,
    };
  } catch (err: any) {
    console.warn('ImageKit connection error (falling back to local storage):', err.message);
    return null;
  }
}
