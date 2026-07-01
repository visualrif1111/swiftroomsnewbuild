// Enables Next.js Draft Mode so the Presentation tool can preview unpublished
// (draft) content. Access is secured by Sanity's built-in preview-url-secret
// mechanism: `defineEnableDraftMode` validates the signed secret against the
// dataset using a server-only read token. No secret is exposed to the browser,
// and requests without a valid Sanity session/secret are rejected.
import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";

const token = process.env.SANITY_API_READ_TOKEN;

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});
