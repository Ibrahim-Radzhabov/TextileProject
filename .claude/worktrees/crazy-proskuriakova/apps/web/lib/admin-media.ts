import { randomUUID } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type UploadedAdminMedia = {
  id: string;
  url: string;
  alt: string;
  filename: string;
  size: number;
  contentType: string;
};

export class AdminUploadError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AdminUploadError";
    this.status = status;
  }
}

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif"
};
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif"
};

function resolveClientId(): string {
  const raw =
    process.env.CLIENT_ID?.trim() ??
    process.env.NEXT_PUBLIC_CLIENT_ID?.trim() ??
    "demo";
  return raw.length > 0 ? raw : "demo";
}

async function resolvePublicDir(): Promise<string> {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "apps", "web", "public"),
    path.join(cwd, "public")
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }

  throw new AdminUploadError("Не удалось определить директорию public для загрузки файлов.", 500);
}

async function resolveUploadsRootDir(): Promise<string> {
  const override = process.env.ADMIN_UPLOADS_DIR?.trim();
  if (override) {
    await mkdir(override, { recursive: true });
    return override;
  }

  const publicDir = await resolvePublicDir();
  const uploadsDir = path.join(publicDir, "uploads");
  await mkdir(uploadsDir, { recursive: true });
  return uploadsDir;
}

function slugifySegment(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function humanizeBaseName(value: string): string {
  const normalized = value
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "Product image";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function resolveFileExtension(file: File): string {
  const originalExtension = path.extname(file.name).toLowerCase();
  if (originalExtension in MIME_BY_EXTENSION) {
    return originalExtension;
  }

  const normalizedType = file.type.toLowerCase();
  const fallbackExtension = EXTENSION_BY_MIME[normalizedType];
  if (fallbackExtension) {
    return fallbackExtension;
  }

  throw new AdminUploadError(
    `Файл "${file.name}" имеет неподдерживаемый формат. Разрешены PNG, JPG, WEBP, AVIF и GIF.`
  );
}

function resolveContentType(file: File, extension: string): string {
  const normalizedType = file.type.toLowerCase();
  if (normalizedType in EXTENSION_BY_MIME) {
    return normalizedType;
  }
  return MIME_BY_EXTENSION[extension];
}

function assertValidImageFile(file: File): void {
  if (file.size <= 0) {
    throw new AdminUploadError(`Файл "${file.name}" пустой.`);
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new AdminUploadError(
      `Файл "${file.name}" слишком большой. Максимальный размер: 10 MB.`
    );
  }
}

export async function storeAdminUploadedFiles(files: File[]): Promise<UploadedAdminMedia[]> {
  if (files.length === 0) {
    throw new AdminUploadError("Нужно выбрать хотя бы один файл.");
  }

  const clientId = resolveClientId();
  const uploadsRootDir = await resolveUploadsRootDir();
  const clientUploadsDir = path.join(uploadsRootDir, clientId);
  await mkdir(clientUploadsDir, { recursive: true });

  const uploaded: UploadedAdminMedia[] = [];

  for (const file of files) {
    assertValidImageFile(file);

    const extension = resolveFileExtension(file);
    const contentType = resolveContentType(file, extension);
    const rawBaseName = path.basename(file.name, path.extname(file.name));
    const slugBaseName = slugifySegment(rawBaseName) || "image";
    const suffix = randomUUID().slice(0, 8);
    const mediaId = `${slugBaseName}-${suffix}`;
    const filename = `${Date.now()}-${mediaId}${extension}`;
    const destinationPath = path.join(clientUploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(destinationPath, buffer);

    uploaded.push({
      id: mediaId,
      url: path.posix.join("/uploads", clientId, filename),
      alt: humanizeBaseName(rawBaseName),
      filename,
      size: file.size,
      contentType
    });
  }

  return uploaded;
}
