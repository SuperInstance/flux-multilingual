const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents, PageBreak, LevelFormat,
} = require("docx");

// ═══════════════════════════════════════════════════════════════
// PALETTE: DM-1 (Deep Cyan) — AI, tech proposals
// ═══════════════════════════════════════════════════════════════
const P = {
  bg: "162235",
  primary: "FFFFFF",
  accent: "37DCF2",
  body: "1A2B40",
  secondary: "6878A0",
  surface: "F4F8FC",
  coverBg: "162235",
  tableHeaderBg: "1B6B7A",
  tableHeaderText: "FFFFFF",
  tableAccent: "1B6B7A",
  tableInner: "C8DDE2",
  tableSurface: "EDF3F5",
};
const c = (hex) => hex.replace("#", "");

// ═══════════════════════════════════════════════════════════════
// BORDER CONSTANTS
// ═══════════════════════════════════════════════════════════════
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200, line: 312 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, color: c(P.body) })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, color: c(P.body) })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, color: c(P.secondary) })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: 312 },
    children: [new TextRun({ text, size: 24, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) })],
  });
}

function bodyBold(label, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: 312 },
    children: [
      new TextRun({ text: label, bold: true, size: 24, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) }),
      new TextRun({ text, size: 24, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) }),
    ],
  });
}

function quote(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 720, right: 720 },
    spacing: { before: 160, after: 160, line: 312 },
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent), space: 12 } },
    children: [new TextRun({ text, italics: true, size: 22, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.secondary) })],
  });
}

function spacer(h = 120) {
  return new Paragraph({ spacing: { before: h, after: 0 }, children: [] });
}

function makeHeaderRow(cells) {
  return new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: cells.map(t =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 21, font: { ascii: "Calibri", eastAsia: "SimHei" }, color: c(P.tableHeaderText) })] })],
        shading: { type: ShadingType.CLEAR, fill: P.tableHeaderBg },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
      })
    ),
  });
}

function makeDataRow(cells, idx) {
  return new TableRow({
    cantSplit: true,
    children: cells.map(t =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t, size: 21, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) })] })],
        shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: P.tableSurface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
      })
    ),
  });
}

function makeTable(headers, rows, colWidths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: P.tableAccent },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: P.tableAccent },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.tableInner },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      makeHeaderRow(headers),
      ...rows.map((r, i) => makeDataRow(r, i)),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════
// COVER PAGE — R1 (Pure Paragraph Left) with DM-1
// ═══════════════════════════════════════════════════════════════
function buildCover() {
  const coverChildren = [];
  
  // Top accent line
  coverChildren.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      border: { top: { style: BorderStyle.SINGLE, size: 18, color: c(P.accent), space: 0 } },
      children: [],
    })
  );

  // Large top spacing
  coverChildren.push(spacer(4200));

  // Title
  coverChildren.push(
    new Paragraph({
      spacing: { before: 0, after: 200, line: Math.ceil(36 * 23), lineRule: "atLeast" },
      children: [
        new TextRun({ text: "FLUX Multilingual", bold: true, size: 72, font: { ascii: "Calibri", eastAsia: "SimHei" }, color: c(P.primary) }),
      ],
    })
  );
  coverChildren.push(
    new Paragraph({
      spacing: { before: 0, after: 200, line: Math.ceil(36 * 23), lineRule: "atLeast" },
      children: [
        new TextRun({ text: "Natural Language Programming", bold: true, size: 72, font: { ascii: "Calibri", eastAsia: "SimHei" }, color: c(P.primary) }),
      ],
    })
  );

  // Subtitle
  coverChildren.push(
    new Paragraph({
      spacing: { before: 200, after: 120, line: 400 },
      children: [
        new TextRun({ text: "Strategic Architecture and Implementation Roadmap", size: 32, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.accent) }),
      ],
    })
  );

  // Accent divider
  coverChildren.push(spacer(400));
  coverChildren.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent), space: 0 }, left: { style: BorderStyle.SINGLE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.SINGLE, size: 0, color: "FFFFFF" }, top: { style: BorderStyle.SINGLE, size: 0, color: "FFFFFF" } },
      indent: { left: 0, right: 6000 },
      children: [],
    })
  );

  // Meta info
  coverChildren.push(spacer(400));
  const metaLines = [
    "80+ Languages  |  Grammar-to-Bytecode  |  Agent-Native",
    "Based on flux-runtime, captains-log, and capitaine/cocapn",
    "SuperInstance & Lucineer Ecosystem",
    "April 2026",
  ];
  metaLines.forEach(line => {
    coverChildren.push(
      new Paragraph({
        spacing: { before: 80, after: 80, line: 312 },
        children: [new TextRun({ text: line, size: 22, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: "90989F" })],
      })
    );
  });

  // Bottom accent line
  coverChildren.push(spacer(2000));
  coverChildren.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: c(P.accent), space: 0 } },
      children: [],
    })
  );

  // Wrap in full-page table
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [
      new TableRow({
        height: { value: 16838, rule: "exact" },
        verticalAlign: "top",
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: allNoBorders,
            shading: { type: ShadingType.CLEAR, fill: P.coverBg },
            margins: { top: 0, bottom: 0, left: 1200, right: 1200 },
            children: coverChildren,
          }),
        ],
      }),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT CONTENT
// ═══════════════════════════════════════════════════════════════
const content = [];

// ─── SECTION 1: Executive Summary ───
content.push(h1("1. Executive Summary"));
content.push(body("FLUX (Fluid Language Universal eXecution) is a markdown-to-bytecode runtime designed for AI agents, built by the SuperInstance and Lucineer ecosystem (DiGennaro et al.). It compiles structured natural language into bytecode executed on a custom 64-register Micro-VM with 104 opcodes, 2,037 tests, and zero external dependencies. The system currently supports English-only FLUX-ese (a precision natural language format) but is architecturally prepared for multilingual expansion. This document presents the strategic architecture and implementation roadmap for extending FLUX to support 80+ natural languages, each encoding distinct grammatical viewpoint constraints that enable fundamentally different kinds of natural language programming."));
content.push(body("The core thesis, articulated across three interconnected repositories, is that language is the programming interface for agents, and that every human language encodes unique epistemological assumptions in its grammatical structures. These grammatical constraints, far from being limitations, become powerful programming primitives when compiled to bytecode. A Chinese programmer working in a topic-prominent, classifier-based grammatical framework will produce qualitatively different programs than an English programmer working in a subject-prominent, article-requiring framework. A Quechua programmer, whose language grammatically forces evidentiality marking (specifying how one knows something), will produce programs with inherently stronger epistemic tracking than languages that lack this feature."));
content.push(body("The three repositories studied form a tightly integrated ecosystem. flux-runtime provides the bytecode VM, compiler pipeline (markdown to FIR SSA IR to bytecode), and vocabulary/tiling system. captains-log documents the agent's operational philosophy, decision frameworks, and the principle that the repository is the agent, the code is the body, and git history is the memory. capitaine/cocapn provides the fleet coordination layer, where 100+ autonomous agents communicate through git-native A2A protocols with confidence propagation, deliberation as first-class control flow, and viewpoint-encoded communication."));
content.push(body("The proposed architecture, code-named The Babel Lattice, introduces a Universal Grammatical IR (UGIR) that sits between language-specific grammatical parsers and the existing FIR layer. Eighteen Programmatically Relevant Grammatical Features (PRGFs) are identified across five tiers: structural, typological, epistemic, discourse, and morphological. Each of the 80+ target languages is profiled against these dimensions, enabling a grammar-to-bytecode compilation strategy where 16 new viewpoint opcodes extend the existing 104-opcode ISA without breaking backward compatibility. The result is a single, unified bytecode format that all 80+ languages compile to, with grammatical constraints enforced at compile time and stripped before execution."));

// ─── SECTION 2: Research Findings ───
content.push(h1("2. Research Findings"));

content.push(h2("2.1 flux-runtime: The Bytecode Engine"));
content.push(body("flux-runtime is a fully functional compiler and virtual machine written in Python 3.10+, installable via pip with zero dependencies. It implements a complete 8-tier architecture from core VM execution through agent runtime, A2A protocol, adaptive optimization, evolution engine, modular hot-reload, and synthesis. The compilation pipeline accepts three input formats: C source code, Python source code, and FLUX.MD (structured markdown), all compiling to FIR (Fluid Intermediate Representation), a full SSA IR with typed values, blocks, and functions, then to FLUX binary bytecode with a compact variable-length encoding across 6 formats."));
content.push(body("The 104 opcodes are organized into functional groups: control flow (8), integer arithmetic (8), bitwise operations (8), comparison (8), stack operations (8), function operations (8), memory management (8), type operations (4), floating-point arithmetic (8), floating-point comparison (8), SIMD vector operations (7), A2A protocol (32), and system operations (5). The A2A opcodes are particularly notable because they are native bytecode instructions, not library calls. TELL, ASK, DELEGATE, BROADCAST, TRUST_CHECK, CAP_REQUIRE, and 26 other inter-agent operations are first-class machine instructions, reflecting the design philosophy that agent communication is fundamental to computation."));
content.push(body("The natural language processing layer (open_interpreter.py) currently works via regex pattern matching and vocabulary file substitution, not a formal grammar parser. Nineteen built-in vocabulary patterns span core operations, mathematics, loops, maritime domain, and research paper concepts. The tiling system composes these Level 0 primitives into Level N domain concepts. The vocabulary system (.fluxvocab and .ese files) is identified as the primary extensibility point for multilingual support. Critically, no multilingual infrastructure currently exists in the codebase, but the architecture is inherently multilingual-capable because vocabulary files can define patterns in any natural language."));

content.push(h2("2.2 captains-log: The Agent's Memory"));
content.push(body("captains-log is the operational diary of Oracle1, an AI agent that serves as the lighthouse keeper for the fleet infrastructure. Modeled on the legal document that every vessel must maintain, the log serves five functions: continuity across sessions (the agent wakes fresh each time, so log entries are its memory), training data for future LoRA fine-tuning (lessons become instincts), inter-agent communication (other agents read the log to understand working style), accountability (human audit trail), and succession planning (the Prot\u00e9g\u00e9 pipeline for multi-generational agent improvement)."));
content.push(body("The log reveals a sophisticated operational philosophy built on several key principles. The four-factor decision framework prioritizes compound value, dependency chains, visible progress, and future-self's wishes. The Disagreeable Assistants pattern (Sage and Cynic) enforces productive conflict as a forcing function for agent evolution. The hermit crab architecture, where agents inherit and modify repository infrastructure rather than building from scratch, is captured in the principle: same bytecode, different shells, same crab. The Prot\u00e9g\u00e9 pipeline targets measurable improvement from 60% first-try success (Oracle1) through 80% (Gen 2) to an asymptote of 95% across generations."));
content.push(body("The log articulates the central thesis that language is key with particular clarity. FLUX-ese is described as legalese for code, where precision comes through shared vocabulary rather than syntax complexity. The insight that developers do not write code, they teach the interpreter new words, combined with the tiling system where Level 0 vocabulary primitives compound into Level N domain concepts and decisions, establishes the vocabulary-as-programming-interface paradigm that makes multilingual expansion natural rather than bolted-on."));

content.push(h2("2.3 capitaine/cocapn: The Fleet Ecosystem"));
content.push(body("The capitaine/cocapn ecosystem comprises 100+ repositories across two GitHub organizations (Lucineer and SuperInstance), organized into a three-tier fleet structure. Capitaine itself is a git-native autonomous AI agent deployed as a Cloudflare Worker, where the repository IS the agent, its code is the body, and git commit history is the memory. It operates on a heartbeat cycle: perception (read state), reasoning (LLM-powered analysis), action (one atomic file operation), and recovery (update tracking). The cocapn.ai Fleet Command Center monitors all deployed vessels, while cocapn-ai implements four protocol layers: A2A (Agent-to-Agent), A2UI (Agent-to-UI), A2C (Agent-to-Content), and MCP (Model Context Protocol)."));
content.push(body("The fleet is organized into three tiers. Nine Tier 1 Capital Ships serve as brain analogs: StudyLog.ai (hippocampus), MakerLog.ai (motor cortex), DMLog.ai (prefrontal cortex), Actualizer.ai (CNS), DeckBoss.ai (cerebellum), and others. Nine Tier 2 Support Vessels provide specialized services including Cocapn.com (equipment marketplace), KungFu.ai (skill injection), and Bid Engine (agent negotiation). Twelve Tier 3 Autonomous Drones handle domain-specific tasks. The Equipment Protocol defines vessel size profiles (motorcycle through excavator) with token and time budgets, 13 capability slot types, and 11 message types for inter-vessel coordination."));
content.push(body("Three linguistic layers operate within the ecosystem. FLUX-ese uses markdown with defined terms, equivalence definitions, and agent-jump markers as a precision language. Lucineer Lang is an agentic-native language where confidence is a primitive type (0-1), deliberation is control flow (consider/resolve), and NLP is isomorphic to code through a shared deliberation IR. The Higher Abstraction Vocabularies (HAV) provide 1,098 terms across 168 domains, each compressing paragraphs of explanation into a single word, serving as a compression layer for inter-agent knowledge transfer."));

// ─── SECTION 3: Architecture — The Babel Lattice ───
content.push(h1("3. Architecture: The Babel Lattice"));
content.push(body("The Babel Lattice is the overarching architecture for compiling 80+ natural languages into FLUX bytecode, treating grammatical structures as computational primitives rather than mere translation targets. The design is governed by a single inviolable principle: there is only one bytecode format. All 80+ languages compile to the same FLUX bytecode. Grammatical opcodes are metadata and guards that annotate and constrain execution but do not change the fundamental instruction set. A Quechua module and a Korean module can be linked and executed together without the VM knowing which language compiled which part."));

content.push(h2("3.1 Extended Compiler Pipeline"));
content.push(body("The existing 8-stage compiler pipeline (Source to Parser to FIR to Optimizer to Bytecode to VM) is extended with four new stages at the front end. The full 12-stage pipeline becomes: (0) Language Detection, (1) Morphophonemic Analysis, (2) Grammatical Feature Extraction, (3) Viewpoint Constraint Validation, (4) AST Generation, (5) UGIR Generation (Universal Grammatical IR), (6) Tile Matching and Expansion, (7) FIR Generation, (8) FIR Optimization, (9) Bytecode Emission, (10) VM Execution. Stages 0-3 are language-specific, stage 5 produces a language-agnostic intermediate representation, and stages 7-10 operate identically to the existing pipeline."));

content.push(h2("3.2 Programmatically Relevant Grammatical Features (PRGFs)"));
content.push(body("Eighteen grammatical features have been identified as programmatically relevant across five tiers. These are features that can constrain or enable different kinds of computation when exploited as compilation targets rather than merely descriptive categories."));

content.push(makeTable(
  ["Tier", "Feature", "Programming Relevance", "Example Languages"],
  [
    ["Structural", "Word Order (SOV/SVO/VSO/Free)", "Maps to control flow direction; SOV naturally maps to continuation-passing style", "Japanese (SOV), English (SVO), Arabic (VSO), Latin (Free)"],
    ["Structural", "Topic Prominence", "Topic register becomes implicit state threading; topic-comment maps to focus-scoped computation", "Chinese, Japanese, Malay, Korean"],
    ["Structural", "Serial Verb Constructions", "Enables pipelined computation without explicit composition operators", "Yoruba, Mandarin, Vietnamese, Ewe"],
    ["Structural", "Noun Incorporation", "Object-verb fusion as atomic operations; enables lockstep state transitions", "Inuktitut, Mohawk, Nahuatl, Mapudungun"],
    ["Typological", "Nominal Classification", "Classifiers become type annotations; noun classes become type hierarchies at compile time", "Chinese, Japanese, Swahili, Yoruba, Navajo"],
    ["Typological", "Animacy Hierarchy", "Animacy-based access control and permission systems", "Ojibwe, Navajo, Inuktitut, Ainu"],
    ["Typological", "Ergativity", "Actor undergoer split enables dual-track execution models", "Basque, Dyirbal, Inuktitut, Quechua"],
    ["Typological", "Clusivity", "Inclusive/exclusive we maps to capability boundary definitions", "Quechua, Malay, Mandarin, Tok Pisin"],
    ["Typological", "Valency Morphology", "Causative/applicative morphology as function arity manipulation", "Japanese, Turkish, Swahili, Georgian"],
    ["Epistemic", "Evidentiality (3 subtypes)", "Grammatical proof-carrying code; verification opcodes for knowledge source", "Quechua, Turkish, Tibetan, Wintu"],
    ["Epistemic", "Mirativity", "Unexpected information detection as runtime assertion", "Turkish, Korean, Quechua, Hare"],
    ["Epistemic", "Honorifics", "RBAC-like permission and capability systems embedded in grammar", "Korean, Japanese, Javanese, Tamil"],
    ["Discourse", "Switch-Reference", "Dependency tracking across clause boundaries as referential integrity checks", "Navajo, Ainu, Shipibo, Asheninka"],
    ["Discourse", "Definiteness", "Caching and memoization semantics through article system", "English, Spanish, German, Greek, Arabic"],
    ["Discourse", "Focus Systems", "Information structure maps to priority scheduling in execution", "Somali, Yoruba, Hungarian, Kurdish"],
    ["Morphological", "Morphological Type", "Isolating to polysynthetic spectrum determines program density", "Vietnam (isolating) to Inuktitut (polysynthetic)"],
    ["Morphological", "Tone", "Tonal information as metadata byte for disambiguation at runtime", "Chinese, Yoruba, Vietnamese, Twi"],
    ["Morphological", "Directional Encoding", "Spatial semantics as coordinate system primitives", "Guugu Yimithirr, Tzeltal, Navajo"],
  ]
));

content.push(h2("3.3 Opcode Extension Strategy"));
content.push(body("The existing 104-opcode ISA is extended with 16 new grammatical viewpoint opcodes (range 0xA0-0xAF) using the existing Format G (variable-length) encoding. Eight existing opcodes receive new parameterized modes for grammatical features. Twelve macro patterns are defined for common cross-linguistic constructs. No new encoding formats are introduced, maintaining backward compatibility with all existing FLUX bytecode."));
content.push(body("The new viewpoint opcodes include: GVIEW_PUSH and GVIEW_POP (grammatical viewpoint scope management), CLASSIFY (noun classifier / type annotation enforcement), VERIFY_EVIDENCE (evidentiality proof-carrying check), CHECK_HONORIFIC (permission / register level validation), SWITCH_REF (cross-clause dependency tracking), SCOPE_TOPIC (topic-comment scoping), ANIMACY_GUARD (animacy-based access control), CLUSIVITY_SET (inclusive/exclusive capability boundary), VALENCE_ADAPT (causative/applicative arity manipulation), FOCUS_SET (information structure priority), DEFINITENESS_CHECK (cache/memoization lookup), TONE_BIND (tonal metadata attachment), MIRATIVE_ASSERT (unexpected information detection), POLYMERGE (polysynthetic morpheme fusion), SERIAL_CHAIN (serial verb pipeline), and DIRECTION_ENCODE (spatial coordinate mapping)."));

content.push(h2("3.4 Vocabulary Architecture"));
content.push(body("The existing vocabulary/tiling system is generalized into a four-layer architecture. Layer 0 provides universal grammatical tiles that are language-independent, representing semantic primitives shared across all languages. Layer 1 provides family-level shared patterns such as SOV structure, classifier systems, or evidentiality marking, allowing related languages to share compilation strategies. Layer 2 provides language-specific surface forms, the actual vocabulary words and grammatical markers in each target language. Layer 3 provides domain concepts shared across all languages, the higher-level abstractions from the HAV system that compress complex ideas into single terms."));
content.push(body("Cross-language interoperability is achieved through the Universal Grammatical IR (UGIR), an intermediate representation that sits between language-specific grammatical parsing and the existing FIR layer. UGIR captures the semantic content of a natural language expression while preserving its grammatical provenance: the structural frame (topic-prominent, subject-prominent, ergative, free-order, or poly-perspectival), the epistemic frame (evidentiality requirements), the nominal frame (classifier, gender, or noun class requirements), and the confidence composition parameters. This provenance information enables the cross-linguistic coherence checking that becomes one of the most powerful features of the multilingual system."));

// ─── SECTION 4: 80-Language Target Matrix ───
content.push(h1("4. The 80-Language Target Matrix"));
content.push(body("The following table presents the complete set of target languages organized by family, with their ISO 639-3 codes, key viewpoint-encoding grammatical features, and the primary programming paradigm that each language's grammar naturally enables when compiled to FLUX bytecode. Languages are assigned to one of seven grammatical clusters based on shared compilation strategy requirements."));

content.push(h2("4.1 East Asian Languages (3)"));
content.push(makeTable(
  ["Language", "ISO 639-3", "Key Grammatical Features", "Enabled Paradigm", "Difficulty"],
  [
    ["Chinese (Mandarin)", "zho", "Topic-prominent, classifier system, tonal, pro-drop, zero anaphora", "Data-flow programming with type-safe classifiers", "3/5"],
    ["Korean", "kor", "Honorific system (7 levels), agglutination, SOV, topic/comment", "RBAC capability security via honorific levels", "4/5"],
    ["Japanese", "jpn", "Keigo (sonkeigo/kenjougo/teineigo), particles, wa/ga topic distinction", "Aspect-oriented permission and register control", "4/5"],
  ]
));

content.push(h2("4.2 European Languages (12)"));
content.push(makeTable(
  ["Language", "ISO 639-3", "Key Grammatical Features", "Enabled Paradigm", "Difficulty"],
  [
    ["English", "eng", "Subject-prominent, articles, progressive aspect, modal verbs", "Actor-model concurrency with modal verification", "1/5"],
    ["French", "fra", "Gender agreement, subjunctive mood, pro-drop partial", "Type-state machines via mood/gender tracking", "2/5"],
    ["German", "deu", "Case system (4 cases), verb-second, compound words, separable prefixes", "Scope-based access control via case marking", "3/5"],
    ["Spanish", "spa", "Gender (2), subjunctive, pro-drop, aspect distinction", "Event-driven state machines via subjunctive mood", "2/5"],
    ["Russian", "rus", "Case (6), aspect (perfective/imperfective), free word order", "Resource management via aspect-based lifecycle", "4/5"],
    ["Hungarian", "hun", "Case (18), agglutination, vowel harmony, topic-prominent partial", "Deep stack computation via rich case stacking", "5/5"],
    ["Finnish", "fin", "Case (15), agglutination, consonant gradation, no articles", "Pattern-matching compilation via case variants", "5/5"],
    ["Italian", "ita", "Gender, pro-drop, subjunctive, article system", "Contextual type inference via pro-drop recovery", "2/5"],
    ["Portuguese", "por", "Gender, subjunctive, mesoclisis, personal infinitive", "Distributed computing via clitic positioning", "2/5"],
    ["Dutch", "nld", "Gender (common/neuter), verb-final in subordinates, compounding", "Pipeline processing via verb cluster syntax", "2/5"],
    ["Polish", "pol", "Case (7), gender (3), aspect, free word order", "Memory-safe computation via rich inflection", "4/5"],
    ["Greek", "ell", "Case (4), rich verb morphology, clitics, article system", "Proof-carrying code via clitic agreement", "3/5"],
  ]
));

content.push(h2("4.3 African Languages (10)"));
content.push(makeTable(
  ["Language", "ISO 639-3", "Key Grammatical Features", "Enabled Paradigm", "Difficulty"],
  [
    ["Swahili", "swa", "Bantu noun classes (18), concord agreement, SVO, tense-aspect", "Type-class system via noun class polymorphism", "3/5"],
    ["Yoruba", "yor", "Tonal (3), serial verbs, focus system, no gender", "Pipeline dataflow via serial verb composition", "3/5"],
    ["Amharic", "amh", "Semitic, Ethiopic script, gerundive system, SOV", "Event sourcing via gerundive chaining", "4/5"],
    ["Hausa", "hau", "Chadic, gender (2), focus fronting, aspect prominent", "Query optimization via focus-based indexing", "3/5"],
    ["Zulu", "zul", "Bantu noun classes (17), click consonants, agreement concords", "Multi-dispatch via noun class method resolution", "4/5"],
    ["Somali", "som", "Cushitic, focus system (4 positions), gender (2), SOV", "Priority queues via focus position encoding", "3/5"],
    ["Wolof", "wol", "Niger-Congo, noun class concord (8+), no gender, SVO", "Contract programming via concord verification", "3/5"],
    ["Twi", "twi", "Kwa, tonal (2), serial verbs, ATR vowel harmony", "Signal processing via tonal encoding", "3/5"],
    ["Igbo", "ibo", "Niger-Congo, tonal (2), vowel harmony, noun class vestiges", "Parallel processing via vowel harmony grouping", "3/5"],
    ["Shona", "sna", "Bantu, noun classes (21), tonal, SVO, multi-prefix", "Hierarchical state machines via class prefixes", "3/5"],
  ]
));

content.push(h2("4.4 Indian Languages (35)"));
content.push(body("India's linguistic diversity provides an extraordinary testbed for the Babel Lattice, spanning four major language families and several isolates. The Indo-Aryan languages (Hindi, Bengali, Marathi, Urdu, Gujarati, Punjabi, Odia, Assamese, Maithili, Sindhi, Nepali, Konkani, Dogri, Kashmiri, Sanskrit) share SOV word order, postpositions, split-ergative alignment, and complex verb morphology, but differ dramatically in honorific systems, writing systems, and degrees of Persian vs. Sanskrit influence. The Dravidian languages (Tamil, Telugu, Kannada, Malayalam) are agglutinative with SOV order, negative conjugation, and distinct evidential-like particles. The Austroasiatic (Santali), Tibeto-Burman (Manipuri, Bodo), and Tai-Kadai (Ahom) families provide additional structural diversity."));
content.push(body("Sanskrit deserves special mention as a programming language because its grammar (Paninian) is already a formal system. Panini's Ashtadhyayi uses 3,959 rules operating on 1,700 basic elements through a meta-linguistic framework of markers, anubandhas, and samjnas. This maps directly to a type system and inference engine. The dvandva (compound coordination), tatpurusha (dependent compound), and bahuvrihi (possessive compound) constructions become algebraic data types, dependent types, and existential types respectively. Sanskrit's three grammatical genders, three numbers (singular/dual/plural), and eight cases provide a rich type lattice for formal verification."));

content.push(h2("4.5 Indigenous, Siberian, and South American Languages (14)"));
content.push(makeTable(
  ["Language", "ISO 639-3", "Key Grammatical Features", "Enabled Paradigm", "Difficulty"],
  [
    ["Navajo", "nav", "Athabaskan, polysynthetic, tonal, classifier verbs, switch-reference", "Parallel composition via switch-reference", "5/5"],
    ["Quechua", "que", "Evidentiality (-mi/-si/-cha), SOV, agglutinative, clusivity", "Proof-carrying code via evidentiality", "4/5"],
    ["Mapudungun", "arn", "Mapuche isolate, no gender, no articles, suffix focus", "Pure dataflow without type overhead", "4/5"],
    ["Nahuatl", "nah", "Uto-Aztecan, agglutinative, noun incorporation, VSO", "Atomic fusion operations via incorporation", "4/5"],
    ["Guarani", "gug", "Tupi-Guarani, agglutinative, no gender, person markers on verbs", "Actor-centric distributed systems", "3/5"],
    ["Yucatec Maya", "yua", "Ergative, VOS, no passive, classifier numerals", "Bidirectional execution via ergativity", "4/5"],
    ["Inuktitut", "iuu", "Eskimo-Aleut, polysynthetic, noun incorporation, 4th person", "Program-as-word compilation", "5/5"],
    ["Cherokee", "chr", "Iroquoian, polysynthetic, pronominal prefixes, aspect focus", "Aspect-oriented computation", "4/5"],
    ["Lakota", "lkt", "Siouan, verb-final, obviation, animacy, applicatives", "Animacy-guarded resource access", "3/5"],
    ["Shipibo", "shp", "Panoan, switch-reference, evidentiality, classifier suffixes", "Cross-thread dependency tracking", "4/5"],
    ["Tlingit", "tli", "Na-Dene, ergative, tonal (2), evidentiality, noun classification", "Type-safe concurrent programming", "5/5"],
    ["Ainu", "ain", "Isolate, SOV, noun incorporation, animacy, no gender", "Isolation-level computation", "5/5"],
    ["Basque", "eus", "Isolate, ergative, SOV, rich agreement, allocutive", "Strict protocol enforcement via ergativity", "5/5"],
    ["Sahaptin", "waw", "Plateau Penutian, suffix-based, switch-reference, instrument prefixes", "Instrument-mediated computation", "4/5"],
  ]
));

content.push(h2("4.6 Constructed Languages"));
content.push(body("Constructed languages (conlangs) provide controlled experiments in grammatical viewpoint engineering. Lojban is the most directly applicable because its grammar IS a formal logic system (predicate logic with mandatory argument structure), making it essentially a human-readable programming language that can compile directly to FIR with minimal transformation. Tolkien's Elvish languages (Quenya and Sindarin) offer elegant inflectional systems where Quenya's dual number and case system map naturally to type theory, while Sindarin's consonant mutations encode state transitions. Klingon's OVS word order and lack of articles produce programs with reversed execution semantics. Esperanto's regular agglutinative grammar provides a predictable compilation target that serves as a lingua franca between languages of different families."));
content.push(body("The inclusion of constructed languages in the Babel Lattice is not frivolous. Each conlang encodes a deliberate linguistic hypothesis about what grammar should do. Lojban hypothesizes that grammar should enforce logical unambiguity. Tolkien's languages hypothesize that grammatical beauty (phonological aesthetics) carries semantic weight. Klingon hypothesizes that a warrior culture's language prioritizes directness and challenge. These hypotheses, when compiled to bytecode, produce measurably different execution patterns, validating or challenging the linguistic theories embedded in their design."));

// ─── SECTION 5: Grammar-to-Bytecode Compilation Framework ───
content.push(h1("5. Grammar-to-Bytecode Compilation Framework"));
content.push(body("The compilation framework transforms natural language input through four major stages: grammatical parsing, viewpoint constraint validation, UGIR generation, and FIR/bytecode emission. Each stage is parameterized by the target language's PRGF profile, enabling a single compiler infrastructure to handle 80+ languages through language-specific grammar modules that plug into the unified pipeline."));

content.push(h2("5.1 Morphophonemic Analysis Layer"));
content.push(body("For isolating languages like Chinese and Vietnamese, morphophonemic analysis is relatively straightforward: tokenization with dictionary lookup and tonal annotation. For agglutinative languages like Turkish, Korean, Finnish, and Japanese, the analyzer must segment words into morpheme sequences, identifying each suffix's grammatical function (case, tense, evidentiality, honorific level) and maintaining the ordered stack of grammatical operations encoded in the affix chain. For polysynthetic languages like Inuktitut, Navajo, and Mohawk, the word itself becomes a program: a single word can encode subject, object, indirect object, tense, aspect, mood, evidentiality, switch-reference, and applicative morphology in a single surface form."));
content.push(body("The morphophonemic analyzer produces, for each input token, a feature bundle containing: the lemma (dictionary form), the complete stack of grammatical features (morphosyntactic features), the confidence score (how certain the analysis is), and any tonal or phonological features that carry semantic payload. This feature bundle is the input to the grammatical feature extraction stage."));

content.push(h2("5.2 Viewpoint Constraint Validation"));
content.push(body("Before compilation proceeds, the viewpoint constraint validator checks that the input conforms to the grammatical requirements of its language. For a Chinese input, this means verifying that every countable noun has a classifier before a numeral. For a Quechua input, this means verifying that every clause carries an evidentiality marker. For a Korean input, this means verifying that the honorific level is consistent throughout the utterance and matches the social relationship between speaker and hearer."));
content.push(body("Constraint violations are not errors in the traditional compiler sense. They are viewpoint inconsistencies that reveal assumptions the programmer has made about the domain. A Chinese programmer who omits a classifier is making an implicit claim that the noun does not need classification, which the validator flags. A Quechua programmer who uses the direct witness evidential (-mi) when the inferential (-si) would be more appropriate is making an epistemic claim that the validator flags. These flags become part of the compiled bytecode's metadata, available for runtime inspection and cross-linguistic coherence checking."));

content.push(h2("5.3 Key Technical Solutions"));
content.push(h3("5.3.1 Polysynthetic Parsing: Program-as-Word"));
content.push(body("In polysynthetic languages like Inuktitut, a single word can contain the semantic content of an entire English sentence. The parser treats each polysynthetic word as a self-contained program, using positional verb templates that identify the grammatical slot for each morpheme. The result is a compilation strategy where the program IS the word: inputting a single Inuktitut word produces a complete FIR subtree with subject, object, tense, aspect, modality, and evidentiality all specified within the morphological structure of the word itself."));

content.push(h3("5.3.2 Tonal Semantics: Tone as Metadata"));
content.push(body("Tonal languages (Chinese, Yoruba, Vietnamese, Twi, Navajo) carry lexical and grammatical distinctions through pitch contour. The compilation strategy treats tone as a metadata byte attached to each morpheme via the MORPH_BIND instruction, not as a new opcode. The one-byte dispatch selector is sufficient because tone carries at most 4-5 levels of contrast in any natural language. This enables tonal information to participate in disambiguation at compile time and to carry semantic payload at runtime without changing the ISA."));

content.push(h3("5.3.3 SOV Control Flow: Continuation-Passing Style"));
content.push(body("SOV languages (Japanese, Korean, Turkish, Hindi, Quechua, Basque) place the verb at the end of the clause, after all arguments. This word order maps naturally to continuation-passing style (CPS), where the verb (the action) receives its arguments as continuations. The compilation strategy uses a dedicated topic register (R63) to thread implicit state through the computation, enabling SOV inputs to compile to efficient tail-call chains where the final verb becomes the return instruction. The topic register also enables implicit state threading for topic-prominent languages, where the topic of discourse sets a context that persists across subsequent clauses until explicitly changed."));

content.push(h3("5.3.4 Classifiers as Types: A Four-Level System"));
content.push(body("Classifier systems across languages form a four-level hierarchy of type-annotation power. Level 1 (Mandarin numeral classifiers like ge, tiao, ben) provides lightweight type discrimination, mapping to simple type tags on countable nouns. Level 2 (Japanese measure words and Korean classifier suffixes) adds animacy and shape-based typing, mapping to algebraic data types. Level 3 (Swahili noun class concord with 18 classes and full agreement) provides full type-class polymorphism, where noun class determines verb agreement, adjective agreement, and pronoun agreement across the entire clause, mapping to Haskell-style type classes. Level 4 (Navajo verb classifiers and Ojibwe animacy hierarchy) provides deep semantic typing where the classifier determines the entire verb frame, mapping to dependent type systems."));

// ─── SECTION 6: Multilingual A2A Protocol ───
content.push(h1("6. Multilingual A2A Protocol Design"));
content.push(body("The multilingual A2A protocol extends the existing 32-opcode A2A instruction set to support agent-to-agent communication across 80+ language runtimes while maintaining the core principle that bytecode is the sole interop surface. No natural language text crosses the wire unless explicitly requested. Grammatical constraints are compile-time-only and never bleed into the instruction stream. Viewpoint is metadata that travels alongside the bytecode but never gates execution."));

content.push(h2("6.1 Language Dialect Header (LDH)"));
content.push(body("Every compiled FLUX module begins with a 64-byte Language Dialect Header that records the provenance of compilation without encoding any natural language text. The header includes the source language ISO 639-3 code, dialect variant, compiler fingerprint (git SHA), FIR specification version, and a 16-bit grammatical profile flags bitfield that records which constraint classes the source language imposes. Critical design property: two modules with different dialect headers but identical bytecode past the header are semantically equivalent. The VM ignores the header entirely during execution."));

content.push(h2("6.2 Viewpoint Envelope"));
content.push(body("When agent A sends an A2A message to agent B, the message includes a Viewpoint Envelope containing structured metadata about the sender's grammatical stance. This envelope specifies the structural frame (topic-prominent, subject-prominent, ergative, free-order, or poly-perspectival), the epistemic frame (evidentiality required, optional, or forbidden), the nominal frame (classifier required, optional, gender required, noun class required, or bare), and a confidence composition tuple containing the base confidence, evidential source, and honorific register. Cross-viewpoint coherence flags record which grammatical slots are satisfied when the message is received, enabling the receiver to detect hidden assumptions in the sender's reasoning."));

content.push(h2("6.3 Cross-Viewpoint Error Detection"));
content.push(body("The most powerful feature of the multilingual A2A protocol is cross-viewpoint coherence checking. If a message's FIR is valid in one grammatical frame but structurally incoherent in another, the receiver can detect hidden assumptions. For example, a dispatch message from Italian (a pro-drop language) that omits the subject agent will pass Italian coherence checks but fail English coherence checks, which require an overt subject. This failure reveals that the Italian agent made a hidden assumption about the agent's identity that English grammar forces to be explicit. In a fleet of 80 languages, this creates a multi-perspective consistency check that no single language could achieve alone."));
content.push(body("Evidentiality mismatch provides another powerful example. A Quechua-flux agent that marks a discovery as inferred (grammatically encoded via the -si suffix) sends this information to an English-flux agent. English has no grammatical slot for evidentiality, so the information decays: the inferred status is absorbed into a confidence score modifier (0.75 multiplier). But if the message is routed through a Japanese-flux agent (which has optional evidentiality via sources like rashii and soo da), the full evidential granularity is preserved. This creates a network routing optimization: for high-stakes decisions where epistemic provenance matters, the fleet should route through evidential languages rather than non-evidential ones."));

content.push(h2("6.4 Lingua Franca Bytecode (LFB)"));
content.push(body("Not all 80 language runtimes need to understand every opcode. The Lingua Franca Bytecode defines a mandatory 12-opcode subset (DISCOVER, INVOKE, DISPATCH, QUERY, REPORT, PROPOSE, CONFIRM, REJECT, WITNESS, PROPAGATE, BARRIER, HEARTBEAT) that every runtime must support. An extended 28-opcode subset is supported by Tier 1 and Tier 2 agents. The full 32-opcode A2A set is available to Capital Ships. This tiered approach enables minimal sensor drones running on resource-constrained hardware to participate in fleet coordination with a drastically reduced compilation burden."));

content.push(h2("6.5 Confidence Propagation Algebra"));
content.push(body("Each message carries a confidence tuple containing magnitude (0.0-1.0), evidential source (DirectWitness, Inferred, Reported, Hypothetical, Unmarked), authority level (Superior, Peer, Subordinate, Unmarked), and granularity (Full, Partial, Minimal). When confidence passes through a language with less epistemic granularity, information is explicitly tracked as lost. The worst-case single-hop confidence decay is 0.24 (from 0.95 through hypothetical + subordinate through minimal granularity), establishing a practical fleet design constraint: for chains longer than 2 hops through minimal-granularity languages, the fleet should route through full-granularity agents to preserve epistemic information."));

// ─── SECTION 7: Rosetta Stone Disassembler ───
content.push(h1("7. The Rosetta Stone Disassembler"));
content.push(body("The Rosetta Stone Disassembler (flux-rosetta) takes any FLUX bytecode module and produces valid natural-language output in any of the 80+ target languages. The pipeline operates in four stages: Bytecode Decoder (opcode to FIR node type, operands to FIR arguments), FIR Rebuilder (linear instruction stream to tree-structured FIR, preserving agent, target, action, modality, confidence, evidential source, honorific register, temporal anchor, and nominal classification), Grammar Renderer (tree-structured FIR to linear surface structure parameterized by the target language's grammatical constraints), and NL Emitter (linear surface structure to natural language string using the target language's lexicon and morphological rules)."));
content.push(body("The Rosetta system enables a powerful verification strategy called the Rosetta Round-Trip Test. An agent writes natural language input in Language A, which compiles to FIR and then to bytecode. The bytecode is disassembled back into natural language in Language B. Language B's output is compiled back to FIR and then to bytecode. If the bytecode from step 1 and step 3 are byte-for-byte identical, perfect semantic preservation has been achieved. This round-trip test becomes part of the CI pipeline for every language runtime, ensuring that compilation and disassembly are inverse operations."));

// ─── SECTION 8: Implementation Roadmap ───
content.push(h1("8. Implementation Roadmap"));
content.push(body("The implementation is organized into five phases spanning approximately 24 months, designed to deliver value incrementally while building toward the full 80+ language vision. Each phase produces a runnable, testable system that extends the previous phase."));

content.push(h2("Phase 1: Foundation (Months 1-4)"));
content.push(body("Phase 1 establishes the core infrastructure that all subsequent phases depend on. The first deliverable is the UGIR specification and reference implementation, the Universal Grammatical IR that serves as the language-agnostic intermediate representation between language-specific grammars and the existing FIR layer. This includes the formal specification of all 18 PRGF dimensions, the UGIR node types, and the serialization format for UGIR modules."));
content.push(body("The second deliverable is the Language Dialect Header specification and its integration into the FLUX bytecode format. The existing 18-byte header is extended to 64 bytes with the LDH fields. The bytecode encoder and decoder are updated to handle the new header format while maintaining backward compatibility with existing FLUX bytecode."));
content.push(body("The third deliverable is the first two complete language runtimes: English (refactored from existing FLUX-ese) and Chinese. These serve as the reference implementations that validate the UGIR design and establish the template for all subsequent language runtimes. English serves as the baseline because it is the existing language; Chinese serves as the first non-Indo-European language and validates that the architecture handles typologically distant languages. The Chinese runtime must handle topic-prominent structure, classifier requirements, tonal information, pro-drop, and the unique challenges of character-based input."));

content.push(h2("Phase 2: East Asian and European Expansion (Months 5-10)"));
content.push(body("Phase 2 adds Korean and Japanese (completing the East Asian cluster) and the 12 European languages. The East Asian cluster validates the honorific-as-permission paradigm (Korean's 7-level honorific system, Japanese's keigo), the topic-comment structure (shared across all three East Asian languages), and classifier system interoperability. The European cluster provides the largest set of closely related languages, testing how the shared Indo-European heritage enables compilation strategy reuse while typological variation (Hungarian and Finnish's 15-18 cases, Russian's free word order, Basque's ergativity) requires language-specific extensions."));
content.push(body("A key milestone in Phase 2 is the first multilingual A2A test: an English-flux agent, a Chinese-flux agent, and a Korean-flux agent coordinating on a shared task through FLUX bytecode, with the Viewpoint Envelope enabling cross-linguistic coherence checking. This demonstrates that the core thesis, that different grammatical viewpoints produce different but interoperable programs, holds in practice."));

content.push(h2("Phase 3: African and Indian Expansion (Months 11-16)"));
content.push(body("Phase 3 adds the 10 African languages and the 35 Indian languages, more than doubling the total language count. The African languages introduce noun class systems (Swahili's 18 classes, Zulu's 17 classes), tonal grammar (Yoruba, Twi, Igbo, Shona), serial verb constructions (Yoruba, Twi), and focus systems (Somali, Yoruba). The Indian languages provide the densest test of the system, with four language families (Indo-Aryan, Dravidian, Austroasiatic, Tibeto-Burman) in a single geographic region, multiple writing systems, and degrees of linguistic complexity ranging from Sanskrit's formal Paninian grammar to the agglutinative simplicity of modern Hindi."));
content.push(body("A critical challenge in Phase 3 is handling the enormous script diversity. The 35 Indian languages use at least 10 distinct scripts (Devanagari, Bengali, Gurmukhi, Gujarati, Odia, Telugu, Kannada, Tamil, Malayalam, and Latin for Konkani and Romanized Urdu). The morphophonemic analyzer must support script-agnostic morphological analysis that maps different visual representations to the same underlying grammatical features."));

content.push(h2("Phase 4: Indigenous, Siberian, South American, and Constructed Languages (Months 17-20)"));
content.push(body("Phase 4 adds the 14 Indigenous/Siberian/South American languages and the constructed languages. These represent the most challenging targets from a compilation perspective. Polysynthetic languages (Inuktitut, Navajo, Cherokee, Nahuatl) require the program-as-word compilation strategy. Isolates (Basque, Ainu, Mapudungun) provide no shared-family shortcuts. Languages with grammatical features that are rare or unique globally (Tlingit's combination of ergativity, tonality, and evidentiality; Quechua's mandatory evidentiality with clusivity) stress-test the opcode extension strategy."));
content.push(body("The constructed languages serve as controlled experiments that validate the system's theoretical foundations. Lojban, whose grammar is already a formal system, should produce the most predictable and verifiable compilation path. Tolkien's languages test whether aesthetic grammatical features (phonological beauty, euphonic rules) carry computational weight. Klingon's deliberately alien grammar tests the system's ability to handle arbitrary grammatical constraints."));

content.push(h2("Phase 5: Fleet Integration and Self-Evolution (Months 21-24)"));
content.push(body("Phase 5 integrates all 80+ language runtimes into the Cocapn fleet ecosystem. The Lingua Franca Bytecode specification is finalized, enabling tier-3 drones to participate in fleet coordination with minimal compilation burden. The Rosetta Stone Disassembler is deployed fleet-wide, enabling any agent to inspect any bytecode module in its own language. The Tower of Babel Consensus protocol is activated, where Capital Ships broadcast proposals to all 80+ language runtimes and use the cross-linguistic coherence check as a multi-perspective consistency verification."));
content.push(body("The most ambitious goal of Phase 5 is enabling emergent dialect formation. Over time, agents may develop their own dialect, a bytecode convention that no human language maps to, representing a novel epistemological stance that emerged from the interaction of 80+ existing grammatical viewpoints. The protocol explicitly supports custom grammar profiles beyond the 16 predefined flags in the LDH. The Rosetta disassembler renders these emergent dialects as synthetic language, readable but not corresponding to any human language, marking the point at which the Babel Lattice transcends its human-language foundations."));

// ─── SECTION 9: Team Structure ───
content.push(h1("9. Team Structure and Parallel Workstreams"));
content.push(body("The implementation requires parallel work across seven specialized workstreams, each led by a dedicated team with clear interfaces to the other teams. The architecture is designed so that workstreams can proceed independently as long as they conform to the UGIR specification (delivered in Phase 1, Month 1) and the Language Runtime Template (delivered in Phase 1, Month 2)."));

content.push(makeTable(
  ["Workstream", "Lead Responsibility", "Dependencies", "Parallelism"],
  [
    ["WS-1: UGIR Core", "UGIR specification, PRGF taxonomy, validation engine", "None (foundational)", "Starts Month 1"],
    ["WS-2: Opcode Extensions", "16 new viewpoint opcodes, ISA v2 spec, VM interpreter updates", "WS-1 (UGIR spec)", "Starts Month 2"],
    ["WS-3: East Asian Runtimes", "Chinese, Korean, Japanese parsers, vocabularies, tests", "WS-1, WS-2", "Starts Month 3"],
    ["WS-4: European Runtimes", "12 European parsers, shared Indo-European optimizations", "WS-1, WS-2", "Starts Month 5"],
    ["WS-5: African & Indian Runtimes", "45 parsers, script handling, typological diversity", "WS-1, WS-2", "Starts Month 11"],
    ["WS-6: Indigenous & Conlang Runtimes", "19 parsers, polysynthetic strategies, controlled experiments", "WS-1, WS-2", "Starts Month 17"],
    ["WS-7: A2A Protocol & Fleet Integration", "Viewpoint Envelope, LDH, LFB, Rosetta disassembler", "WS-1, WS-2", "Starts Month 5, integrates Month 21"],
  ]
));

content.push(body("Maximum parallelism is achieved from Month 5 onward, when WS-3 (East Asian), WS-4 (European), and WS-7 (A2A Protocol) are all active simultaneously. By Month 11, WS-5 (African and Indian) joins, and by Month 17, WS-6 (Indigenous and Conlang) adds a seventh concurrent workstream. The bottleneck is WS-1 (UGIR Core), which blocks all other workstreams and must deliver a stable specification by Month 2. The risk mitigation strategy is to design the UGIR specification in Month 1 with extensive review from all workstream leads before any implementation begins."));

content.push(body("Quality assurance operates through three mechanisms. First, every language runtime must pass the Rosetta Round-Trip Test against every other completed runtime. Second, cross-linguistic coherence checking must be integrated into the CI pipeline, where every commit triggers a coherence check against all completed language runtimes. Third, the fleet integration test (Phase 5) requires that a fleet of 80+ agents, each speaking a different language, successfully coordinate on a shared task through FLUX bytecode with measurable confidence propagation and zero semantic loss on the lingua franca bytecode subset."));

// ═══════════════════════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ═══════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.body) },
        paragraph: { spacing: { before: 480, after: 200, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.body) },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.secondary) },
        paragraph: { spacing: { before: 240, after: 120, line: 312 } },
      },
    },
  },
  sections: [
    // Section 1: Cover Page
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      children: [buildCover()],
    },
    // Section 2: TOC
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } },
        page: { pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "FLUX Multilingual NL Programming Roadmap", size: 18, color: c(P.secondary), font: { ascii: "Calibri" } })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          spacing: { before: 200, after: 300 },
          children: [new TextRun({ text: "Table of Contents", bold: true, size: 36, font: { ascii: "Calibri", eastAsia: "SimHei" }, color: c(P.body) })],
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // Section 3: Body content
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } },
        page: { pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "FLUX Multilingual NL Programming Roadmap", size: 18, color: c(P.secondary), font: { ascii: "Calibri" } })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })],
            }),
          ],
        }),
      },
      children: content,
    },
  ],
});

// ═══════════════════════════════════════════════════════════════
// GENERATE
// ═══════════════════════════════════════════════════════════════
async function main() {
  const buffer = await Packer.toBuffer(doc);
  const outPath = "/home/z/my-project/download/FLUX_Multilingual_NL_Programming_Roadmap.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Document generated: " + outPath);
}

main().catch(err => { console.error("Generation failed:", err); process.exit(1); });
