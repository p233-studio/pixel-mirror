import { THUMBNAIL_HEIGHT } from "../constants";

type MockupData = Omit<Mockup, "id" | "createdAt">;

async function processFile(file: File): Promise<MockupData> {
  const originalBuffer = await file.arrayBuffer();

  const thumbnailBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const scale = THUMBNAIL_HEIGHT / img.height;
      const width = img.width * scale;
      const height = THUMBNAIL_HEIGHT;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        async (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(await blob.arrayBuffer());
          } else {
            reject(new Error("Failed to create thumbnail blob"));
          }
        },
        file.type,
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });

  return {
    originalBuffer,
    thumbnailBuffer,
    filename: file.name,
    mimeType: file.type
  };
}

export async function generateMockupBuffers(input: File | File[]): Promise<MockupData | MockupData[]> {
  if (Array.isArray(input)) {
    return Promise.all(input.map(processFile));
  }
  return processFile(input);
}
