// Phase 4D image normalisation with real sharp: metadata stripping,
// orientation, bounds, colour/alpha, unsupported/corrupt/bomb/blank handling.
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { isHeif, MAX_EDGE_PX, NORMALISER_VERSION, normaliseImage } from "../../src/lib/service-call/server/image-normaliser.ts";
import { claimedHugePng, corruptJpeg, heicLike, photoJpeg, solidPng, transparentPng } from "../support/images.mjs";

const ok = async (bytes, mime = "image/jpeg") => {
  const r = await normaliseImage(bytes, mime);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
};

test("EXIF and GPS are removed: no metadata block, no secret strings, no ICC profile", async () => {
  const original = await photoJpeg({ withExif: true });
  const om = await sharp(original).metadata();
  assert.ok(om.exif, "fixture really carries EXIF");
  assert.ok(Buffer.from(original).includes(Buffer.from("PHASE4D-PRIVATE-MODEL")));
  const r = await ok(original);
  const m = await sharp(r.image.bytes).metadata();
  assert.equal(m.exif, undefined);
  assert.equal(m.icc, undefined);
  assert.equal(m.xmp, undefined);
  assert.equal(m.iptc, undefined);
  const buf = Buffer.from(r.image.bytes);
  for (const s of ["Exif\0\0", "PHASE4D-PRIVATE-MODEL", "PHASE 4D SECRET OWNER", "TestCam", "GPS"]) assert.ok(!buf.includes(Buffer.from(s)), `derivative contains ${JSON.stringify(s)}`);
});

test("EXIF orientation is applied (sent upright) and then dropped", async () => {
  const sideways = await photoJpeg({ width: 800, height: 600, orientation: 6 });
  assert.equal((await sharp(sideways).metadata()).orientation, 6);
  const r = await ok(sideways);
  assert.deepEqual([r.image.width, r.image.height], [600, 800], "rotated to upright");
  assert.equal((await sharp(r.image.bytes).metadata()).orientation, undefined);
});

test("dimensions are bounded to 1536 px on the long edge; small images are not enlarged", async () => {
  const big = await ok(await photoJpeg({ width: 4000, height: 3000 }));
  assert.deepEqual([big.image.width, big.image.height], [MAX_EDGE_PX, 1152]);
  const small = await ok(await photoJpeg({ width: 320, height: 240 }));
  assert.deepEqual([small.image.width, small.image.height], [320, 240]);
});

test("output is a fresh sRGB JPEG; PNG/WebP accepted; transparency flattened on white", async () => {
  const png = await ok(await transparentPng(), "image/png");
  const m = await sharp(png.image.bytes).metadata();
  assert.equal(m.format, "jpeg");
  assert.equal(m.hasAlpha, false);
  assert.equal(m.space, "srgb");
  const webp = await ok(new Uint8Array(await sharp(await photoJpeg()).webp().toBuffer()), "image/webp");
  assert.equal(webp.image.mimeType, "image/jpeg");
  assert.match(png.derivative.sha256, /^[0-9a-f]{64}$/);
  assert.equal(png.derivative.normaliser, NORMALISER_VERSION);
  assert.equal(png.derivative.bytes, png.image.bytes.byteLength);
});

test("HEIC/HEIF is SKIPPED (by type or by content), never converted", async () => {
  assert.deepEqual(await normaliseImage(heicLike(), "image/heic"), { ok: false, outcome: "SKIPPED", code: "image_format_not_supported" });
  assert.deepEqual(await normaliseImage(heicLike(), "image/heif"), { ok: false, outcome: "SKIPPED", code: "image_format_not_supported" });
  assert.deepEqual(await normaliseImage(heicLike(), "image/jpeg"), { ok: false, outcome: "SKIPPED", code: "image_format_not_supported" }, "HEIC content labelled JPEG");
  assert.equal(isHeif(heicLike()), true);
  assert.equal(isHeif(await photoJpeg()), false);
});

test("corrupt image fails safely", async () => {
  assert.deepEqual(await normaliseImage(corruptJpeg(), "image/jpeg"), { ok: false, outcome: "FAILED", code: "image_unreadable" });
  assert.deepEqual(await normaliseImage(new Uint8Array(0), "image/jpeg"), { ok: false, outcome: "FAILED", code: "image_unreadable" });
});

test("decompression-risk image (header claims 400 MP) is rejected before decoding", async () => {
  const t0 = Date.now();
  assert.deepEqual(await normaliseImage(claimedHugePng(20000, 20000), "image/png"), { ok: false, outcome: "FAILED", code: "image_too_large_to_process" });
  assert.ok(Date.now() - t0 < 2000, "no attempt to decode 400 MP");
});

test("blank and near-blank images are SKIPPED (no model call needed)", async () => {
  assert.deepEqual(await normaliseImage(await solidPng({ color: "#ffffff" }), "image/png"), { ok: false, outcome: "SKIPPED", code: "image_blank" });
  assert.deepEqual(await normaliseImage(await solidPng({ color: "#202020" }), "image/png"), { ok: false, outcome: "SKIPPED", code: "image_blank" });
  const r = await normaliseImage(await photoJpeg({ width: 200, height: 200 }), "image/jpeg");
  assert.equal(r.ok, true, "textured image is not blank");
});
