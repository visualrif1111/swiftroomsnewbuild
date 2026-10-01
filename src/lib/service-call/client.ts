// The single place that decides which ServiceRequestClient the UI talks to.
//
//   UI components
//        ↓
//   getServiceRequestClient()        ← this file
//        ↓
//   httpServiceRequestClient         → POST /api/service-requests → database
//   mockServiceRequestClient         ← UI-only testing, nothing leaves the browser
//
// No component imports a backend directly. Set
// NEXT_PUBLIC_SERVICE_CALL_CLIENT=mock to run the wizard without a backend.
import { httpServiceRequestClient } from "./http-client";
import { mockServiceRequestClient } from "./mock-client";
import type { ServiceRequestClient } from "./types";

export function getServiceRequestClient(): ServiceRequestClient {
  return process.env.NEXT_PUBLIC_SERVICE_CALL_CLIENT === "mock" ? mockServiceRequestClient : httpServiceRequestClient;
}
