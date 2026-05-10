import sharp from "sharp";

/**
 * 4 cạnh để đặt watermark — nằm NGOÀI ảnh gốc
 */
type WatermarkSide = "top" | "right" | "bottom" | "left";

const SIDES: WatermarkSide[] = ["top", "right", "bottom", "left"];

function getRandomSide(): WatermarkSide {
  return SIDES[Math.floor(Math.random() * SIDES.length)];
}

/* ================================================================
 * BITMAP FONT – mỗi ký tự là ma trận 5×7 pixel (cột × hàng).
 * Chỉ cần các ký tự: t e s h m c . i
 * Đủ để vẽ "testhmc.site" mà KHÔNG phụ thuộc system font.
 * ================================================================ */
const CHAR_W = 5;
const CHAR_H = 7;

// Mỗi ký tự là mảng 7 hàng, mỗi hàng là chuỗi 5 ký tự ('#' = pixel, ' ' = trống)
const BITMAP_FONT: Record<string, string[]> = {
  // --- Ascender letters (extend to top) ---
  t: [
    " #   ",
    " #   ",
    "###  ",
    " #   ",
    " #   ",
    " #   ",
    "  ## ",
  ],
  h: [
    "#    ",
    "#    ",
    "# ## ",
    "##  #",
    "#   #",
    "#   #",
    "#   #",
  ],
  // --- x-height letters (top 2 rows empty) ---
  e: [
    "     ",
    "     ",
    " ### ",
    "#   #",
    "#####",
    "#    ",
    " ### ",
  ],
  s: [
    "     ",
    "     ",
    " ####",
    "#    ",
    " ### ",
    "    #",
    "#### ",
  ],
  m: [
    "     ",
    "     ",
    "## # ",
    "# # #",
    "# # #",
    "#   #",
    "#   #",
  ],
  c: [
    "     ",
    "     ",
    " ### ",
    "#   #",
    "#    ",
    "#   #",
    " ### ",
  ],
  // --- Special ---
  ".": [
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "  #  ",
  ],
  i: [
    "  #  ",
    "     ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
  ],
};

/**
 * Vẽ chuỗi text thành raw RGBA buffer bằng bitmap font.
 * @param text        – chuỗi cần vẽ (chỉ hỗ trợ ký tự trong BITMAP_FONT)
 * @param scale       – phóng to mỗi pixel lên scale×scale
 * @param fgColor     – màu chữ [R,G,B,A]
 * @returns { buffer, width, height }
 */
function renderTextToRawPixels(
  text: string,
  scale: number,
  fgColor: [number, number, number, number] = [136, 136, 136, 255]
): { buffer: Buffer; width: number; height: number } {
  const GAP = 1; // khoảng cách giữa các ký tự (tính theo đơn vị pixel gốc)
  const totalCharWidth = text.length * CHAR_W + (text.length - 1) * GAP;
  const imgW = totalCharWidth * scale;
  const imgH = CHAR_H * scale;
  const buf = Buffer.alloc(imgW * imgH * 4, 0); // RGBA, transparent

  for (let ci = 0; ci < text.length; ci++) {
    const ch = text[ci].toLowerCase();
    const glyph = BITMAP_FONT[ch];
    if (!glyph) continue;

    const offsetX = ci * (CHAR_W + GAP);

    for (let row = 0; row < CHAR_H; row++) {
      for (let col = 0; col < CHAR_W; col++) {
        if (glyph[row][col] === "#") {
          // Vẽ block scale×scale
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const px = (offsetX + col) * scale + sx;
              const py = row * scale + sy;
              const idx = (py * imgW + px) * 4;
              buf[idx] = fgColor[0];
              buf[idx + 1] = fgColor[1];
              buf[idx + 2] = fgColor[2];
              buf[idx + 3] = fgColor[3];
            }
          }
        }
      }
    }
  }

  return { buffer: buf, width: imgW, height: imgH };
}

/**
 * Tạo PNG watermark strip nằm ngang (cho cạnh trên/dưới)
 */
async function createHorizontalStrip(
  stripWidth: number,
  stripHeight: number,
  scale: number
): Promise<Buffer> {
  const { buffer: textBuf, width: textW, height: textH } = renderTextToRawPixels(
    "testhmc.site",
    scale
  );

  // Tạo text image từ raw pixels
  const textImage = await sharp(textBuf, {
    raw: { width: textW, height: textH, channels: 4 },
  })
    .png()
    .toBuffer();

  // Tạo strip nền xám nhạt, composite text vào giữa
  return sharp({
    create: {
      width: stripWidth,
      height: stripHeight,
      channels: 4,
      background: { r: 240, g: 240, b: 240, alpha: 1 },
    },
  })
    .composite([
      {
        input: textImage,
        left: Math.max(0, Math.round((stripWidth - textW) / 2)),
        top: Math.max(0, Math.round((stripHeight - textH) / 2)),
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Tạo PNG watermark strip xoay dọc (cho cạnh trái/phải)
 */
async function createVerticalStrip(
  stripWidth: number,
  stripHeight: number,
  scale: number
): Promise<Buffer> {
  // Tạo ngang trước, rồi xoay 90 độ
  const { buffer: textBuf, width: textW, height: textH } = renderTextToRawPixels(
    "testhmc.site",
    scale
  );

  const textImage = await sharp(textBuf, {
    raw: { width: textW, height: textH, channels: 4 },
  })
    .png()
    .toBuffer();

  // Tạo strip ngang tạm (dùng stripHeight làm width, stripWidth làm height)
  const horizontalStrip = await sharp({
    create: {
      width: stripHeight,
      height: stripWidth,
      channels: 4,
      background: { r: 240, g: 240, b: 240, alpha: 1 },
    },
  })
    .composite([
      {
        input: textImage,
        left: Math.max(0, Math.round((stripHeight - textW) / 2)),
        top: Math.max(0, Math.round((stripWidth - textH) / 2)),
      },
    ])
    .png()
    .toBuffer();

  // Xoay 90 độ ngược chiều kim đồng hồ
  return sharp(horizontalStrip).rotate(270).png().toBuffer();
}

/**
 * Chèn watermark "testhmc.site" NGOÀI ảnh gốc.
 *
 * - Mở rộng canvas về 1 cạnh ngẫu nhiên (top/right/bottom/left)
 * - Cạnh trên/dưới: text nằm ngang
 * - Cạnh trái/phải: text xoay dọc
 * - Dùng bitmap font tự vẽ → KHÔNG phụ thuộc system font
 *
 * @param imageBuffer - Buffer ảnh gốc
 * @returns Buffer ảnh đã mở rộng với watermark
 */
export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 600;

  // Bỏ qua ảnh quá nhỏ
  if (width < 100 || height < 100) {
    return imageBuffer;
  }

  const side = getRandomSide();

  // Kích thước strip watermark: ~5% chiều tương ứng, tối thiểu 24px, tối đa 60px
  const stripSize = Math.max(24, Math.min(60, Math.round(Math.max(width, height) * 0.05)));

  // Scale cho bitmap font: mỗi pixel gốc → scale×scale pixel thật
  // Điều chỉnh scale sao cho text cao ~ 70-80% strip
  const scale = Math.max(1, Math.round(stripSize * 0.7 / CHAR_H));

  let watermarkStrip: Buffer;
  let extendOptions: { top: number; bottom: number; left: number; right: number };
  let compositeLeft: number;
  let compositeTop: number;

  switch (side) {
    case "top":
      watermarkStrip = await createHorizontalStrip(width, stripSize, scale);
      extendOptions = { top: stripSize, bottom: 0, left: 0, right: 0 };
      compositeLeft = 0;
      compositeTop = 0;
      break;
    case "bottom":
      watermarkStrip = await createHorizontalStrip(width, stripSize, scale);
      extendOptions = { top: 0, bottom: stripSize, left: 0, right: 0 };
      compositeLeft = 0;
      compositeTop = height;
      break;
    case "left":
      watermarkStrip = await createVerticalStrip(stripSize, height, scale);
      extendOptions = { top: 0, bottom: 0, left: stripSize, right: 0 };
      compositeLeft = 0;
      compositeTop = 0;
      break;
    case "right":
      watermarkStrip = await createVerticalStrip(stripSize, height, scale);
      extendOptions = { top: 0, bottom: 0, left: 0, right: stripSize };
      compositeLeft = width;
      compositeTop = 0;
      break;
  }

  // 1. Mở rộng canvas với nền xám nhạt
  // 2. Composite watermark strip vào vùng mở rộng
  const result = await sharp(imageBuffer)
    .extend({
      ...extendOptions,
      background: { r: 240, g: 240, b: 240, alpha: 1 },
    })
    .composite([
      {
        input: watermarkStrip,
        left: compositeLeft,
        top: compositeTop,
      },
    ])
    .toBuffer();

  return result;
}
