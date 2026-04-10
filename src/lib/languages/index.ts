import { LanguageDefinition } from "./types";
import { eastAsianLanguages } from "./east-asian";
import { europeanLanguages } from "./european";
import { africanLanguages } from "./african";
import { indianLanguages } from "./indian";
import { americasLanguages } from "./americas";
import { constructedLanguages } from "./constructed";

export const ALL_LANGUAGES: LanguageDefinition[] = [
  ...eastAsianLanguages,
  ...europeanLanguages,
  ...africanLanguages,
  ...indianLanguages,
  ...americasLanguages,
  ...constructedLanguages,
];

export const LANGUAGE_BY_REGION = {
  "east-asian": eastAsianLanguages,
  european: europeanLanguages,
  african: africanLanguages,
  indian: indianLanguages,
  americas: americasLanguages,
  constructed: constructedLanguages,
};

export const REGION_LABELS: Record<string, string> = {
  "east-asian": "East Asian (3 languages)",
  european: "European (12 languages)",
  african: "African (10 languages)",
  indian: "Indian (35 languages)",
  americas: "Native American / Siberian / South American (14 languages)",
  constructed: "Constructed Languages (11 languages)",
};

export const REGION_COLORS: Record<string, string> = {
  "east-asian": "#EF4444",
  european: "#3B82F6",
  african: "#10B981",
  indian: "#F59E0B",
  americas: "#8B5CF6",
  constructed: "#EC4899",
};

export function getLanguageByCode(code: string): LanguageDefinition | undefined {
  return ALL_LANGUAGES.find((l) => l.code === code);
}

export function searchLanguages(query: string): LanguageDefinition[] {
  const q = query.toLowerCase();
  return ALL_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.nativeName.includes(q) ||
      l.code.includes(q) ||
      l.family.toLowerCase().includes(q) ||
      l.paradigm.toLowerCase().includes(q) ||
      l.region.includes(q)
  );
}
