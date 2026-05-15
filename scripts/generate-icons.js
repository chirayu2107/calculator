#!/usr/bin/env node
/**
 * App icon + splash generator — pure Node, no native deps.
 *
 * Renders a calendar-card composition on an indigo gradient background, with
 * a colored-dot grid that echoes the in-app DayCell indicators. Designed to
 * survive Android's adaptive-icon mask AND iOS's auto-squircle.
 *
 * Replace by running:  node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.resolve(__dirname, '..', 'assets');

// ---------- PNG writer ----------
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
};
const makePng = (w, h, fill) => {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // 8 bits per channel
  ihdr[9] = 6;  // RGBA
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const rowStart = y * (1 + w * 4);
    raw[rowStart] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = fill(x, y);
      const off = rowStart + 1 + x * 4;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = a;
    }
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// ---------- Color helpers ----------
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const overAlpha = (top, bottom) => {
  // Porter–Duff "over" composite, both RGBA.
  const aT = top[3] / 255;
  const aB = bottom[3] / 255;
  const aOut = aT + aB * (1 - aT);
  if (aOut <= 0) return [0, 0, 0, 0];
  return [
    Math.round((top[0] * aT + bottom[0] * aB * (1 - aT)) / aOut),
    Math.round((top[1] * aT + bottom[1] * aB * (1 - aT)) / aOut),
    Math.round((top[2] * aT + bottom[2] * aB * (1 - aT)) / aOut),
    Math.round(aOut * 255),
  ];
};

// Smoothstep edge — 0 outside the shape, 1 inside, anti-aliased at the boundary.
const smoothEdge = (dist, halfPixel = 1.0) =>
  clamp(0.5 - dist / (2 * halfPixel), 0, 1);

// Distance from point to rounded-rect edge (negative inside, positive outside).
const sdRoundRect = (px, py, cx, cy, w, h, r) => {
  const dx = Math.abs(px - cx) - (w / 2 - r);
  const dy = Math.abs(py - cy) - (h / 2 - r);
  const outsideX = Math.max(dx, 0);
  const outsideY = Math.max(dy, 0);
  return Math.sqrt(outsideX * outsideX + outsideY * outsideY) + Math.min(Math.max(dx, dy), 0) - r;
};

const sdCircle = (px, py, cx, cy, r) => Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) - r;

// ---------- Composition ----------
const CATEGORY_COLORS = {
  lunch: [245, 158, 11],
  dinner: [16, 185, 129],
  cleaning: [59, 130, 246],
};

// Layout for a 1024px canvas; everything scales proportionally below.
const layout = (size) => {
  const s = size / 1024;
  return {
    size,
    cornerR: 215 * s,
    // Calendar card (centered, slightly higher than middle)
    card: {
      x: 512 * s,
      y: 540 * s,
      w: 660 * s,
      h: 620 * s,
      r: 72 * s,
    },
    // Header strip (rendered as a darker rounded-top rect at top of card)
    header: {
      h: 150 * s,
    },
    // Binding rings: pinned to the bottom edge of the header, half-overhanging
    ring: { r: 28 * s, leftX: 340 * s, rightX: 684 * s, y: (540 - 620 / 2 + 150) * s },
    // 5×3 grid of dots, centered in the white area below the header
    dots: {
      r: 26 * s,
      activeR: 30 * s,
      // x0 centers a 5-col grid (col centers at x0, x0+stepX, ...) in the card.
      // card center x = 512, stepX = 95 → grid width = 4×95 = 380 → x0 = 322
      x0: 322 * s,
      // card top = 540 - 310 = 230, header bottom = 380. Dots area = 380..850 (h=470)
      // 3 rows × stepY=100 = 200 → centered: y0 = 380 + (470-200)/2 = 515
      y0: 515 * s,
      stepX: 95 * s,
      stepY: 100 * s,
      cols: 5,
      rows: 3,
    },
  };
};

// 5×3 grid, designed to look like a real "week of data" sample without empty rows.
const ACTIVE_CELLS = [
  { col: 1, row: 0, color: CATEGORY_COLORS.lunch },
  { col: 2, row: 0, color: CATEGORY_COLORS.dinner },
  { col: 3, row: 0, color: CATEGORY_COLORS.cleaning },
  { col: 2, row: 1, color: CATEGORY_COLORS.lunch },
  { col: 3, row: 1, color: CATEGORY_COLORS.dinner },
  { col: 0, row: 2, color: CATEGORY_COLORS.cleaning },
  { col: 1, row: 2, color: CATEGORY_COLORS.lunch },
  { col: 4, row: 2, color: CATEGORY_COLORS.dinner },
];

const isActive = (c, r) => ACTIVE_CELLS.find((cell) => cell.col === c && cell.row === r);

// Returns RGBA for the icon at (x,y) — full composition.
const iconAt = (size, x, y, { rounded = true } = {}) => {
  const L = layout(size);

  // 1. Background: vivid indigo diagonal gradient + soft top-left glow.
  const tX = x / size;
  const tY = y / size;
  const tDiag = (tX + tY) / 2;
  const bgR = Math.round(lerp(99, 67, tDiag));
  const bgG = Math.round(lerp(102, 56, tDiag));
  const bgB = Math.round(lerp(241, 202, tDiag));
  // top-left specular bloom
  const distBloom = Math.sqrt((x - size * 0.15) ** 2 + (y - size * 0.1) ** 2);
  const bloomT = clamp(1 - distBloom / (size * 0.55), 0, 1) ** 2;
  const bgWithBloom = [
    Math.round(lerp(bgR, 165, bloomT * 0.35)),
    Math.round(lerp(bgG, 180, bloomT * 0.35)),
    Math.round(lerp(bgB, 255, bloomT * 0.35)),
    255,
  ];
  let color = bgWithBloom;

  // 2. Card body — white rounded-rect with subtle inner shadow at top.
  const distCard = sdRoundRect(x, y, L.card.x, L.card.y, L.card.w, L.card.h, L.card.r);
  const cardAlpha = smoothEdge(distCard, 1.5) * 255;
  if (cardAlpha > 0) {
    // Vertical gradient on the card from #FFFFFF (top) → #F1F5F9 (bottom)
    const cardT = (y - (L.card.y - L.card.h / 2)) / L.card.h;
    const cardR = Math.round(lerp(255, 241, clamp(cardT, 0, 1)));
    const cardG = Math.round(lerp(255, 245, clamp(cardT, 0, 1)));
    const cardB = Math.round(lerp(255, 249, clamp(cardT, 0, 1)));
    color = overAlpha([cardR, cardG, cardB, Math.round(cardAlpha)], color);

    // 3. Header strip (darker indigo, only inside the card, top portion)
    const headerTopY = L.card.y - L.card.h / 2;
    const headerBottomY = headerTopY + L.header.h;
    if (y >= headerTopY - 2 && y <= headerBottomY + 2) {
      // intersect with card mask using the same SDF; mask the rect to the card area
      const inHeader = y >= headerTopY && y <= headerBottomY;
      if (inHeader) {
        const hAlpha = smoothEdge(distCard, 1.5) * 255;
        color = overAlpha([67, 56, 202, Math.round(hAlpha)], color);
      } else {
        const aaY = Math.abs(y - headerBottomY);
        if (aaY < 1.5) {
          const hAlpha = smoothEdge(distCard, 1.5) * (1.5 - aaY) / 1.5 * 255;
          color = overAlpha([67, 56, 202, Math.round(hAlpha)], color);
        }
      }
    }

    // 4. Binding rings (two dark circles on top of the header)
    for (const cx of [L.ring.leftX, L.ring.rightX]) {
      const d = sdCircle(x, y, cx, L.ring.y, L.ring.r);
      const a = smoothEdge(d, 1.2);
      if (a > 0) {
        color = overAlpha([49, 46, 129, Math.round(a * 255)], color);
      }
    }

    // 5. Dots grid
    for (let r = 0; r < L.dots.rows; r++) {
      for (let c = 0; c < L.dots.cols; c++) {
        const cx = L.dots.x0 + c * L.dots.stepX;
        const cy = L.dots.y0 + r * L.dots.stepY;
        const active = isActive(c, r);
        const radius = active ? L.dots.activeR : L.dots.r;
        const dDot = sdCircle(x, y, cx, cy, radius);
        const aDot = smoothEdge(dDot, 1.2);
        if (aDot > 0) {
          if (active) {
            // Active dot with a soft halo for extra polish
            const halo = sdCircle(x, y, cx, cy, radius + 8);
            const aHalo = smoothEdge(halo, 6) - smoothEdge(dDot, 1.2);
            if (aHalo > 0) {
              color = overAlpha([active.color[0], active.color[1], active.color[2], Math.round(aHalo * 70)], color);
            }
            color = overAlpha([active.color[0], active.color[1], active.color[2], Math.round(aDot * 255)], color);
          } else {
            // Inactive dot: pale grey ring (filled lightly)
            color = overAlpha([203, 213, 225, Math.round(aDot * 200)], color);
          }
        }
      }
    }
  }

  // 6. Top-left specular sheen across the whole icon — adds the iOS glass feel.
  const sheenT = clamp(1 - Math.sqrt((x - size * 0.18) ** 2 + (y - size * 0.18) ** 2) / (size * 0.5), 0, 1);
  if (sheenT > 0) {
    color = overAlpha([255, 255, 255, Math.round(sheenT * 24)], color);
  }

  // 7. Round the outer corners (iOS will mask, but better to bake it).
  if (rounded) {
    const cornerDist = sdRoundRect(x, y, size / 2, size / 2, size, size, L.cornerR);
    const aOuter = smoothEdge(cornerDist, 1.5);
    if (aOuter < 1) {
      color = [color[0], color[1], color[2], Math.round(color[3] * aOuter)];
    }
  }

  return color;
};

// Splash: same composition but on a tall canvas, with a smaller centered card
// and large breathing room.
const splashAt = (w, h, x, y) => {
  // Stretch the background diagonal independent of aspect.
  const tDiag = (x / w + y / h) / 2;
  let color = [
    Math.round(lerp(99, 67, tDiag)),
    Math.round(lerp(102, 56, tDiag)),
    Math.round(lerp(241, 202, tDiag)),
    255,
  ];
  // Center the icon at 60% of width, positioned at vertical center.
  const iconSize = Math.min(w, h) * 0.5;
  const ix = x - (w / 2 - iconSize / 2);
  const iy = y - (h / 2 - iconSize / 2);
  if (ix >= 0 && iy >= 0 && ix < iconSize && iy < iconSize) {
    const ic = iconAt(iconSize, ix, iy, { rounded: true });
    color = overAlpha(ic, color);
  }
  return color;
};

// ---------- Run ----------
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

console.log('Generating icon.png (1024x1024)...');
fs.writeFileSync(
  path.join(OUT, 'icon.png'),
  makePng(1024, 1024, (x, y) => iconAt(1024, x, y, { rounded: true }))
);

console.log('Generating adaptive-icon.png (1024x1024, full bleed)...');
// Adaptive icons are masked by Android. Render the same composition but
// without baked corners; Android will clip to a circle/squircle as needed.
fs.writeFileSync(
  path.join(OUT, 'adaptive-icon.png'),
  makePng(1024, 1024, (x, y) => iconAt(1024, x, y, { rounded: false }))
);

console.log('Generating splash.png (1242x2436)...');
fs.writeFileSync(
  path.join(OUT, 'splash.png'),
  makePng(1242, 2436, (x, y) => splashAt(1242, 2436, x, y))
);

console.log('Generating favicon.png (64x64)...');
fs.writeFileSync(
  path.join(OUT, 'favicon.png'),
  makePng(64, 64, (x, y) => iconAt(64, x, y, { rounded: true }))
);

console.log('Done. Files in', OUT);
