// Synthetic test images built in memory with sharp (no customer photos).
import sharp from "sharp";
import { deflateSync } from "node:zlib";

/** A photo-like JPEG: gradient + noise so it is not "blank". */
export async function photoJpeg({ width = 800, height = 600, seed = 1, withExif = false, orientation } = {}) {
  const channels = 3;
  const raw = Buffer.alloc(width * height * channels);
  let s = seed * 9301 + 49297;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      s = (s * 9301 + 49297) % 233280;
      const n = (s / 233280) * 40;
      const i = (y * width + x) * channels;
      raw[i] = Math.min(255, (x / width) * 200 + n);
      raw[i + 1] = Math.min(255, (y / height) * 200 + n);
      raw[i + 2] = Math.min(255, 120 + n);
    }
  }
  let img = sharp(raw, { raw: { width, height, channels } });
  if (withExif) {
    img = img.withExif({
      IFD0: { Make: "TestCam", Model: "PHASE4D-PRIVATE-MODEL", Copyright: "PHASE 4D SECRET OWNER" },
      IFD3: { GPSLatitudeRef: "N", GPSLatitude: "25/1 12/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "55/1 16/1 0/1" },
    });
  }
  if (orientation) img = img.withMetadata({ orientation });
  return new Uint8Array(await img.jpeg({ quality: 90 }).toBuffer());
}

export async function solidPng({ width = 400, height = 300, color = "#ffffff", alpha = 1 } = {}) {
  return new Uint8Array(await sharp({ create: { width, height, channels: 4, background: { ...hex(color), alpha } } }).png().toBuffer());
}

/** Transparent PNG with a coloured square (alpha must be flattened onto white). */
export async function transparentPng() {
  const square = await sharp({ create: { width: 100, height: 100, channels: 4, background: { r: 200, g: 30, b: 30, alpha: 1 } } }).png().toBuffer();
  const noise = await photoJpeg({ width: 300, height: 200, seed: 7 });
  const base = await sharp(noise).ensureAlpha(0.2).png().toBuffer();
  return new Uint8Array(await sharp(base).composite([{ input: square, left: 50, top: 50 }]).png().toBuffer());
}

/** A PNG whose header claims width×height (decompression-bomb shape) but carries a tiny body. */
export function claimedHugePng(width = 20000, height = 20000) {
  const crc32 = (buf) => {
    let c, crc = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c = (crc ^ buf[n]) & 0xff;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crc = (crc >>> 8) ^ c;
    }
    return (crc ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return new Uint8Array(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.alloc(16))), chunk("IEND", Buffer.alloc(0))]));
}

/** HEIC-shaped bytes (ftyp heic): enough for type detection, never decoded. */
export function heicLike() {
  return new Uint8Array([0, 0, 0, 0x18, ...Buffer.from("ftypheic"), 0, 0, 0, 0, ...Buffer.from("mif1heic"), ...new Array(64).fill(1)]);
}

/** JPEG magic followed by garbage. */
export function corruptJpeg() {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...Array.from({ length: 2000 }, (_, i) => (i * 37) % 256)]);
}

function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
