import { NextResponse } from "next/server";
import { AdminUploadError, storeAdminUploadedFiles } from "@/lib/admin-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractFiles(formData: FormData): File[] {
  const files: File[] = [];

  for (const entry of formData.getAll("files")) {
    if (typeof File !== "undefined" && entry instanceof File && entry.size > 0) {
      files.push(entry);
    }
  }

  return files;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const files = extractFiles(formData);

    if (files.length === 0) {
      return NextResponse.json(
        { detail: "Нужно выбрать хотя бы один файл для загрузки." },
        { status: 400 }
      );
    }

    const uploaded = await storeAdminUploadedFiles(files);
    return NextResponse.json({ files: uploaded }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminUploadError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { detail: "Не удалось загрузить файлы. Попробуйте еще раз." },
      { status: 500 }
    );
  }
}
