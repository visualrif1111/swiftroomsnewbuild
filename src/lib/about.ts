// Company-content data layer (about / reviews / process pages): Sanity-first
// with a data.ts fallback. Covers testimonials, team members, timeline entries,
// process steps and certifications — the content migrated into Sanity by
// scripts/migrate-misc-to-sanity.ts. If Sanity isn't configured or a fetch
// fails, everything falls back to data.ts so the build/site never breaks.
import { cache } from "react";
import { groq } from "next-sanity";
import {
  testimonials as dataTestimonials,
  teamMembers as dataTeam,
  timeline as dataTimeline,
  processSteps as dataProcess,
  type Testimonial,
  type TeamMember,
  type TimelineEntry,
} from "@/lib/data";

export type ProcessStep = { number: string; title: string; description: string };
export type Certification = { name: string; detail?: string };

const sanityConfigured = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

// Certifications have no data.ts export — this is their canonical source,
// mirrored by the migration script. The About page previously inlined them.
const dataCertifications: Certification[] = [
  { name: "Cortizo Authorised Partner", detail: "UAE — since 2011" },
  { name: "Gulf Extrusions Approved Installer", detail: "UAE — since 2015" },
  { name: "Vetromax Authorised Partner", detail: "UAE — since 2017" },
  { name: "QUALICOAT Certified", detail: "Powder coat quality standard" },
  { name: "Dubai Municipality Registered", detail: "Commercial contractor" },
  { name: "ISO 9001:2015", detail: "Quality management system" },
];

// Shared Sanity-first reader: returns the projected rows when non-empty,
// otherwise the data.ts fallback.
async function fromSanity<T>(query: string, fallback: T[]): Promise<T[]> {
  if (sanityConfigured()) {
    try {
      const { client } = await import("@/sanity/lib/client");
      const rows: T[] = await client.fetch(query, {}, { next: { revalidate: 60 } });
      if (rows?.length) return rows;
    } catch {
      // fall through to data.ts
    }
  }
  return fallback;
}

const TESTIMONIALS_QUERY = groq`*[_type == "testimonial"]|order(order asc){ quote, author, location, project, product }`;
const TEAM_QUERY = groq`*[_type == "teamMember"]|order(order asc){ name, role, group, bio, "image": image.asset->url }`;
const TIMELINE_QUERY = groq`*[_type == "timelineEntry"]|order(order asc){ year, title, description }`;
const PROCESS_QUERY = groq`*[_type == "processStep"]|order(order asc){ "number": stepNumber, title, description }`;
const CERTIFICATIONS_QUERY = groq`*[_type == "certification"]|order(order asc){ name, detail }`;

export const getTestimonials = cache((): Promise<Testimonial[]> =>
  fromSanity(TESTIMONIALS_QUERY, dataTestimonials));

export const getTeamMembers = cache((): Promise<TeamMember[]> =>
  fromSanity(TEAM_QUERY, dataTeam));

export const getTimeline = cache((): Promise<TimelineEntry[]> =>
  fromSanity(TIMELINE_QUERY, dataTimeline));

export const getProcessSteps = cache((): Promise<ProcessStep[]> =>
  fromSanity(PROCESS_QUERY, dataProcess));

export const getCertifications = cache((): Promise<Certification[]> =>
  fromSanity(CERTIFICATIONS_QUERY, dataCertifications));
