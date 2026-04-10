/**
 * FLUX Language Definition Types
 * Each language encodes grammatical constraints that map to programming paradigms.
 */

export interface LanguageDefinition {
  code: string;           // ISO 639-1/3 code
  name: string;           // English name
  nativeName: string;     // Name in native script
  family: string;         // Language family
  region: string;         // Geographic region
  script: string;         // Writing system
  paradigm: string;       // Programming paradigm enabled by grammar
  paradigmDesc: string;   // Detailed explanation
  grammaticalConstraint: string; // The key grammatical feature that enables the paradigm
  constraintDetail: string;     // How the constraint maps to computation
  color: string;          // Display color (hex)
  vocabulary: LanguageVocab[];
  sampleProgram: string;
  sampleTranslation: string; // English translation
}

export interface LanguageVocab {
  pattern: string;       // Natural language pattern in this language
  assembly: string;      // FLUX assembly expansion
  name: string;          // Human-readable name
  description: string;   // What this does
  tags: string[];
  example: string;       // Example input
}

export type LanguageRegion = "east-asian" | "european" | "african" | "indian" | "americas" | "constructed";
