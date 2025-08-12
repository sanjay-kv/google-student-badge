import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('image') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/Ambassador.png
    const filePath = path.join(process.cwd(), 'public', 'Ambassador.png');
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload file' });
  }
}