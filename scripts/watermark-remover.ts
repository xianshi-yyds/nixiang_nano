import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

import sharp from 'sharp';

import {
  inferMimeTypeFromPath,
  removeWatermarkFromBuffer,
} from './vendor/gemini-watermark-remover/src/sdk/node.js';

type ImageDataLike = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

type RemovalMeta = {
  applied?: boolean;
  decisionTier?: string | null;
  size?: number | null;
  position?: { x: number; y: number; width: number; height: number } | null;
};

export type WatermarkRemovalResult = {
  outputPath: string;
  applied: boolean;
  meta: RemovalMeta | null;
};

function toImageDataLike(buffer: Buffer, width: number, height: number): ImageDataLike {
  return {
    width,
    height,
    data: new Uint8ClampedArray(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)),
  };
}

async function decodeImageData(inputBuffer: Buffer): Promise<ImageDataLike> {
  const { data, info } = await sharp(inputBuffer, { animated: false })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return toImageDataLike(data, info.width, info.height);
}

async function encodeImageData(
  imageData: ImageDataLike,
  options: { mimeType?: string; filePath?: string },
): Promise<Buffer> {
  const mimeType = options.mimeType || inferMimeTypeFromPath(options.filePath || '');
  let pipeline = sharp(Buffer.from(imageData.data), {
    raw: {
      width: imageData.width,
      height: imageData.height,
      channels: 4,
    },
  });

  if (mimeType === 'image/jpeg') {
    pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: 100 });
  } else if (mimeType === 'image/webp') {
    pipeline = pipeline.webp({ quality: 100, lossless: true });
  } else {
    pipeline = pipeline.png();
  }

  return await pipeline.toBuffer();
}

export async function removeGeminiWatermarkFromFile(
  inputPath: string,
  outputPath?: string,
): Promise<WatermarkRemovalResult> {
  const sourcePath = path.resolve(inputPath);
  const destPath = path.resolve(outputPath ?? inputPath);
  const inputBuffer = await readFile(sourcePath);
  const mimeType = inferMimeTypeFromPath(sourcePath);

  const result = await removeWatermarkFromBuffer(inputBuffer, {
    mimeType,
    filePath: sourcePath,
    decodeImageData,
    encodeImageData,
  });

  const applied = Boolean(result.meta?.applied);
  if (applied || destPath !== sourcePath) {
    await writeFile(destPath, result.buffer);
  }

  return {
    outputPath: destPath,
    applied,
    meta: (result.meta as RemovalMeta | undefined) ?? null,
  };
}
