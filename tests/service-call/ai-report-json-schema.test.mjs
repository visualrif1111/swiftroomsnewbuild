// The strict JSON Schema sent to the provider must match the server
// validator exactly (scr-1.1). Includes a small checker for the strict-mode
// subset so fixtures are proven to conform to the schema we send.
import { test } from "node:test";
import assert from "node:assert/strict";
import { REPORT_JSON_SCHEMA, REPORT_JSON_SCHEMA_NAME } from "../../src/lib/service-call/ai/report-json-schema.ts";
import { UNKNOWN_TOPICS, REPORT_SCHEMA_VERSION } from "../../src/lib/service-call/ai/report-schema.ts";
import { textOnlyContent, validContent } from "../support/ai-fixtures.mjs";

/** Validates a value against the strict-mode subset we use (type, properties, required, additionalProperties, enum, maxLength, maxItems, items). */
function conforms(schema, value, path = "$") {
  const errors = [];
  const types = [].concat(schema.type);
  const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "number" ? "number" : typeof v);
  if (!types.includes(typeOf(value))) return [`${path}: type ${typeOf(value)} not in ${types}`];
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: not in enum`);
  if (typeof value === "string" && schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${path}: too long`);
  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: too many items`);
    value.forEach((v, i) => errors.push(...conforms(schema.items, v, `${path}[${i}]`)));
  }
  if (typeOf(value) === "object") {
    for (const k of schema.required ?? []) if (!(k in value)) errors.push(`${path}.${k}: missing`);
    for (const k of Object.keys(value)) {
      if (!schema.properties?.[k]) errors.push(`${path}.${k}: not allowed`);
      else errors.push(...conforms(schema.properties[k], value[k], `${path}.${k}`));
    }
  }
  return errors;
}

/** Every object in a strict schema must require all its properties and forbid extras. */
function strictnessProblems(schema, path = "$") {
  const out = [];
  if ([].concat(schema.type).includes("object")) {
    if (schema.additionalProperties !== false) out.push(`${path}: additionalProperties must be false`);
    const keys = Object.keys(schema.properties ?? {});
    if (JSON.stringify([...(schema.required ?? [])].sort()) !== JSON.stringify([...keys].sort())) out.push(`${path}: required must list every property`);
    for (const k of keys) out.push(...strictnessProblems(schema.properties[k], `${path}.${k}`));
  }
  if (schema.items) out.push(...strictnessProblems(schema.items, `${path}[]`));
  return out;
}

test("schema is strict-mode compliant: every object requires all properties and forbids extras", () => {
  assert.deepEqual(strictnessProblems(REPORT_JSON_SCHEMA), []);
  assert.equal(REPORT_JSON_SCHEMA_NAME, "service_call_report_scr_1_4");
  assert.equal(REPORT_SCHEMA_VERSION, "scr-1.4");
});

test("model output conforms to the schema sent to the provider; observations must come from the server (scr-1.4)", () => {
  assert.deepEqual(conforms(REPORT_JSON_SCHEMA, textOnlyContent()), []);
  // The model may not return observations of its own: maxItems 0.
  assert.ok(conforms(REPORT_JSON_SCHEMA, validContent()).some((e) => e.includes("mediaObservations: too many items")));
  assert.equal(REPORT_JSON_SCHEMA.properties.mediaObservations.maxItems, 0);
});

test("schema rejects the shapes the validator rejects (missing quote, extra field, bad enum)", () => {
  const noQuote = textOnlyContent();
  delete noQuote.customerReported.statements[0].quote;
  assert.ok(conforms(REPORT_JSON_SCHEMA, noQuote).some((e) => e.includes("quote: missing")));
  const extra = { ...textOnlyContent(), verdict: "covered" };
  assert.ok(conforms(REPORT_JSON_SCHEMA, extra).some((e) => e.includes("verdict: not allowed")));
  const badEnum = textOnlyContent();
  badEnum.urgency.level = "SEVERE";
  assert.ok(conforms(REPORT_JSON_SCHEMA, badEnum).some((e) => e.includes("not in enum")));
});

test("scr-1.1/1.2 vocabulary: CONFLICTING_CUSTOMER_INFORMATION and EVIDENCE_DISCREPANCY are valid topics in both schema and validator", () => {
  const topicEnum = REPORT_JSON_SCHEMA.properties.unknownsRequiringInspection.items.properties.topic.enum;
  assert.ok(topicEnum.includes("CONFLICTING_CUSTOMER_INFORMATION"));
  assert.ok(topicEnum.includes("EVIDENCE_DISCREPANCY"));
  assert.deepEqual(topicEnum, [...UNKNOWN_TOPICS]);
});

test("schema top-level keys match the validator's content keys", () => {
  assert.deepEqual(Object.keys(REPORT_JSON_SCHEMA.properties).sort(), Object.keys(validContent()).sort());
  assert.deepEqual(Object.keys(REPORT_JSON_SCHEMA.properties.customerReported.properties.statements.items.properties).sort(), ["id", "quote", "source", "text"]);
});
