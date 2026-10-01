import type { Ref } from "react";
import type { ServiceRequestDraft } from "@/lib/service-call/types";

/** Props shared by every wizard step. */
export interface StepProps {
  draft: ServiceRequestDraft;
  onChange: (patch: Partial<ServiceRequestDraft>) => void;
  onNext: () => void;
  onBack?: () => void;
  /** Attached to the step heading so the wizard can move focus to it. */
  headingRef: Ref<HTMLHeadingElement>;
  /** "Back to review" when the customer arrived here from an Edit link. */
  nextLabel?: string;
}
