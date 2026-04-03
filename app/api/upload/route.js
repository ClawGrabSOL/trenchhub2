import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file)                        return NextResponse.json({ error: 'No file'                        }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Only JPEG/PNG/WEBP/GIF allowed' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_SIZE)  return NextResponse.json({ error: 'Max file size is 8 MB'          }, { status: 400 });

    const ext      = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `trenchhub/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, Buffer.from(bytes), {
      access:      'public',
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
