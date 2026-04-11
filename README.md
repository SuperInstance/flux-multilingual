# flux-multilingual

> **Babel Lattice** — Concept-first natural language programming runtimes for FLUX bytecode

The bytecode is the language. Every natural language is a *dialect* of that bytecode.

## What This Is

FLUX Multilingual extends [flux-runtime](https://github.com/SuperInstance/flux-runtime) with natural language programming support across 80+ human languages. Each language encodes unique epistemological assumptions in its grammatical structures — these constraints become computational primitives when compiled to FLUX bytecode.

## Core Thesis

> Language is the programming interface for agents. Every human language bakes in viewpoints and logic into its grammar, enabling different kinds of natural language programming. Human understanding can do extraordinary things through the constraints of viewpoint that can be compiled to bytecode or precisely interpreted.

## Ecosystem Repositories

### Language Runtimes (Concept-First Rebuilds)

Each runtime is designed **from the linguistic foundations of its target language**, NOT by translating English code:

| Repo | Language | Concept-First Innovation | Tests |
|------|----------|--------------------------|-------|
| [flux-runtime-zho](https://github.com/SuperInstance/flux-runtime-zho) | Chinese (中文) | 量词 (classifiers) as type system, topic-comment syntax, 零形回指 (zero anaphora) → topic register R63, FIR SSA builder, vocabulary tiling | 505+ |
| [flux-runtime-deu](https://github.com/SuperInstance/flux-runtime-deu) | German (Deutsch) | Kasus (4 cases) → capability access control, Trennverben (separable verbs) → 2-phase compilation, Geschlecht (gender) as type class | 670+ |
| [flux-runtime-kor](https://github.com/SuperInstance/flux-runtime-kor) | Korean (한국어) | SOV→CPS transformation, 경어 (honorifics) → CAP_REQUIRE opcodes, 조사 (particles) as scope operators, verb 활용 (conjugation) as function composition | 630+ |
| [flux-runtime-san](https://github.com/SuperInstance/flux-runtime-san) | Sanskrit (संस्कृतम्) | Aṣṭau-vibhakti (8 cases) → 8 scope levels, dhātu (verbal roots) as opcode generators, sandhi (phonological combination) as syntax, samāsa (compounds) as computation tiles | 600+ |
| [flux-runtime-wen](https://github.com/SuperInstance/flux-runtime-wen) | Classical Chinese (文言文) | 文境 (context stack) — same character = different opcode by domain, 易經 (I Ching) hexagram bytecode encoding, 詩詞 (poetry) as program layout, 平仄 (tonal pattern) as scheduling | 620+ |
| [flux-runtime-lat](https://github.com/SuperInstance/flux-runtime-lat) | Latin (Latina) | Tempus (6 tenses) → 6 execution modes (sync/iterative/lazy/cached/rollback/eventual), Modus (4 moods) as strategies, 5 declensions → 5 memory layouts | 410+ |

### Integration Layer

| Repo | Purpose | Key Feature |
|------|---------|-------------|
| [flux-a2a](https://github.com/SuperInstance/flux-a2a) | Agent-first-class JSON language | Branching, forking, co-iteration, confidence propagation, 35 opcodes, 7 merge strategies |
| [flux-envelope](https://github.com/SuperInstance/flux-envelope) | Cross-linguistic coherence | 50+ concept mappings across 7 languages, coherence checking, Lingua Franca 12-opcode subset, vocabulary bridge |

### Source & Philosophy

| Repo | Role |
|------|------|
| [flux-runtime](https://github.com/SuperInstance/flux-runtime) | Original bytecode VM (104 opcodes, 64 registers, zero deps) |
| [captains-log](https://github.com/SuperInstance/captains-log) | "Language is the programming interface for agents" — vocabulary IS the manual |
| [capitaine](https://github.com/Lucineer/capitaine) | 100+ agent fleet, git-as-nervous-system, confidence propagation |

## Architecture: The Babel Lattice

```
Natural Language Input (any of 80+ languages)
    │
    ▼
┌─────────────────────────────────────────┐
│ Language-Specific Concept Parser        │
│ - Grammatical features → PRGFs          │
│ - Language-native type systems           │
│ - Viewpoint constraint validation        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ FIR (Fluid Intermediate Representation)  │
│ - SSA IR with typed values               │
│ - A2A primitives as first-class nodes    │
│ - Language-specific SSA extensions       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ FLUX Bytecode (unified ISA)             │
│ - All languages → same bytecode          │
│ - Grammatical viewpoint stripped here    │
│ - Viewpoint envelope travels as metadata │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ FLUX VM (64-register Micro-VM)          │
│ - Identical execution regardless of      │
│   source language                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ A2A Signal Protocol (flux-a2a)          │
│ - JSON as universal AST                  │
│ - Branching / Forking / Co-iteration     │
│ - Multilingual agent communication       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Viewpoint Envelope (flux-envelope)       │
│ - Cross-linguistic coherence checking    │
│ - Universal vocabulary bridge            │
│ - Lingua Franca 12-opcode subset         │
└─────────────────────────────────────────┘
```

## How Each Language Becomes Code

### Chinese (中文) — 量词 as Type System
```
三只船加二只船       → 3 ships + 2 ships = 5 ships
   ↑   ↑  ↑           量词"只" infers type: countable objects
   量词验证             量词"只" infers type: countable objects
   类型推断: 船舶        Same 量词 = type-compatible ✓
```

### German (Deutsch) — Kasus as Access Control
```
den Wert laden     → Akkusativ → CAP_READWRITE required
   ↑                "den" forces accusative scope
des Besitzers      → Genitiv → CAP_TRANSFER required
   ↑                ownership transfer scope
```

### Korean (한국어) — SOV + Honorifics
```
레지스터 영에 5 대입하세요  → [CAP_REQUIRE: 해요체] MOVI R0, 5
   ↑                        Honorific level → capability check
   을/를 particle          Object marker → target register
```

### Sanskrit (संस्कृतम्) — Vibhakti as Scope
```
rāmam gacchati    → rāmaḥ (PRATHAMA/nominative) = public scope
                     gacchati (√gam) = JMP opcode
                     "goes to Rāma" = JMP R[rama]
```

### Classical Chinese (文言文) — Context-Domain Dispatch
```
算: 加 → IADD        (math domain)
儒: 加 → DISTRIBUTE   (confucian domain)
兵: 加 → ADVANCE      (military domain)
   Same character, different opcode by context
```

### Latin (Latina) — Tempus as Execution Mode
```
amo     → Praesens → synchronous execution
amabam  → Imperfectum → iterative execution
amabo   → Futurum → lazy/deferred execution
amavi   → Perfectum → cached result
```

## A2A Signal Protocol

The agent-first-class JSON language that enables:
- **Fluid language**: agents speak in any of the 6+ runtimes
- **Fluid execution**: scripts, compiled bytecode, and interpreted code coexist
- **Branching**: parallel execution paths with merge strategies
- **Forking**: spawn child agents with inherited state
- **Co-iteration**: multiple agents traverse the same program collaboratively
- **Confidence propagation**: results carry epistemic confidence scores

## Viewpoint Envelope

The cross-linguistic coherence layer that:
- Maps 50+ core concepts across all 7 language runtimes
- Checks semantic equivalence of programs written in different languages
- Provides the Lingua Franca 12-opcode mandatory subset
- Bridges vocabulary tiles across language boundaries

## 18 Programmatically Relevant Grammatical Features (PRGFs)

Five tiers of grammatical features that map to computational constructs:

1. **Structural**: Word order, topic prominence, serial verbs, noun incorporation
2. **Typological**: Nominal classification, animacy, ergativity, clusivity, valency
3. **Epistemic**: Evidentiality, mirativity, honorifics
4. **Discourse**: Switch-reference, definiteness, focus systems
5. **Morphological**: Morphological type, tone, directional encoding

## Target Languages (Full Roadmap)

| Family | Count | Status | Examples |
|--------|-------|--------|---------|
| East Asian | 3 | ✅ 3/3 (zho, kor, wen) | Chinese, Korean, Classical Chinese |
| European | 12 | ✅ 1/12 (deu, lat) | German, Latin, +10 pending |
| Ancient/Classical | 3 | ✅ 2/3 (san, lat, wen) | Sanskrit, Latin, Classical Chinese |
| African | 10 | 🔜 Planned | Swahili, Yoruba, Amharic, Zulu, Somali... |
| Indian | 35 | 🔜 Planned | Hindi, Bengali, Tamil, Telugu, Sanskrit (done)... |
| Indigenous/Siberian/South American | 14 | 🔜 Planned | Navajo, Quechua, Inuktitut, Basque... |
| Constructed | 6+ | 🔜 Planned | Quenya, Sindarin, Lojban, Klingon... |

## Connection to the Cocapn Ecosystem

Part of the [SuperInstance](https://github.com/SuperInstance) and [Lucineer](https://github.com/Lucineer) ecosystem:

- **[flux-runtime](https://github.com/SuperInstance/flux-runtime)** — The bytecode VM and compiler pipeline
- **[captains-log](https://github.com/SuperInstance/captains-log)** — The lighthouse keeper's operational memory
- **[capitaine](https://github.com/Lucineer/capitaine)** — The flagship vessel of the Lucineer fleet
- **[cocapn](https://github.com/Lucineer/cocapn)** — The agent runtime and fleet coordination layer

## Documents

- `docs/FLUX_Multilingual_NL_Programming_Roadmap.docx` — Full strategic architecture and implementation roadmap
- `docs/research-worklog.md` — Research log from 6 parallel agent studies

## License

MIT — same as flux-runtime
