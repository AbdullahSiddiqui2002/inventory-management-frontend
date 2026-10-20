export const CLOUDINARY_CLOUD_NAME = 'diwj4lcwc';
export const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
}

/**
 * Upload an image file to Cloudinary
 * Tries server-side signed API route first, then direct unsigned client upload
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  // Method 1: Upload via Next.js server route (/api/upload) which handles signing and presets
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } else {
      const errorData = await res.json();
      console.warn('Server upload route returned:', errorData);
    }
  } catch (serverErr) {
    console.warn('Server route upload failed, attempting direct client upload:', serverErr);
  }

  // Method 2: Direct browser upload to Cloudinary unsigned endpoint
  try {
    const directFormData = new FormData();
    directFormData.append('file', file);
    directFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const directRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: directFormData,
      }
    );

    if (directRes.ok) {
      const directData: CloudinaryUploadResult = await directRes.json();
      return directData.secure_url;
    }
  } catch (directErr) {
    console.warn('Direct Cloudinary upload failed:', directErr);
  }

  // Method 3: Local data URI fallback so the form is never blocked
  return await readFileAsDataUrl(file);
}

/**
 * Helper to convert file to base64 Data URL
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
