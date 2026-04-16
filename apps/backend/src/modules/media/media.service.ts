import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ValidationError } from '../../common/errors.js';
import { logger } from '../../config/logger.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function uploadImage(
  file: { filename: string; mimetype: string; file: NodeJS.ReadableStream },
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new ValidationError('Invalid file type. Allowed: JPEG, PNG, WebP');
  }

  const chunks: Buffer[] = [];
  for await (const chunk of file.file) {
    chunks.push(chunk as Buffer);
  }
  const buffer = Buffer.concat(chunks);

  if (buffer.length > MAX_SIZE) {
    throw new ValidationError('File too large. Maximum size: 5MB');
  }

  const ext = file.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : file.mimetype.split('/')[1];
  const filename = `${randomUUID()}.${ext}`;
  const dir = join(UPLOAD_DIR, 'products');

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);

  logger.info({ filename, size: buffer.length }, 'Image uploaded');

  return `/uploads/products/${filename}`;
}
