/**
 * ファイルをBase64文字列に変換
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Base64文字列からデータ部分のみを抽出
 * (data:image/jpeg;base64, のプレフィックスを削除)
 */
export function extractBase64Data(base64String: string): string {
  const parts = base64String.split(",");
  return parts.length > 1 ? parts[1] : base64String;
}

/**
 * 画像ファイルをBase64に変換して、データ部分のみを返す
 */
export async function convertImageToBase64(file: File): Promise<string> {
  const base64 = await fileToBase64(file);
  return extractBase64Data(base64);
}

/**
 * 画像のリサイズとBase64変換
 * Lambdaのペイロード制限(6MB)を考慮して画像を圧縮
 */
export async function resizeAndConvertImage(
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // アスペクト比を維持してリサイズ
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context is not available"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Base64に変換
        const base64 = canvas.toDataURL("image/jpeg", quality);
        resolve(extractBase64Data(base64));
      };

      img.onerror = () => {
        reject(new Error("画像の読み込みに失敗しました"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("ファイルの読み込みに失敗しました"));
    };

    reader.readAsDataURL(file);
  });
}
