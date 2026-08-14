/**
 * Pinned Annex I instrument list of Regulation (EU) 2024/1689 as amended by
 * Regulation (EU) 2026/1744, transcribed from the sealed corpus snapshot
 * law/celex-02024R1689-20260727-consolidated.txt.
 *
 * Article 6(1), point (a), conditions the Annex I high-risk route on coverage
 * by "the Union harmonisation legislation listed in Annex I". Listing is a
 * closed-list membership question that is decidable against the pinned corpus.
 * A caller-asserted instrument therefore only grounds the route when the cited
 * instrument itself is one of the listed acts below. Instruments that appear
 * inside another entry's official title (for example the acts that the medical
 * devices regulation in Section A, point 11 amends) are not listed acts.
 *
 * Matching is by instrument identity (canonical citation or CELEX equality),
 * never by keyword or substring presence in Annex I text. Section A, point 1
 * was deleted by Regulation (EU) 2026/1744 and is intentionally absent.
 * The claim matrix pins this list against the sealed corpus on both sides.
 */

export interface AnnexIInstrument {
  /** Annex I point number in the pinned consolidated text. */
  annex_point: number;
  /** Annex I section: "A" (New Legislative Framework) or "B" (other). */
  section: "A" | "B";
  /** CELEX number of the listed instrument. */
  celex: string;
  /** Canonical short citation of the listed instrument. */
  citation: string;
  /** Instrument kind used for identity matching. */
  kind: "regulation" | "directive";
  /** Year component of the instrument identity. */
  year: number;
  /** Sequential number component of the instrument identity. */
  number: number;
  /** Short subject label taken from the listed title. */
  subject: string;
}

export const ANNEX_I_INSTRUMENTS: readonly AnnexIInstrument[] = [
  { annex_point: 2, section: "A", celex: "32009L0048", citation: "Directive 2009/48/EC", kind: "directive", year: 2009, number: 48, subject: "safety of toys" },
  { annex_point: 3, section: "A", celex: "32013L0053", citation: "Directive 2013/53/EU", kind: "directive", year: 2013, number: 53, subject: "recreational craft and personal watercraft" },
  { annex_point: 4, section: "A", celex: "32014L0033", citation: "Directive 2014/33/EU", kind: "directive", year: 2014, number: 33, subject: "lifts and safety components for lifts" },
  { annex_point: 5, section: "A", celex: "32014L0034", citation: "Directive 2014/34/EU", kind: "directive", year: 2014, number: 34, subject: "equipment and protective systems intended for use in potentially explosive atmospheres" },
  { annex_point: 6, section: "A", celex: "32014L0053", citation: "Directive 2014/53/EU", kind: "directive", year: 2014, number: 53, subject: "radio equipment" },
  { annex_point: 7, section: "A", celex: "32014L0068", citation: "Directive 2014/68/EU", kind: "directive", year: 2014, number: 68, subject: "pressure equipment" },
  { annex_point: 8, section: "A", celex: "32016R0424", citation: "Regulation (EU) 2016/424", kind: "regulation", year: 2016, number: 424, subject: "cableway installations" },
  { annex_point: 9, section: "A", celex: "32016R0425", citation: "Regulation (EU) 2016/425", kind: "regulation", year: 2016, number: 425, subject: "personal protective equipment" },
  { annex_point: 10, section: "A", celex: "32016R0426", citation: "Regulation (EU) 2016/426", kind: "regulation", year: 2016, number: 426, subject: "appliances burning gaseous fuels" },
  { annex_point: 11, section: "A", celex: "32017R0745", citation: "Regulation (EU) 2017/745", kind: "regulation", year: 2017, number: 745, subject: "medical devices" },
  { annex_point: 12, section: "A", celex: "32017R0746", citation: "Regulation (EU) 2017/746", kind: "regulation", year: 2017, number: 746, subject: "in vitro diagnostic medical devices" },
  { annex_point: 13, section: "B", celex: "32008R0300", citation: "Regulation (EC) No 300/2008", kind: "regulation", year: 2008, number: 300, subject: "civil aviation security" },
  { annex_point: 14, section: "B", celex: "32013R0168", citation: "Regulation (EU) No 168/2013", kind: "regulation", year: 2013, number: 168, subject: "two- or three-wheel vehicles and quadricycles" },
  { annex_point: 15, section: "B", celex: "32013R0167", citation: "Regulation (EU) No 167/2013", kind: "regulation", year: 2013, number: 167, subject: "agricultural and forestry vehicles" },
  { annex_point: 16, section: "B", celex: "32014L0090", citation: "Directive 2014/90/EU", kind: "directive", year: 2014, number: 90, subject: "marine equipment" },
  { annex_point: 17, section: "B", celex: "32016L0797", citation: "Directive (EU) 2016/797", kind: "directive", year: 2016, number: 797, subject: "interoperability of the rail system" },
  { annex_point: 18, section: "B", celex: "32018R0858", citation: "Regulation (EU) 2018/858", kind: "regulation", year: 2018, number: 858, subject: "approval and market surveillance of motor vehicles and their trailers" },
  { annex_point: 19, section: "B", celex: "32019R2144", citation: "Regulation (EU) 2019/2144", kind: "regulation", year: 2019, number: 2144, subject: "type-approval requirements for motor vehicles as regards general safety" },
  { annex_point: 20, section: "B", celex: "32018R1139", citation: "Regulation (EU) 2018/1139", kind: "regulation", year: 2018, number: 1139, subject: "civil aviation, bounded to the unmanned aircraft scope stated in point 20" },
  { annex_point: 21, section: "B", celex: "32023R1230", citation: "Regulation (EU) 2023/1230", kind: "regulation", year: 2023, number: 1230, subject: "machinery" },
];

export interface InstrumentReference {
  kind: "regulation" | "directive";
  year: number;
  number: number;
}

const PLAUSIBLE_YEAR = (value: number): boolean => value >= 1950 && value <= 2099;

interface ParsedCandidate extends InstrumentReference {
  index: number;
}

/**
 * Extract the leading instrument citation from caller text. The first citation
 * in an official title is the cited instrument itself; citations of amended or
 * repealed acts follow it inside the title. Returns null when no citation form
 * is recognised.
 */
export function parseInstrumentReference(text: string): InstrumentReference | null {
  const candidates: ParsedCandidate[] = [];

  // Form 1: "Regulation (EU) 2017/745", "Regulation (EC) No 300/2008",
  // "Directive (EU) 2016/797". "No" marks number-before-year order.
  const bracketForm = /\b(regulation|directive)\s*\((?:eu|ec|eec)(?:,\s*euratom)?\)\s*(no\.?\s*)?(\d{1,4})\/(\d{1,4})/gi;
  for (const match of text.matchAll(bracketForm)) {
    const kind = match[1]!.toLowerCase() as InstrumentReference["kind"];
    const first = Number.parseInt(match[3]!, 10);
    const second = Number.parseInt(match[4]!, 10);
    let year = first;
    let number = second;
    if (match[2]) {
      year = second;
      number = first;
    } else if (!PLAUSIBLE_YEAR(first) && PLAUSIBLE_YEAR(second)) {
      year = second;
      number = first;
    }
    candidates.push({ kind, year, number, index: match.index ?? 0 });
  }

  // Form 2: "Directive 2009/48/EC", "Directive 2014/90/EU".
  const suffixForm = /\bdirective\s*(\d{4})\/(\d{1,4})\/(?:eu|ec|eec)\b/gi;
  for (const match of text.matchAll(suffixForm)) {
    candidates.push({
      kind: "directive",
      year: Number.parseInt(match[1]!, 10),
      number: Number.parseInt(match[2]!, 10),
      index: match.index ?? 0,
    });
  }

  // Form 3: CELEX sector 3 identifiers, for example "32017R0745".
  const celexForm = /\b3(\d{4})(r|l)(\d{4})\b/gi;
  for (const match of text.matchAll(celexForm)) {
    candidates.push({
      kind: match[2]!.toLowerCase() === "r" ? "regulation" : "directive",
      year: Number.parseInt(match[1]!, 10),
      number: Number.parseInt(match[3]!, 10),
      index: match.index ?? 0,
    });
  }

  if (candidates.length === 0) return null;
  candidates.sort((left, right) => left.index - right.index);
  const leading = candidates[0]!;
  return { kind: leading.kind, year: leading.year, number: leading.number };
}

export type AnnexIListMembership =
  | { status: "listed"; entry: AnnexIInstrument; reference: InstrumentReference }
  | { status: "not_listed"; reference: InstrumentReference }
  | { status: "no_citation" };

/**
 * Decide Annex I list membership for one caller-supplied legislation string by
 * instrument identity against the pinned closed list. Never matches keywords
 * or substrings of Annex I text.
 */
export function matchAnnexIInstrument(text: string): AnnexIListMembership {
  const reference = parseInstrumentReference(text);
  if (!reference) return { status: "no_citation" };
  const entry = ANNEX_I_INSTRUMENTS.find(
    (item) =>
      item.kind === reference.kind &&
      item.year === reference.year &&
      item.number === reference.number,
  );
  return entry ? { status: "listed", entry, reference } : { status: "not_listed", reference };
}

export interface AnnexIListingAssessment {
  /** True when at least one caller entry cites a listed instrument. */
  any_listed: boolean;
  /** True when at least one caller entry parsed to an instrument identity. */
  any_citation: boolean;
  /** True when citations exist and every cited instrument is outside the list. */
  refuted: boolean;
  /** Listed entries matched by caller citations, ascending by Annex I point. */
  listed_points: number[];
}

/**
 * Aggregate membership over every caller-supplied annex_i_legislation value.
 * The listing is refuted only when the caller cited at least one identifiable
 * instrument and none of the cited instruments is in the pinned list.
 */
export function assessAnnexIListing(values: readonly string[]): AnnexIListingAssessment {
  let anyListed = false;
  let anyCitation = false;
  const listedPoints: number[] = [];
  for (const value of values) {
    const membership = matchAnnexIInstrument(value);
    if (membership.status === "no_citation") continue;
    anyCitation = true;
    if (membership.status === "listed") {
      anyListed = true;
      if (!listedPoints.includes(membership.entry.annex_point)) {
        listedPoints.push(membership.entry.annex_point);
      }
    }
  }
  return {
    any_listed: anyListed,
    any_citation: anyCitation,
    refuted: anyCitation && !anyListed,
    listed_points: listedPoints.sort((left, right) => left - right),
  };
}
