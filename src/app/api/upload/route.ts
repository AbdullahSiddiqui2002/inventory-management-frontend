import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'diwj4lcwc';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'aXsM2GsiAJejYMLYWErRFGjR-QI';
const API_KEY = process.env.CLOUDINARY_API_KEY || 'aXsM2GsiAJejYMLYWErRFGjR-QI';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const preset = (formData.get('upload_preset') as string) || 'ml_default';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

    // Attempt 1: Unsigned Upload with preset
    const unsignedFormData = new FormData();
    unsignedFormData.append('file', base64Data);
    unsignedFormData.append('upload_preset', preset);

    let cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: unsignedFormData,
    });

    if (cloudRes.ok) {
      const data = await cloudRes.json();
      return NextResponse.json({ secure_url: data.secure_url, public_id: data.public_id });
    }

    // Attempt 2: Signed Upload using API Secret / Key
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const signedFormData = new FormData();
    signedFormData.append('file', base64Data);
    signedFormData.append('timestamp', timestamp.toString());
    signedFormData.append('api_key', API_KEY);
    signedFormData.append('signature', signature);

    const signedRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: signedFormData,
    });

    if (signedRes.ok) {
      const data = await signedRes.json();
      return NextResponse.json({ secure_url: data.secure_url, public_id: data.public_id });
    }

    // If both fail, parse and return Cloudinary error details
    const errorText = await signedRes.text();
    console.error('Cloudinary upload error:', errorText);

    return NextResponse.json(
      {
        error: 'Cloudinary upload rejected',
        details: errorText,
        help: 'Please ensure an Unsigned Upload Preset (e.g., "ml_default") is enabled in your Cloudinary Dashboard under Settings > Upload > Upload presets.',
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Server upload route error:', err);
    return NextResponse.json({ error: err?.message || 'Server upload failed' }, { status: 500 });
  }
}
