/**
 * compress-image.ts
 * Shared utility — nén ảnh phía client trước khi upload lên Supabase Storage.
 * 
 * Chiến lược:
 * - Output: WebP (nhỏ hơn JPEG ~35%, hỗ trợ tất cả trình duyệt hiện đại)
 * - Max dimension: 1600px (đủ chất lượng web)
 * - Quality: 0.82 (tiết kiệm tối đa, vẫn đẹp mắt)
 * - GIF / SVG / non-image: giữ nguyên, không nén
 * - Nếu WebP lớn hơn gốc: giữ nguyên file gốc
 */

export interface CompressOptions {
    maxDimension?: number;
    quality?: number;
    trim?: boolean;
}

/**
 * Trims transparent/white edges from an image
 */
function trimImage(ctx: CanvasRenderingContext2D, width: number, height: number): { x: number, y: number, w: number, h: number } | null {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let r, g, b, a;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            r = data[index];
            g = data[index + 1];
            b = data[index + 2];
            a = data[index + 3];

            // Consider a pixel "not empty" if it's not transparent AND not pure white (with some tolerance)
            // This is useful for logos on white backgrounds
            const isWhite = r > 250 && g > 250 && b > 250;
            const isEmpty = a < 10 || isWhite;

            if (!isEmpty) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }

    if (!found) return null;

    // Add 2px padding to avoid cutting pixels due to antialiasing
    return {
        x: Math.max(0, minX - 2),
        y: Math.max(0, minY - 2),
        w: Math.min(width, maxX - minX + 4),
        h: Math.min(height, maxY - minY + 4)
    };
}

export function compressImageToWebP(file: File, options: CompressOptions = {}): Promise<File> {
    const { maxDimension = 1600, quality = 0.82, trim = false } = options;
    
    return new Promise((resolve) => {
        // Không nén GIF (có animation), SVG (vector), và non-image
        if (
            !file.type.startsWith('image/') ||
            file.type === 'image/svg+xml' ||
            file.type === 'image/gif'
        ) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous"; // Handle CORS if any
            img.onload = () => {
                let { width, height } = img;

                // 1. Initial Processing Canvas
                const processingCanvas = document.createElement('canvas');
                processingCanvas.width = width;
                processingCanvas.height = height;
                const pCtx = processingCanvas.getContext('2d', { willReadFrequently: true });
                if (!pCtx) { resolve(file); return; }
                pCtx.drawImage(img, 0, 0);

                let sourceX = 0, sourceY = 0, sourceW = width, sourceH = height;

                // 2. Perform Auto-Trim if requested
                if (trim) {
                    const box = trimImage(pCtx, width, height);
                    if (box) {
                        sourceX = box.x;
                        sourceY = box.y;
                        sourceW = box.w;
                        sourceH = box.h;
                        width = box.w;
                        height = box.h;
                    }
                }

                // 3. Scale down if still too large
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                // 4. Final Canvas
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = width;
                finalCanvas.height = height;
                const fCtx = finalCanvas.getContext('2d');
                if (!fCtx) { resolve(file); return; }
                
                // Draw either cropped or original, scaled
                fCtx.drawImage(processingCanvas, sourceX, sourceY, sourceW, sourceH, 0, 0, width, height);

                finalCanvas.toBlob(
                    (blob) => {
                        if (!blob) { resolve(file); return; }
                        // Chỉ dùng bản nén nếu thực sự nhỏ hơn gốc (hoặc nếu đã trim)
                        if (blob.size >= file.size && !trim) { resolve(file); return; }
                        const newName = file.name.replace(/\.[^.]+$/, '.webp');
                        resolve(new File([blob], newName, { type: 'image/webp' }));
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = () => resolve(file); // Fallback nếu decode lỗi
            img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}


/**
 * Nén nhiều file cùng lúc (parallel)
 */
export async function compressImagesToWebP(files: File[], options: CompressOptions = {}): Promise<File[]> {
    return Promise.all(files.map(f => compressImageToWebP(f, options)));
}

/**
 * Tính % tiết kiệm được sau khi nén
 */
export function calcSavedPercent(originalFiles: File[], compressedFiles: File[]): number {
    const origSize = originalFiles.reduce((s, f) => s + f.size, 0);
    const compSize = compressedFiles.reduce((s, f) => s + f.size, 0);
    if (origSize === 0) return 0;
    return Math.round(((origSize - compSize) / origSize) * 100);
}
