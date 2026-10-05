// Input fingerprint stability and sensitivity.
import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalJson, computeInputFingerprint, mediaInputHash } from "../../src/lib/service-call/ai/fingerprint.ts";

const request = { problemDescription: "Door catches halfway.", productCategories: ["sliding-door", "hardware"], otherProduct: null, existingCustomer: true };
const media = [
  { id: "aaaaaaaa-0000-4000-8000-000000000001", type: "PHOTO", mimeType: "image/jpeg", fileSize: 95042 },
  { id: "aaaaaaaa-0000-4000-8000-000000000002", type: "VOICE", mimeType: "audio/mp4", fileSize: 43829 },
];
const fp = (r = request, m = media) => computeInputFingerprint(r, m);

test("is a 64-char hex SHA-256 and identical for identical input", () => {
  assert.match(fp(), /^[0-9a-f]{64}$/);
  assert.equal(fp(), fp({ ...request }, media.map((m) => ({ ...m }))));
});

test("is stable across media order, category order/duplicates, key order and id case", () => {
  const reordered = { existingCustomer: true, otherProduct: null, productCategories: ["hardware", "sliding-door", "hardware"], problemDescription: "Door catches halfway." };
  assert.equal(fp(), fp(reordered, [...media].reverse()));
  assert.equal(fp(), fp(request, media.map((m) => ({ ...m, id: m.id.toUpperCase() }))));
  assert.equal(fp(), fp({ ...request, problemDescription: "  Door catches halfway.\n" }));
});

test("ignores unstable or irrelevant values (timestamps, statuses, contact details)", () => {
  const noisy = { ...request, createdAt: new Date().toISOString(), email: "x@y.z", customerName: "A", status: "SUBMITTED" };
  const noisyMedia = media.map((m) => ({ ...m, updatedAt: Date.now(), uploadStatus: "UPLOADED", storagePath: "p" }));
  assert.equal(fp(), fp(noisy, noisyMedia));
});

test("changes when anything processing reads changes", () => {
  const base = fp();
  const variants = [
    fp({ ...request, problemDescription: "Door catches fully." }),
    fp({ ...request, productCategories: ["sliding-door"] }),
    fp({ ...request, otherProduct: "Insect screen" }),
    fp({ ...request, existingCustomer: false }),
    fp(request, media.slice(0, 1)), // media removed
    fp(request, [...media, { id: "aaaaaaaa-0000-4000-8000-000000000003", type: "PHOTO", mimeType: "image/png", fileSize: 10 }]), // added
    fp(request, [{ ...media[0], fileSize: 95043 }, media[1]]), // file changed
  ];
  for (const v of variants) assert.notEqual(v, base);
  assert.equal(new Set(variants).size, variants.length);
});

test("canonical JSON sorts keys at every depth", () => {
  assert.equal(canonicalJson({ b: 1, a: { d: [2, { y: 1, x: 2 }], c: null } }), '{"a":{"c":null,"d":[2,{"x":2,"y":1}]},"b":1}');
});

test("media input hash: same file/model/prompt → same; any change → different", () => {
  const step = { mediaId: media[1].id, fileSize: 43829, kind: "TRANSCRIPT", provider: "stub", model: "m1", promptVersion: "p1" };
  assert.equal(mediaInputHash(step), mediaInputHash({ ...step, mediaId: step.mediaId.toUpperCase() }));
  for (const change of [{ fileSize: 1 }, { model: "m2" }, { promptVersion: "p2" }, { provider: "openai" }, { kind: "IMAGE_OBSERVATIONS" }]) {
    assert.notEqual(mediaInputHash({ ...step, ...change }), mediaInputHash(step));
  }
});
