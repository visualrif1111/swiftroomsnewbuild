import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Read-only client for fetching published content. No token is required for a
// public dataset; if SANITY_API_READ_TOKEN is set (server-only) it is used for
// draft/preview reads. useCdn=true serves cached, fast public content.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "published",
});
