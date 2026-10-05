// Mock of the two OpenAI endpoints used in 4C: transcription and Responses.
// The mock "model" builds report content from the input it was actually
// sent, so quotes are real excerpts — like a well-behaved model would.

export const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const USAGE = { input_tokens: 4200, input_tokens_details: { cached_tokens: 1024 }, output_tokens: 2600, output_tokens_details: { reasoning_tokens: 1300 }, total_tokens: 6800 };

/** A completed Responses API result whose message text is `content` (object → JSON, string as-is). */
export const responseOf = (content, extra = {}) =>
  json({
    id: "resp_test", object: "response", status: "completed",
    output: [{ type: "reasoning", id: "rs_1", summary: [] }, { type: "message", role: "assistant", content: [{ type: "output_text", text: typeof content === "string" ? content : JSON.stringify(content) }] }],
    usage: USAGE, ...extra,
  });

/** Extracts the ServiceAiInput JSON (first block) and any corrective lines from a Responses request body. */
export function readRequest(body) {
  const text = body.input[0].content[0].text;
  const [data, ...rest] = text.split("\n\nYOUR PREVIOUS OUTPUT");
  return { input: JSON.parse(data), correction: rest.length ? `YOUR PREVIOUS OUTPUT${rest.join("")}` : null, text };
}

/** Valid report content (scr-1.1+) built from the input the model received. */
export function goodReport(input, opts = {}) {
  const statements = [];
  if (input.request.description.trim()) {
    statements.push({ id: "st-1", text: "The customer describes the problem in writing.", quote: Array.from(input.request.description.trim()).slice(0, 60).join(""), source: { type: "DESCRIPTION", mediaId: null } });
  }
  for (const t of input.transcripts.filter((x) => x.text.trim())) {
    statements.push({ id: `st-${statements.length + 1}`, text: t.kind === "VOICE_NOTE" ? "The customer describes the problem in a voice note." : "The customer describes the problem while recording a video.", quote: Array.from(t.text.trim()).slice(0, 60).join(""), source: { type: t.kind === "VOICE_NOTE" ? "VOICE_NOTE" : "VIDEO_AUDIO", mediaId: t.mediaId } });
  }
  const first = statements[0]?.id ?? "st-1";
  return {
    issueSummary: "The customer reports a problem with an installed product.",
    customerReported: { statements, reportedSymptoms: [{ id: "sy-1", symptom: "Problem reported by the customer", statementRefs: [first] }], reportedOnset: null, locationInProperty: null },
    mediaObservations: [],
    unknownsRequiringInspection: [
      ...(opts.noExtraUnknown ? [] : [{ topic: "COMPONENT_FAILURE", question: "Which component is affected.", whyUnknown: "Not established from what the customer said." }]),
      ...(opts.unknowns ?? []),
    ],
    affectedProducts: input.request.productCategories.map((category) => ({ category, basis: "CUSTOMER_SELECTED" })),
    potentialIssueCategories: [{ category: "OPERATION_STIFF_OR_STUCK", likelihood: "POSSIBLE", basedOnRefs: [first] }],
    urgency: opts.urgency ?? { level: "NORMAL", indicators: [], reason: "No safety indicator was reported." },
    inspection: { recommended: true, reason: "The cause needs to be established by the service team." },
    recommendedNextStep: "STAFF_CALLBACK",
    moreInformationNeeded: [],
    confidence: { overall: "MEDIUM", reason: "Based on what the customer said only." },
    limitations: ["No photos or video were analysed."],
  };
}

/**
 * fetch mock: routes transcription vs Responses calls.
 *   transcribe(n)          → Response for the n-th transcription call
 *   model({input, correction, body, n}) → content object | Response
 */
/** Default photo observation (po-1): one hedged, conservative observation. */
export const goodPhotoObservation = () => ({
  photo: { quality: "CLEAR", qualityIssues: [], relevance: "RELEVANT", visibleProductTypes: ["window"], visibleTextPresent: false, personalInfoVisible: false },
  observations: [{ type: "GLASS_CRACK_OR_CHIP", observation: "A thin linear mark resembling a crack appears visible across the glazed area.", certainty: "PROBABLE", location: "upper half of the glazed panel" }],
  cannotDetermine: ["Whether the mark goes through the glass."],
});

export function openAiMock({
  transcribe = () => json({ text: "The sliding door is stuck halfway.", languages: [{ code: "en" }], usage: { type: "duration", seconds: 3 } }),
  model = ({ input }) => goodReport(input),
  observe = () => goodPhotoObservation(),
} = {}) {
  const calls = { transcribe: [], responses: [], observe: [] };
  const fetch = async (url, init) => {
    if (url.endsWith("/v1/audio/transcriptions")) {
      calls.transcribe.push({ url, form: init.body });
      return transcribe(calls.transcribe.length);
    }
    if (url.endsWith("/v1/responses") && JSON.parse(init.body).text?.format?.name === "photo_observation_po_1") {
      const body = JSON.parse(init.body);
      const parts = body.input[0].content;
      const text = parts.find((p) => p.type === "input_text").text;
      const images = parts.filter((p) => p.type === "input_image");
      const image = Buffer.from(images[0].image_url.split(",")[1], "base64");
      const meta = JSON.parse(text.split("\n\nYOUR PREVIOUS OUTPUT")[0]);
      const call = { url, body, text, images, image, label: meta.photo ?? meta.frame, frame: "frame" in meta, correction: text.includes("YOUR PREVIOUS OUTPUT") ? text : null, n: calls.observe.length + 1 };
      calls.observe.push(call);
      const out = await observe(call);
      return out instanceof Response ? out : responseOf(out);
    }
    if (url.endsWith("/v1/responses")) {
      const body = JSON.parse(init.body);
      const req = readRequest(body);
      calls.responses.push({ url, body, headers: init.headers, ...req });
      const out = await model({ ...req, body, n: calls.responses.length });
      return out instanceof Response ? out : responseOf(out);
    }
    throw new Error(`unexpected url ${url}`);
  };
  return { fetch, calls };
}
