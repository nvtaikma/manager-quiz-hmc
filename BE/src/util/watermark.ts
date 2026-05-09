import sharp from "sharp";

/**
 * 4 cạnh để đặt watermark — nằm NGOÀI ảnh gốc
 */
type WatermarkSide = "top" | "right" | "bottom" | "left";

const SIDES: WatermarkSide[] = ["top", "right", "bottom", "left"];

function getRandomSide(): WatermarkSide {
  return SIDES[Math.floor(Math.random() * SIDES.length)];
}

/**
 * Tạo SVG watermark nằm ngang (cho cạnh trên/dưới)
 */
function createHorizontalSvg(
  stripWidth: number,
  stripHeight: number,
  fontSize: number
): Buffer {
  const text = "testhmc.site";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${stripWidth}" height="${stripHeight}">
      <rect width="${stripWidth}" height="${stripHeight}" fill="#f0f0f0"/>
      <text
        x="${Math.round(stripWidth / 2)}" y="${Math.round(stripHeight / 2)}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="#888888"
        text-anchor="middle"
        dominant-baseline="central"
        letter-spacing="1"
      >${text}</text>
    </svg>
  `.trim();
  return Buffer.from(svg);
}

/**
 * Tạo SVG watermark xoay dọc (cho cạnh trái/phải)
 */
function createVerticalSvg(
  stripWidth: number,
  stripHeight: number,
  fontSize: number
): Buffer {
  const text = "testhmc.site";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${stripWidth}" height="${stripHeight}">
      <rect width="${stripWidth}" height="${stripHeight}" fill="#f0f0f0"/>
      <text
        x="${Math.round(stripWidth / 2)}" y="${Math.round(stripHeight / 2)}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="#888888"
        text-anchor="middle"
        dominant-baseline="central"
        letter-spacing="1"
        transform="rotate(-90, ${Math.round(stripWidth / 2)}, ${Math.round(stripHeight / 2)})"
      >${text}</text>
    </svg>
  `.trim();
  return Buffer.from(svg);
}

/**
 * Chèn watermark "testhmc.site" NGOÀI ảnh gốc.
 *
 * - Mở rộng canvas về 1 cạnh ngẫu nhiên (top/right/bottom/left)
 * - Cạnh trên/dưới: text nằm ngang
 * - Cạnh trái/phải: text xoay dọc
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
  const fontSize = Math.max(10, Math.min(24, Math.round(stripSize * 0.5)));

  let watermarkSvg: Buffer;
  let extendOptions: { top: number; bottom: number; left: number; right: number };
  let compositeLeft: number;
  let compositeTop: number;

  switch (side) {
    case "top":
      watermarkSvg = createHorizontalSvg(width, stripSize, fontSize);
      extendOptions = { top: stripSize, bottom: 0, left: 0, right: 0 };
      compositeLeft = 0;
      compositeTop = 0;
      break;
    case "bottom":
      watermarkSvg = createHorizontalSvg(width, stripSize, fontSize);
      extendOptions = { top: 0, bottom: stripSize, left: 0, right: 0 };
      compositeLeft = 0;
      compositeTop = height;
      break;
    case "left":
      watermarkSvg = createVerticalSvg(stripSize, height, fontSize);
      extendOptions = { top: 0, bottom: 0, left: stripSize, right: 0 };
      compositeLeft = 0;
      compositeTop = 0;
      break;
    case "right":
      watermarkSvg = createVerticalSvg(stripSize, height, fontSize);
      extendOptions = { top: 0, bottom: 0, left: 0, right: stripSize };
      compositeLeft = width;
      compositeTop = 0;
      break;
  }

  // 1. Mở rộng canvas với nền xám nhạt
  // 2. Composite SVG watermark vào vùng mở rộng
  const result = await sharp(imageBuffer)
    .extend({
      ...extendOptions,
      background: { r: 240, g: 240, b: 240, alpha: 1 },
    })
    .composite([
      {
        input: watermarkSvg,
        left: compositeLeft,
        top: compositeTop,
      },
    ])
    .toBuffer();

  return result;
}
