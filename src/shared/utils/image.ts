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
        try {
          const originalWidth = img.width;
          const originalHeight = img.height;
          console.log(`元のサイズ: ${originalWidth}x${originalHeight}`);

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

          console.log(`リサイズ後: ${width}x${height}`);
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context is not available"));
            return;
          }

          // 背景を白で塗りつぶす（透過PNGの場合の対策）
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          // Base64に変換
          try {
            const base64 = canvas.toDataURL("image/jpeg", quality);
            const base64Data = extractBase64Data(base64);
            console.log(
              `Base64サイズ: ${(base64Data.length / 1024).toFixed(2)}KB`
            );
            resolve(base64Data);
          } catch (canvasError) {
            reject(
              new Error(
                `Canvas変換エラー: ${
                  canvasError instanceof Error
                    ? canvasError.message
                    : "不明なエラー"
                }`
              )
            );
          }
        } catch (processError) {
          reject(
            new Error(
              `画像処理エラー: ${
                processError instanceof Error
                  ? processError.message
                  : "不明なエラー"
              }`
            )
          );
        }
      };

      img.onerror = (error) => {
        console.error("画像読み込みエラー:", error);
        reject(
          new Error(
            "画像の読み込みに失敗しました。ファイル形式を確認してください。"
          )
        );
      };

      if (!e.target?.result) {
        reject(new Error("FileReaderの結果が空です"));
        return;
      }

      img.src = e.target.result as string;
    };

    reader.onerror = (error) => {
      console.error("FileReaderエラー:", error);
      reject(
        new Error(
          "ファイルの読み込みに失敗しました。ファイルが破損している可能性があります。"
        )
      );
    };

    reader.readAsDataURL(file);
  });
}
