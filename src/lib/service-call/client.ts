// The single place that decides which ServiceRequestClient the UI talks to.
//
//   UI components
//        ↓
//   getServiceRequestClient()        ← this file
//        ↓
//   mockServiceRequestClient         ← Phase 1 (now)
//   httpServiceRequestClient         ← later: POSTs to the agreed API contract
//
// To integrate a real backend, implement ServiceRequestClient (types.ts) and
// return it here. No component imports a backend directly.
import { mockServiceRequestClient } from "./mock-client";
import type { ServiceRequestClient } from "./types";

export function getServiceRequestClient(): ServiceRequestClient {
  return mockServiceRequestClient;
}
