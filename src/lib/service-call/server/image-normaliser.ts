// Photo normalisation for AI analysis (server-only, Phase 4D).
//
// Builds a privacy-minimised, in-memory derivative from the customer's
// original upload. The derivative is what a vision model sees; it is never
// stored (it can be rebuilt exactly from the original, which stays the
// authoritative evidence in the private bucket).
//
//   decode (JPEG/PNG/WebP only; HEIC/HEIF → SKIPPED, no conversion in 4D)
//   → apply EXIF orientation → sRGB → fit within 1536 px → flatten on white
//   → re-encode as a fresh JPEG with NO metadata (EXIF, GPS, XMP, IPTC, ICC dropped)
//
// Corrupt or decompression-risk images fail without a model call; blank or
// near-blank images are skipped without a model call.
import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import type { ImageNormaliser, NormalisedImageResult } from "../ai/provider";

export const NORMALISER_VERSION = "img-1";
/** Long-edge bound: ≤ 48×48 = 2,304 patches of 32 px, under the provider's "high" detail budget. */
export const MAX_EDGE_PX = 1536;
/** Decompression-bomb guard: nothing larger than this is decoded. */
export const MAX_INPUT_PIXELS = 100_000_000;
/** Highest per-channel standard deviation still treated as blank/near-blank. */
export const BLANK_STDEV_THRESHOLD = 4;
const JPEG_QUALITY = 82;

const SUPPORTED_FORMATS = new Set(["jpeg", "png", "webp"]);
const HEIF_BRANDS = ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"];

/** True when the bytes are an HEIF/HEIC container, whatever the declared type says. */
export function isHeif(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const box = String.fromCharCode(...bytes.slice(4, 8));
  const brand = String.fromCharCode(...bytes.slice(8, 12));
  return box === "ftyp" && HEIF_BRANDS.includes(brand);
}

const sha256 = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");

export const normaliseImage: ImageNormaliser = async (bytes, mimeType): Promise<NormalisedImageResult> => {
  // HEIC/HEIF is recognised explicitly (by type or by content) and never converted in 4D.
  if (/^image\/hei[cf]$/i.test(mimeType) || isHeif(bytes)) return { ok: false, outcome: "SKIPPED", code: "image_format_not_supported" };
  if (bytes.byteLength === 0) return { ok: false, outcome: "FAILED", code: "image_unreadable" };

  let meta: sharp.Metadata;
  try {
    meta = await sharp(bytes, { failOn: "error", limitInputPixels: false }).metadata();
  } catch {
    return { ok: false, outcome: "FAILED", code: "image_unreadable" };
  }
  if (!meta.format || !SUPPORTED_FORMATS.has(meta.format)) return { ok: false, outcome: "SKIPPED", code: "image_format_not_supported" };
  if (!meta.width || !meta.height) return { ok: false, outcome: "FAILED", code: "image_unreadable" };
  // Checked from the header before decoding any pixels.
  if (meta.width * meta.height > MAX_INPUT_PIXELS) return { ok: false, outcome: "FAILED", code: "image_too_large_to_process" };

  try {
    const { data, info } = await sharp(bytes, { failOn: "error", limitInputPixels: MAX_INPUT_PIXELS, pages: 1 })
      .rotate() // honour EXIF orientation, then the tag is gone with the rest of the metadata
      .resize({ width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .toColourspace("srgb")
      .jpeg({ quality: JPEG_QUALITY, chromaSubsampling: "4:2:0" })
      .toBuffer({ resolveWithObject: true });

    const stats = await sharp(data).stats();
    const maxStdev = Math.max(...stats.channels.slice(0, 3).map((c) => c.stdev));
    if (maxStdev < BLANK_STDEV_THRESHOLD) return { ok: false, outcome: "SKIPPED", code: "image_blank" };

    const out = new Uint8Array(data);
    return {
      ok: true,
      image: { bytes: out, mimeType: "image/jpeg", width: info.width, height: info.height },
      derivative: { width: info.width, height: info.height, bytes: out.byteLength, sha256: sha256(out), normaliser: NORMALISER_VERSION },
    };
  } catch {
    return { ok: false, outcome: "FAILED", code: "image_unreadable" };
  }
};
