// Live content + draft-aware fetching for Sanity Visual Editing.
//
// `sanityFetch` is a drop-in replacement for `client.fetch` that:
//   - serves PUBLISHED content (via CDN) for normal visitors, and
//   - automatically switches to DRAFT content + stega encoding when Next.js
//     Draft Mode is enabled (i.e. inside the Presentation tool / preview).
//
// `<SanityLive />` streams content-change events so the preview updates live.
//
// SECURITY: only `serverToken` is configured. The read token is used on the
// server to read drafts and is NEVER shared with the browser (no `browserToken`).
// Live draft updates in Presentation are driven server-side via revalidation.
import { defineLive } from "next-sanity/live";
import { client } from "./client";

const serverToken = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken,
});
