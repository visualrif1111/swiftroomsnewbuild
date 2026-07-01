"use client";

// Sanity Studio config — embedded at /studio. Uses only public project values.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schema } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { locations, mainDocuments } from "./src/sanity/presentation/resolve";

export default defineConfig({
  basePath: "/studio",
  title: "Swiftrooms Studio",
  projectId,
  dataset,
  schema,
  plugins: [
    // Grouped content navigation (Content / Support / About / Site Management).
    structureTool({ structure }),
    // Live visual editing — see the real site while editing, click-to-edit,
    // and preview drafts before publishing. `initial` defaults to the Studio's
    // own origin (localhost:3000 in dev, the Vercel domain in production), so
    // the preview always loads the matching frontend.
    presentationTool({
      title: "Live Preview",
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
      resolve: {
        mainDocuments,
        locations,
      },
    }),
    // GROQ playground for developers.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
