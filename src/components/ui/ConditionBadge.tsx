/**
 * Condition code badge — PRD §11 taxonomy (K0-K6).
 *
 * Two things this component owns, and screens therefore never decide:
 *
 *  1. WHICH TONE a condition gets. K0 is fine, K1/K2 are cosmetic, K3/K5 are
 *     serious. That's a visual mapping, so it belongs on the reskin surface.
 *  2. PRD B-08: never show a bare class code to a farmer. The badge always
 *     renders plain language; `showCode` adds the code alongside it for
 *     screens where a buyer is comparing against a filter list.
 *
 * NF-03: severity is carried by the text, not just the colour.
 */

import type { KondisiKode, TingkatKeparahan } from "@/api/types";
import { LABEL_KEPARAHAN, LABEL_KONDISI } from "@/lib/domain";

import { Badge, type NadaBadge } from "./Badge";

const NADA_KONDISI: Record<KondisiKode, NadaBadge> = {
  K0: "success", // mulus — oversupply case
  K1: "warning", // shape/size
  K2: "warning", // bruising
  K3: "danger", // partial rot
  K4: "warning", // overripe
  K5: "danger", // pest damage
  K6: "warning", // wilting
};

const NADA_KEPARAHAN: Record<TingkatKeparahan, NadaBadge> = {
  tidak_ada: "success",
  ringan: "info",
  sedang: "warning",
  berat: "danger",
};

export function ConditionBadge({
  kode,
  showCode = false,
  className,
}: {
  kode: KondisiKode;
  showCode?: boolean;
  className?: string;
}) {
  return (
    <Badge
      label={showCode ? `${kode} · ${LABEL_KONDISI[kode]}` : LABEL_KONDISI[kode]}
      tone={NADA_KONDISI[kode]}
      className={className}
    />
  );
}

export function SeverityBadge({
  keparahan,
  className,
}: {
  keparahan: TingkatKeparahan;
  className?: string;
}) {
  return (
    <Badge
      label={LABEL_KEPARAHAN[keparahan]}
      tone={NADA_KEPARAHAN[keparahan]}
      className={className}
    />
  );
}

/**
 * PRD F-03: self-reported condition must stay visually distinguishable from
 * CV-classified condition wherever a buyer can see it. Centralised here so no
 * screen can forget to show it.
 */
export function VerificationBadge({
  dilaporkanSendiri,
  className,
}: {
  dilaporkanSendiri: boolean;
  className?: string;
}) {
  return (
    <Badge
      label={dilaporkanSendiri ? "Dilaporkan sendiri" : "Terverifikasi foto"}
      tone={dilaporkanSendiri ? "warning" : "info"}
      icon={dilaporkanSendiri ? "person-outline" : "camera-outline"}
      className={className}
    />
  );
}

/** PRD H-02 urgency flag, derived from the shelf-life window. */
export function UrgencyBadge({ className }: { className?: string }) {
  return (
    <Badge label="Mendesak" tone="danger" icon="time-outline" className={className} />
  );
}
