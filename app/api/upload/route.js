import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, GIF allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 400 });
    }

    const ext      = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const dir      = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
