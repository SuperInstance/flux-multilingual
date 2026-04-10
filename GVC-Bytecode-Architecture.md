# Grammatical Viewpoint Constraint → Bytecode Compilation Framework

## "The Babel Lattice": A High-Level Architecture for 80+ Natural Language Frontends to FLUX Bytecode

**Version:** 0.1-draft  
**Date:** 2025  
**Scope:** Blue-sky design grounded in typological linguistics + compiler engineering  
**Target Runtime:** FLUX VM (64-register, 104 opcodes, 6 encoding formats, ISA v1→v2)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Linguistic Feature Extraction Framework](#2-linguistic-feature-extraction-framework)
3. [Grammar-to-Opcode Mapping Strategy](#3-grammar-to-opcode-mapping-strategy)
4. [Vocabulary/Tiling System Architecture](#4-vocabularytiling-system-architecture)
5. [Compiler Pipeline Extensions](#5-compiler-pipeline-extensions)
6. [Key Technical Challenges](#6-key-technical-challenges)
7. [Cross-Language Interoperability](#7-cross-language-interoperability)
8. [Testing Strategy](#8-testing-strategy)
9. [Implementation Roadmap](#9-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 The Core Insight

FLUX compiles markdown → FIR → bytecode. The vocabulary/tiling system is the extensibility surface. Today it speaks English (FLUX-ese). Tomorrow it could speak any language — but not through translation. Through **grammatical structure itself**.

The thesis: **different grammatical systems encode different computational viewpoints**. SOV word order is a different control-flow strategy than SVO. Evidentiality markers are a built-in verification system. Honorifics are capability-based security. Classifier systems are type systems. These are not metaphors — they are structurally homologous.

> "Languages don't describe computation differently — they *are* different computations. We just haven't compiled them yet."

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NATURAL LANGUAGE INPUT                           │
│   (80+ languages, each with grammatical viewpoint constraints)       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 0: MORPHOPHONEMIC ANALYZER                                   │
│  Tokenize, morphological segmentation, tonal/sandhi resolution       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1: GRAMMATICAL FEATURE EXTRACTOR (GFE)                      │
│  Language-specific grammar model → GrammaticalFeatureSet             │
│  Output: {word_order, evidentiality, honorifics, classifiers,       │
│           switch_ref, polylayer, ergativity, animacy, ...}          │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 2: VIEWPOINT CONSTRAINT VALIDATOR (VCV)                      │
│  Validate input against language's grammatical viewpoint model       │
│  Reject or auto-correct violations before compilation                │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 3: UNIVERSAL GRAMMATICAL IR (UGIR)                           │
│  Language-independent intermediate representation                   │
│  Preserves viewpoint semantics in a compilable form                 │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 4: VIEWPOINT-AWARE TILE MATCHER                              │
│  Match UGIR against multilingual tile library                       │
│  Select tiles from: universal / family / language / domain layers    │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 5: FIR GENERATION (existing, extended)                       │
│  UGIR + tile selection → FIR (SSA IR) with grammatical annotations  │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 6: BYTECODE EMISSION (existing, extended)                    │
│  FIR + grammatical annotations → FLUX bytecode                     │
│  Grammar-driven opcode selection + parameterized opcodes            │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 7: VM EXECUTION (existing, extended)                         │
│  64-register FLUX VM with grammatical constraint runtime checks     │
│  Runtime viewpoint enforcement via guard opcodes                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Design Principles

1. **No Translation Layer** — Each language compiles directly to bytecode through its own grammatical viewpoint. We never go "through English."
2. **Structural Homology** — Map grammatical structures to computational structures that share the same abstract shape.
3. **Zero New VM Dependencies** — Extend the existing FLUX VM; do not fork the runtime.
4. **Composability** — Any language's compiled bytecode can interoperate with any other's.
5. **Graceful Degradation** — If a grammatical feature has no bytecode analog, it becomes metadata (not an error).

---

## 2. Linguistic Feature Extraction Framework

### 2.1 Taxonomy of Programmatically Relevant Grammatical Features (PRGF)

We define a PRGF as any grammatical feature that, when removed from a language, changes the set of computations that can be *naturally expressed* in that language. We identify **18 core PRGF dimensions** organized into 5 tiers.

#### Tier 1: Structural — features that determine how computation is ordered

| # | Feature | Programmatically Relevant Aspect | Example Languages | Computation Analog |
|---|---------|---------------------------------|-------------------|-------------------|
| S1 | **Word Order** (SVO/SOV/VSO/VOS/OVS/OSV) | Argument evaluation order, control-flow direction | English (SVO), Japanese (SOV), Arabic (VSO), Malagasy (VOS), Hixkaryana (OVS), Warao (OSV) | Pipeline ordering, dataflow direction, continuation-passing style |
| S2 | **Head Directionality** (head-initial vs. head-final) | Where the "operation" appears relative to its "arguments" | English/French (head-initial), Japanese/Korean (head-final) | Prefix vs. postfix notation, call-by-name vs. call-by-value |
| S3 | **Topic-Prominence** | Scope management, context threading, implicit parameter passing | Chinese, Japanese, Korean, Malay, Tagalog | Dynamic scoping, monadic context, implicit state threading |
| S4 | **Serial Verb Constructions (SVC)** | Function composition, pipeline chaining, fluent interfaces | Yoruba, Mandarin, Ewe, Thai, Vietnamese | Function composition operators, pipe chains, method cascades |
| S5 | **Noun Incorporation** | Inline expansion, macro systems, partial evaluation | Mohawk, Inuktitut, Cherokee, many polysynthetic | Macro expansion, inlining, partial evaluation |

#### Tier 2: Typological — features that constrain the type system

| # | Feature | Programmatically Relevant Aspect | Example Languages | Computation Analog |
|---|---------|---------------------------------|-------------------|-------------------|
| T1 | **Nominal Classification** (noun classes/genders/classifiers) | Type systems, type hierarchies, interface dispatch | Bantu (18+ classes), German (3 genders), Mandarin (classifiers), Navajo (shape classifiers), Japanese (counter system) | Static type systems, trait dispatch, algebraic data types |
| T2 | **Animacy Hierarchy** | Resource lifecycle, garbage collection priority, ownership | Slavic languages, Algonquian, Navajo, Latin | Ownership systems, borrow checking, resource prioritization |
| T3 | **Ergativity** (split-ergative patterns) | Argument role assignment, pattern matching on clause type | Basque (full), Dyirbal (split), Hindi (split), Inuktitut | Pattern matching on input types, visitor dispatch, sum-type matching |
| T4 | **Clusivity** (inclusive vs. exclusive "we") | Set operations, boundary conditions, group membership | Malay/Tagalog (kami vs. kita), Tamil (nāṅaṉ vs. nām), Quechua, Mandarin (咱们 vs. 我们) | Set inclusion/exclusion, boundary conditions, group operations |
| T5 | **Valency** (causative/applicative/antipassive morphology) | Function arity manipulation, adapter patterns | Turkish, Swahili, Georgian, Inuktitut | Function arity changes, adapter patterns, partial application |

#### Tier 3: Epistemic — features that constrain trust and verification

| # | Feature | Programmatically Relevant Aspect | Example Languages | Computation Analog |
|---|---------|---------------------------------|-------------------|-------------------|
| E1 | **Evidentiality** (obligatory source marking) | Provenance tracking, trust verification, data lineage | Quechua, Turkish, Tibetan, Bulgarian, Wintu, many Amazonian | Assertion types, provenance tags, trust levels, verification guards |
| E2 | **Evidential Strength** (direct vs. reported vs. inferred) | Confidence levels, probability annotations, fuzzy logic | Turkish (-DI vs. -mIş), Cuzco Quechua (-mi vs. -si vs. -cha), Tibetan | Confidence scoring, probabilistic types, fuzzy predicates |
| E3 | **Mirativity** (unexpected information marking) | Exception handling, anomaly detection, assertion violations | Turkish (-DI_ş), Haremq (Kashmiri), Tariana | Exception triggers, invariant assertions, anomaly detection |
| E4 | **Honorifics/Politeness** | Capability systems, permission layers, access control | Korean (7+ speech levels), Japanese (keigo), Javanese (3+ registers) | Capability-based security, permission checks, role-based access |

#### Tier 4: Discourse — features that constrain information flow

| # | Feature | Programmatically Relevant Aspect | Example Languages | Computation Analog |
|---|---------|---------------------------------|-------------------|-------------------|
| D1 | **Switch-Reference** | Dependency tracking, coroutine linkage, flow correlation | Sub-Saharan African, many Native American, New Guinea | Coroutine state tracking, dataflow dependency, linear type flow |
| D2 | **Definiteness/Specificity** | Existential vs. universal quantification, lazy vs. eager evaluation | English (a/the), Spanish, Russian (no articles), Mandarin (demonstratives) | Quantification strategy, evaluation order, lazy/eager |
| D3 | **Focus/Contrastive Topic** | Variable highlighting, selective attention, attention mechanisms | Somali, Hungarian, Korean (clefting), Akan | Attention weights, feature importance, variable salience |
| D4 | **Temporal Encoding** | Temporal logic, timeline constraints, state machine triggers | Hopi (controversial), Mandarin (aspect not tense), Aymara (future-behind) | Temporal logic operators, state machine transitions, timeline constraints |

#### Tier 5: Morphological — features that constrain how programs are composed

| # | Feature | Programmatically Relevant Aspect | Example Languages | Computation Analog |
|---|---------|---------------------------------|-------------------|-------------------|
| M1 | **Morphological Type** (isolating → agglutinative → fusional → polysynthetic) | Granularity of atomic operations | Mandarin (isolating), Turkish (agglutinative), Russian (fusional), Mohawk (polysynthetic) | Instruction granularity, macro density, token count |
| M2 | **Tone** (lexical vs. grammatical tone) | Semantic payload in suprasegmental features | Mandarin (4 tones, lexical), Yoruba (3 tones, lexical+grammatical), Vietnamese (6 tones), Igbo | Extra encoding channels, semantic disambiguation, compact representation |
| M3 | **Directional Encoding** | Spatial computation, coordinate systems, orientation | Guugu Yimithirr (absolute cardinal directions), Tzeltal, Arrernte | Coordinate transforms, spatial indexing, absolute reference frames |
| M4 | **Sound Symbolism/Ideophones** | Pattern matching, onomatopoeic dispatch, sensory I/O | Japanese (giongo/gitaigo), Korean, many African languages | Audio dispatch, sensory I/O, multimodal pattern matching |

### 2.2 The GrammaticalFeatureSet (GFS) Data Structure

Each language is characterized by a `GrammaticalFeatureSet` — a typed feature vector that drives compilation strategy:

```python
@dataclass
class GrammaticalFeatureSet:
    """Complete grammatical profile of a language for compilation."""
    iso_code: str                    # e.g., "zho", "tur", "quz"
    name: str                        # e.g., "Mandarin Chinese"
    family: str                      # e.g., "Sino-Tibetan"
    
    # Tier 1: Structural
    word_order: WordOrder            # SVO | SOV | VSO | VOS | OVS | OSV | FREE
    head_direction: HeadDir          # HEAD_INITIAL | HEAD_FINAL | MIXED
    topic_prominent: bool
    serial_verb: bool
    noun_incorporation: bool
    
    # Tier 2: Typological
    nominal_classification: NomClass # NONE | GENDER | CLASSIFIER | NOUN_CLASS
    num_classes: int                 # e.g., 0 (none), 3 (German genders), 18 (Swahili)
    animacy_hierarchy: bool
    ergativity: ErgPattern           # NONE | FULL | SPLIT_S | SPLIT_T | SPLIT_DOB
    clusivity: bool
    valency_morphology: bool
    
    # Tier 3: Epistemic
    evidentiality: EvidSystem        # NONE | OBLIGATORY | OPTIONAL
    evidential_dimensions: int       # how many evidential categories
    mirativity: bool
    honorific_levels: int            # 0 = none, 7 = Korean-style
    
    # Tier 4: Discourse
    switch_reference: bool
    switch_ref_dimensions: int       # SS vs DS vs other
    definiteness: DefSystem          # ARTICLE | DEMONSTRATIVE | CLITIC | NONE
    focus_system: FocusType          # NONE | TOPIC_COMMENT | FOCUS_MARKER | CLEFT
    temporal_encoding: TempSystem    # TENSE | ASPECT | MIXED | TENSELESS
    
    # Tier 5: Morphological
    morphological_type: MorphType    # ISOLATING | AGGLUTINATIVE | FUSIONAL | POLYSYNTHETIC
    tone_system: ToneSystem          # NONE | LEXICAL | GRAMMATICAL
    num_tones: int
    directional_encoding: DirSystem  # NONE | ABSOLUTE | RELATIVE | INTRINSIC
    sound_symbolism: bool
    
    # Derived compilation hints (computed from above)
    compilation_strategy: CompilationStrategy  # computed
    opcode_preferences: list[OpcodeHint]        # computed
```

### 2.3 The 80-Language Matrix

Each language below is profiled against all 18 PRGF dimensions. The matrix is the input to the compilation strategy selector.

#### 2.3.1 East Asian (3 languages)

| Lang | ISO | Word Order | Nominal Class | Evidentiality | Honorifics | Morph Type | Tone | Key PRGF |
|------|-----|-----------|---------------|---------------|------------|------------|------|----------|
| Mandarin | `zho` | SVO | Classifier (14+) | None | Politeness particles | Isolating | Lexical (4) | Classifiers, tonal, topic-prom, SVC |
| Korean | `kor` | SOV | None (agglutination replaces) | None | 7+ levels | Agglutinative | None | Honorifics, SOV, topic-prom, split-S ergativity |
| Japanese | `jpn` | SOV | Counter system | None | Keigo (3 registers) | Agglutinative | Pitch accent | Honorifics, SOV, topic-prom, SVC |

#### 2.3.2 European (12 languages)

| Lang | ISO | Word Order | Nominal Class | Evidentiality | Honorifics | Morph Type | Tone | Key PRGF |
|------|-----|-----------|---------------|---------------|------------|------------|------|----------|
| English | `eng` | SVO | None | None | Register shift | Isolating/fusional | None | Baseline language |
| Spanish | `spa` | SVO (flexible) | Gender (2) | None | T-V distinction | Fusional | None | Gender system, clusivity (nosotros) |
| French | `fra` | SVO | Gender (2) | None | T-V | Fusional | None | Gender, clitics |
| German | `deu` | V2/SOV | Gender (3) | None | Formality (Sie) | Fusional | None | 3-gender, case system, V2 |
| Italian | `ita` | SVO | Gender (2) | None | T-V (Lei) | Fusional | None | Gender, clitic climbing |
| Portuguese | `por` | SVO | Gender (2) | None | T-V (o senhor) | Fusional | None | Gender, clusivity (nós/a gente) |
| Dutch | `nld` | SVO/V2 | Gender (2/de) | None | T-V (u) | Fusional | None | V2, gender collapse |
| Polish | `pol` | SVO (free) | Gender (3) | None | T-V (Pan/Pani) | Fusional | None | 3-gender + personal, case-rich, free word order |
| Russian | `rus` | SVO (free) | Gender (3) | None | T-V (Вы) | Fusional | None | 3-gender, case system, free order, animacy |
| Hungarian | `hun` | SVO (free) | None (16+ cases) | None | T-V (ön) | Agglutinative | None | Agglutination, 16+ cases, SOV tendency |
| Finnish | `fin` | SVO | None (15 cases) | None | T-V (te) | Agglutinative | None | Agglutination, 15 cases, clusivity (me/meidät) |
| Basque | `eus` | SOV | None | None | Formal register | Agglutinative | None | Ergative, SOV, agglutination, topic-prom |

#### 2.3.3 African (10 languages)

| Lang | ISO | Word Order | Nominal Class | Evidentiality | Switch-Ref | Morph Type | Tone | Key PRGF |
|------|-----|-----------|---------------|---------------|------------|------------|------|----------|
| Swahili | `swa` | SVO | Noun class (18) | None | — | Agglutinative | None | 18 noun classes, agglutination |
| Yoruba | `yor` | SVO | None | None | — | Isolating | Lexical (3) | Tone (grammatical), SVC |
| Igbo | `ibo` | SVO | Noun class (8) | None | — | Agglutinative | Lexical (3+2) | Tone (lexical+grammatical), noun classes |
| Amharic | `amh` | SOV | Gender (2) | None | — | Semitic/fusional | None | SOV, gender, complex derivation |
| Zulu | `zul` | SVO | Noun class (15+) | None | — | Agglutinative | Tone | Noun classes, concordial agreement |
| Wolof | `wol` | SVO | Noun class (8+) | None | — | Isolating | None | Noun classes, serial predicates |
| Hausa | `hau` | SOV | Gender (2) | None | — | Isolating/fusional | Tone (2) | Tone, SOV in Niger-Congo outlier |
| Somali | `som` | SOV | Gender (2) | None | Focus | Agglutinative | Tone | Focus system, SOV, tonal |
| Twi | `twi` | SVO | Noun class (5) | None | — | Agglutinative | Tone (2) | Tone, noun classes, Akan focus system |
| Malagasy | `mlg` | VOS | None | — | — | Isolating/agglutinative | None | VOS word order, topic-prominent |

#### 2.3.4 Indian (35 languages)

**Indo-Aryan (14):**

| Lang | ISO | Word Order | Nominal Class | Evidentiality | Split-Ergativity | Morph Type | Key PRGF |
|------|-----|-----------|---------------|---------------|------------------|------------|----------|
| Hindi | `hin` | SOV | Gender (2) | None | Split-S (perfective) | Fusional/agglutinative | Split ergativity, postpositions, SOV |
| Urdu | `urd` | SOV | Gender (2) | None | Split-S | Fusional/agglutinative | Same as Hindi + Arabic/Persian vocabulary layer |
| Bengali | `ben` | SOV | None (pronouns) | None | Split-S | Fusional | SOV, zero-copula, clusivity (āmrā vs. āmi) |
| Marathi | `mar` | SOV | Gender (3) | None | Split-S | Fusional/agglutinative | 3-gender, split ergativity |
| Gujarati | `guj` | SOV | Gender (3) | None | Split-S | Fusional/agglutinative | 3-gender, SOV |
| Punjabi | `pan` | SOV | Gender (2) | None | Split-S | Agglutinative | Tonal (2), split ergativity, clusivity |
| Sindhi | `snd` | SOV | Gender (2) | None | Split-S | Agglutinative | SOV, split ergativity |
| Odia | `ori` | SOV | Gender (3) | None | Split-S | Fusional | 3-gender, SOV |
| Assamese | `asm` | SOV | None | None | Weak | Fusional | SOV, zero-copula |
| Nepali | `nep` | SOV | Gender (2) | None | Split-S | Fusional | SOV, split ergativity, honorifics |
| Sanskrit | `san` | SOV (free) | Gender (3) | None | None | Fusional | 3-gender, 8 cases, free order, compounds |
| Kashmiri | `kas` | SOV | None | **Yes (evidential)** | Split-S | Fusional | **Evidentiality**, SOV, split ergativity |
| Maithili | `mai` | SOV | Gender (2) | None | Split-S | Fusional | SOV, split ergativity |
| Konkani | `kok` | SOV | Gender (3) | None | Split-S | Agglutinative/fusional | 3-gender, SOV |

**Dravidian (6):**

| Lang | ISO | Word Order | Nominal Class | Evidentiality | Clusivity | Morph Type | Key PRGF |
|------|-----|-----------|---------------|---------------|-----------|------------|----------|
| Tamil | `tam` | SOV | Gender (2 rational/irrational) | None | Yes (nāṅaṉ/nām) | Agglutinative | Clusivity, agglutination, SOV, animacy hierarchy |
| Telugu | `tel` | SOV | Gender (3 masc/fem/neuter) | None | Yes (mēmu/manamu) | Agglutinative | 3-gender, agglutination, SOV |
| Kannada | `kan` | SOV | Gender (3) | None | Yes (nāvu/navu) | Agglutinative | 3-gender, agglutination, SOV |
| Malayalam | `mal` | SOV | Gender (2) | None | Yes (ñaṅṅaḷ) | Agglutinative | Agglutination, SOV, clusivity |
| Tulu | `tcy` | SOV | Gender (3/4) | None | Yes | Agglutinative | 3-gender, agglutination |
| Kodava | `kfa` | SOV | Gender (2) | None | Yes | Agglutinative | Agglutination, SOV |

**Austroasiatic (3):**

| Lang | ISO | Word Order | Nominal Class | Morph Type | Key PRGF |
|------|-----|-----------|---------------|------------|----------|
| Santali | `sat` | SOV | Gender (2 animate/inanimate) | Agglutinative | Agglutination, SOV |
| Mundari | `unr` | SOV | Gender (2) | Agglutinative | Agglutination, SOV |
| Khasi | `kha` | SVO | None | Isolating | Isolating, SVO |

**Sino-Tibetan (3):**

| Lang | ISO | Word Order | Nominal Class | Tone | Morph Type | Key PRGF |
|------|-----|-----------|---------------|------|------------|----------|
| Manipuri (Meitei) | `mni` | SOV | Gender (2 animate/inanimate) | None | Agglutinative | SOV, agglutination |
| Bodo | `brx` | SOV | Classifier system | None | Agglutinative | Classifiers, agglutination |
| Tripuri (Kokborok) | `trp` | SOV | Classifier system | Tone (2) | Agglutinative | Classifiers, tone, agglutination |

**Others (9):**

| Lang | ISO | Word Order | Key PRGF | Notes |
|------|-----|-----------|----------|-------|
| Garo | `grt` | SOV | Agglutinative, Tibeto-Burman classifier system | |
| Ao Naga | `njo` | SOV | Agglutinative, evidentiality (reported speech) | |
| Kurukh | `kru` | SOV | Dravidian outlier, agglutinative | |
| Gondi | `gon` | SOV | Dravidian, agglutinative | |
| Bhili | `bhb` | SOV | Indo-Aryan, agglutinative tendencies | |
| Ho | `hoc` | SOV | Munda (Austroasiatic), agglutinative | |
| Sora | `srb` | SOV | Munda, agglutinative, complex verb morphology | |
| Dogri | `dgo` | SOV | Indo-Aryan, split ergativity | |
| Chhattisgarhi | `hne` | SOV | Indo-Aryan, SOV | |

#### 2.3.5 Indigenous/Siberian/South American (14 languages)

| Lang | ISO | Family | Word Order | Nominal Class | Evidentiality | Morph Type | Key PRGF |
|------|-----|--------|-----------|---------------|---------------|------------|----------|
| **Siberian** | | | | | | | |
| Evenki | `evn` | Tungusic | SOV | None | Yes (mediative) | Agglutinative | Evidentiality, SOV, animacy |
| Chukchi | `ckt` | Chukotko-Kamchatkan | SOV/S | None | Evidentiality | Polysynthetic | **Polysynthesis**, evidentiality, noun incorporation |
| Tlingit | `tli` | Na-Dene | SOV/Ergative | None | Evidentiality | Polysynthetic | Polysynthesis, tonal (2), evidentiality |
| **North American** | | | | | | | |
| Navajo | `nav` | Na-Dene | SOV | Shape classifiers | Evidentiality | Agglutinative/polysynthetic | **Classifiers** (shape), verb template, directional encoding |
| Mohawk | `moh` | Iroquoian | SOV | None | None | **Polysynthetic** | **Polysynthesis**, noun incorporation, optional arguments |
| Inuktitut | `iuu` | Eskimo-Aleut | SOV/Ergative | None | Evidentiality (indirect) | **Polysynthetic** | **Polysynthesis**, ergativity, evidentiality |
| Ojibwe | `ojb` | Algonquian | SOV | Animacy (2) | None | Polysynthetic | Animacy hierarchy, polysynthesis |
| **South American** | | | | | | | |
| Quechua | `quz` | Quechuan | SOV | None | **Yes (3 evidential)** | Agglutinative | **Evidentiality** (-mi, -si, -cha), SOV, clusivity |
| Aymara | `ayr` | Aymaran | SOV | None | **Yes (4 evidential)** | Agglutinative | **Evidentiality**, temporal encoding (future=behind), SOV |
| Guarani | `grn` | Tupi-Guarani | SVO | None | Evidentiality | Agglutinative | Evidentiality, active alignment |
| Yucatec Maya | `yua` | Mayan | VOS | None | Evidentiality | Agglutinative | Evidentiality, VOS, relational nouns |
| Mapudungun | `arn` | Araucanian | SOV | None | Evidentiality | Agglutinative | Evidentiality, SOV |
| Warlpiri | `wbp` | Pama-Nyungan | Free | None | None | Agglutinative | **Free word order** (non-configurational), ergative, switch-ref |
| **Australian** | | | | | | | |

#### 2.3.6 Constructed Languages (4 bonus)

| Lang | Word Order | Nominal Class | Evidentiality | Morph Type | Key PRGF |
|------|-----------|---------------|---------------|------------|----------|
| Esperanto | SVO | None (accusative) | None | Agglutinative | Designed agglutination, regular morphology |
| Lojban | SVO/flexible | None (logical) | None | Isolating | Logical precision, predicate logic structure |
| Toki Pona | SVO | None | None | Isolating | Minimal vocabulary (120 words), extreme composition |
| Klingon (tlhIngan Hol) | OVS | None | None | Agglutinative | OVS order, designed alien grammatical structure |

### 2.4 Feature Co-occurrence Patterns

Languages don't have random feature combinations. We identify **7 grammatical clusters** that drive compilation strategy:

```
Cluster 1: "South Asian Standard" (Hindi, Urdu, Marathi, Nepali, Kashmiri, Bengali, Punjabi)
  → SOV + split-ergativity + 2-gender + postpositions
  → Compilation: argument-reorder pass + ergativity-pattern-matching

Cluster 2: "Northeast Asian" (Korean, Japanese, Turkish, Mongolian, Evenki)
  → SOV + agglutination + honorifics + topic-prominence
  → Compilation: suffix-stack-VM + capability-layers + topic-thread

Cluster 3: "Bantu" (Swahili, Zulu, Xhosa, Shona, Lingala)
  → SVO + noun-class-agreement + agglutination
  → Compilation: noun-class → type-system + concord → type-inference

Cluster 4: "Evidential-Dominant" (Quechua, Aymara, Turkish, Tibetan, Kashmiri, Tlingit)
  → evidentiality markers + SOV + agglutination
  → Compilation: evidentiality → trust-verification opcodes + provenance

Cluster 5: "Polysynthetic" (Mohawk, Inuktitut, Chukchi, Navajo)
  → single-word sentences + noun incorporation + optional args
  → Compilation: word → program, morpheme → instruction, word-boundary → scope

Cluster 6: "Tonal-Isolating" (Mandarin, Yoruba, Vietnamese, Igbo, Twi)
  → minimal morphology + tone carries information + SVC
  → Compilation: tone → disambiguation channel + SVC → pipe-composition

Cluster 7: "Non-Configurational" (Warlpiri, Mohawk, many Australian)
  → free word order + null arguments + discontinuous constituents
  → Compilation: dependency-graph → dataflow-graph (word order is irrelevant)
```

---

## 3. Grammar-to-Opcode Mapping Strategy

### 3.1 Extension Philosophy

**Principle: Extend, don't explode.** Rather than 80×N new opcodes, we introduce:
- **16 new "grammatical viewpoint" opcodes** (extending from 104→120)
- **8 parameterized existing opcodes** (adding a `gram_mode` byte)
- **12 macro patterns** (sequences of existing opcodes invoked by grammatical features)

This gives us a controlled vocabulary of **36 new semantic units** that can express any of the 18 PRGF dimensions across 80+ languages.

### 3.2 New Grammatical Viewpoint Opcodes (0xA0–0xAF)

These opcodes occupy the gap between 0x84 (DEBUG_BREAK) and 0xFF. We allocate 16 new opcodes in the range 0xA0–0xAF.

```
┌──────────────────────────────────────────────────────────────────────┐
│  GRAMMATICAL VIEWPOINT OPCODES (0xA0-0xAF)                          │
│  Format: G (variable length) — opcode + len:u16 + data:len bytes    │
├────────┬─────────────────────────────────────────────────────────────┤
│ OPCODE │ NAME                │ BYTECODE MAPPING                     │
├────────┼─────────────────────────────────────────────────────────────┤
│ 0xA0   │ GVIEW_PUSH          │ Push grammatical viewpoint frame     │
│ 0xA1   │ GVIEW_POP           │ Pop grammatical viewpoint frame      │
│ 0xA2   │ CLASSIFY            │ Classify value into nominal class    │
│ 0xA3   │ VERIFY_EVIDENCE     │ Assert evidential source for value   │
│ 0xA4   │ CHECK_HONORIFIC     │ Enforce honorific/capability level   │
│ 0xA5   │ SWITCH_REF          │ Track subject reference continuity   │
│ 0xA6   │ SCOPE_TOPIC         │ Set topic/prominent scope variable   │
│ 0xA7   │ ANIMACY_GUARD       │ Guard operation by animacy hierarchy │
│ 0xA8   │ CLUSIVITY_SET       │ Define inclusive/exclusive set bound │
│ 0xA9   │ VALENCE_ADAPT       │ Modify function arity at runtime     │
│ 0xAA   │ DEFER_EVIDENCE      │ Mark value as deferred-provenance    │
│ 0xAB   │ DIRECTIONAL_ENC     │ Encode directional/spatial reference │
│ 0xAC   │ FOCUS_MARK          │ Mark value as discourse focus        │
│ 0xAD   │ TEMPORAL_MARK       │ Attach temporal/aspectual marker     │
│ 0xAE   │ MORPH_BIND          │ Bind morphological decomposition     │
│ 0xAF   │ CROSS_LANG_BIND     │ Bridge between language viewpoints   │
└────────┴─────────────────────────────────────────────────────────────┘
```

### 3.3 Detailed Opcode Specifications

#### 0xA0 GVIEW_PUSH — Push Grammatical Viewpoint Frame

```
Format G: [0xA0][len:u16][lang_code:3B][feature_flags:varB]

Pushes a new grammatical viewpoint frame onto the viewpoint stack.
All subsequent operations are interpreted through this lens until
GVIEW_POP restores the previous frame.

Data layout:
  [lang_code:3 bytes]  — ISO 639-2/3 code (e.g., "quz", "jpn")
  [feature_flags:N bytes] — Bitfield of active PRGF dimensions
  
Feature flag bits (1 byte per tier, 5 bytes total):
  Byte 0 (Structural): S1_word_order | S2_head_dir | S3_topic | S4_svc | S5_ni
  Byte 1 (Typological): T1_class | T2_animacy | T3_ergativity | T4_clusivity | T5_valency
  Byte 2 (Epistemic):   E1_evid | E2_evid_strength | E3_mirativity | E4_honorifics
  Byte 3 (Discourse):   D1_switch_ref | D2_definiteness | D3_focus | D4_temporal
  Byte 4 (Morphological): M1_morph_type | M2_tone | M3_directional | M4_sound_sym
```

**Compilation source:**
- Chinese topic-prominent sentence: "这个苹果，我不喜欢吃" ("this apple, I don't like eating")
  - `GVIEW_PUSH "zho" [S3_topic=1]`
  - `SCOPE_TOPIC R0` (this apple → topic frame)
  - `MOVI R1, 0` (don't like)
  - `GVIEW_POP`

- Quechua sentence with evidential: "Payam chayamullam" ("he just arrived" - direct)
  - `GVIEW_PUSH "quz" [E1_evid=1, E2_strength=direct]`
  - `VERIFY_EVIDENCE R0, EVID_DIRECT`
  - `GVIEW_POP`

#### 0xA2 CLASSIFY — Classify into Nominal Class

```
Format G: [0xA2][len:u16][reg:u8][class_id:u8][class_system:u8]

class_system encodes:
  0x01 = Bantu noun class (1-18)
  0x02 = German grammatical gender (1=masc, 2=fem, 3=neut)
  0x03 = Mandarin numeral classifier (shape-based)
  0x04 = Navajo shape classifier
  0x05 = Japanese counter (object type)
  0x06 = Dravidian rational/irrational
  0x07 = Animacy hierarchy level
  0xFF = Custom/user-defined class
```

**Compilation source:**
- Swahili: "Kitabu kikubwa" ("big book" — class 7/8 agreement)
  - `MOVI R0, book`
  - `CLASSIFY R0, 7, BANTU_CLASS` → type: NounClass<7>
  - `MOVI R1, big`
  - `CLASSIFY R1, 7, BANTU_CLASS` → concord agreement check
  
- Navajo: "Dibé bitsį́į́'í" ("sheep's wool" — using -'í classifier for round/compact)
  - `MOVI R0, sheep`
  - `MOVI R1, wool`
  - `CLASSIFY R1, 0x03, NAVAJO_SHAPE_CLASS` → round/compact classifier

**Bytecode-level semantics:** CLASSIFY emits a `CHECK_TYPE` (0x3B) with a grammatical type tag. At runtime, if the value's grammatical class doesn't match the expected class, a type fault is raised. This makes Swahili's noun-class concord system a **runtime type system**.

#### 0xA3 VERIFY_EVIDENCE — Evidential Source Assertion

```
Format G: [0xA3][len:u16][reg:u8][evid_type:u8][confidence:u8]

evid_type:
  0x01 = DIRECT (witnessed personally)
  0x02 = REPORTED (told by someone else)
  0x03 = INFERRED (deduced from evidence)
  0x04 = ASSUMED (general knowledge)
  0x05 = SENSORY (seen/heard/felt)
  0x06 = QUOTATIVE (exact quote)
  0x07 = HESITANT (uncertain)

confidence: 0-255 mapped to [0.0, 1.0]
```

**Compilation source:**
- Quechua: "Punillapi chayamun" ("he/she would have come (from the mountains)" — inferred)
  - `VERIFY_EVIDENCE R0, INFERRED, 180`
  
- Turkish: "Gelmiş" (he came — reported/inferred via -mIş)
  - `VERIFY_EVIDENCE R0, REPORTED, 160`

**Runtime behavior:** VERIFY_EVIDENCE checks a metadata slot on the value. If the value was produced by a computation marked with a higher confidence, the check passes silently. If the value's provenance doesn't match or is lower confidence, a warning (or error, depending on language's evidentiality strictness) is emitted.

This maps directly to FLUX's existing `VERIFY_OUTCOME` (0x6A) opcode but adds evidential semantics. In fact, VERIFY_EVIDENCE could be implemented as `VERIFY_OUTCOME` + a metadata check — demonstrating our extension philosophy.

#### 0xA4 CHECK_HONORIFIC — Enforce Capability Level

```
Format G: [0xA4][len:u16][reg:u8][honor_level:u8][context:u8]

honor_level:
  0x01-0x07 = Speech level (Korean: hasipsio-che to hae-che)
  0x10 = Casual (T-V distinction: T form)
  0x20 = Formal (T-V distinction: V form)
  0x30 = Very formal (uSTEM, Sie)
  0x40 = Keigo sonkeigo (respectful, Japanese)
  0x50 = Keigo kenjougo (humble, Japanese)

context:
  0x01 = Inter-agent communication
  0x02 = Agent-to-system
  0x03 = System-to-agent
  0x04 = System-to-system
```

**Compilation source:**
- Korean: 사용자에게 보고하십시오 (사용자 = user, honorific subject marker -가)
  - `CHECK_HONORIFIC R0, 0x07, INTER_AGENT` → check speech level
  
- Japanese: 社長にお伝えください (humble form of "tell" with 社長 = president)
  - `CHECK_HONORIFIC R0, 0x50, INTER_AGENT` → kenjougo level

**Runtime behavior:** CHECK_HONORIFIC maps to FLUX's existing `CAP_REQUIRE` (0x74). The honorific level becomes a capability token. An agent speaking to a superior must possess the `CAP_HONORIFIC_LEVEL_N` capability. This is not metaphorical — Korean speech levels *are* a capability system embedded in grammar.

#### 0xA5 SWITCH_REF — Track Subject Reference

```
Format G: [0xA5][len:u16][ref_type:u8][expected_subj:u8]

ref_type:
  0x01 = SS (same subject — current clause subject = previous)
  0x02 = DS (different subject — current clause subject ≠ previous)
  0x03 = OS (object switch)
  0x04 = UNKNOWN

expected_subj: register containing the expected subject value
```

**Compilation source:**
- Warlpiri: "Ngarrka-ngku ka wati-ngku nyuntu malangu" ("The man (DS) you are looking at him")
  - `SWITCH_REF DS, R_expected_subject` → verify subject changed
  
- Switch-reference languages use this for implicit subject control:
  - `SWITCH_REF SS` → "and then [same subject] did X"
  - `SWITCH_REF DS` → "and then [different subject] did Y"

**Runtime behavior:** SWITCH_REF emits a dependency-tracking annotation. When combined with FLUX's A2A opcodes, it enables:
- Automatic agent chaining: SS → same agent continues; DS → new agent takes over
- Dataflow analysis: SS clauses share state; DS clauses need explicit data passing

#### 0xA6 SCOPE_TOPIC — Set Topic Scope

```
Format G: [0xA6][len:u16][reg:u8][scope_mode:u8]

scope_mode:
  0x01 = TOPIC_ONLY (Chinese-style topic)
  0x02 = COMMENT_SCOPE (everything until next topic)
  0x03 = FRAME (explicit begin/end like Japanese wa)
  0x04 = CONTRASTIVE (topic is in contrast set)
```

**Compilation source:**
- Chinese: "关于预算，我们需要讨论三点" ("Regarding budget, we need to discuss three points")
  - `MOVI R0, budget`
  - `SCOPE_TOPIC R0, TOPIC_ONLY` → R0 becomes implicit first argument
  - `CALL discuss_points, [R0, 3]` → R0 passed implicitly

**Runtime behavior:** SCOPE_TOPIC creates an implicit argument binding for all subsequent instructions in the scope. It's analogous to an implicit `with` block or Haskell's implicit parameters. The topic value is stored in a dedicated "topic register" (R63, the highest register, reserved for this purpose).

### 3.4 Parameterized Existing Opcodes

Eight existing opcodes gain a **grammatical mode** flag when preceded by `GVIEW_PUSH`:

| Existing Opcode | Gram Mode | Triggered By | Modified Behavior |
|----------------|-----------|-------------|-------------------|
| `CHECK_TYPE` (0x3B) | 0x01 = noun-class-aware | Swahili, Zulu, Bantu | Checks nominal class concord, not just value type |
| `CHECK_BOUNDS` (0x3C) | 0x01 = animacy-bounded | Navajo, Ojibwe | Bounds check weighted by animacy hierarchy |
| `TRUST_CHECK` (0x70) | 0x01 = evidentiality-trust | Quechua, Turkish, Tibetan | Trust threshold set by evidentiality level |
| `CAP_REQUIRE` (0x74) | 0x01 = honorific-capability | Korean, Japanese, Javanese | Capability = honorific level |
| `BRANCH` (via JZ) | 0x01 = focus-driven-branch | Somali, Hungarian | Branch target selected by discourse focus |
| `CAST` (0x38) | 0x01 = class-cast | Classifier languages | Cast changes nominal class membership |
| `VERIFY_OUTCOME` (0x6A) | 0x01 = evidential-verify | Evidentiality languages | Verify includes provenance chain |
| `CMP` (0x2D) | 0x01 = clusivity-aware | Dravidian, Austronesian | Comparison respects set boundaries |

### 3.5 Macro Patterns — Grammatical Feature → Opcode Sequences

For features that don't warrant dedicated opcodes, we define **macro patterns** that expand into sequences of existing opcodes:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MACRO PATTERN: "ergativity_pattern"                                    │
│  Source: Split-ergative Hindi perfective clause                        │
│  "Ram ne roti khayi" (Ram ate bread — ergative alignment)              │
│  Expansion:                                                            │
│    GVIEW_PUSH "hin" [T3_ergativity=SPLIT_T]                            │
│    CLASSIFY R_ram, AGENT, SPLIT_ERG                                    │
│    CLASSIFY R_roti, PATIENT, SPLIT_ERG                                 │
│    ... (verb operations)                                                │
│    GVIEW_POP                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│  MACRO PATTERN: "noun_incorporation"                                    │
│  Source: Mohawk "sahonwanhotónkwahse" (he opened the door for her)     │
│  Expansion:                                                            │
│    GVIEW_PUSH "moh" [S5_ni=1]                                          │
│    MOVI R0, "door"  ; incorporated noun → first argument               │
│    MOVI R1, "her"   ; beneficiary → second argument                    │
│    CALL open, [R0, R1]                                                 │
│    GVIEW_POP                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│  MACRO PATTERN: "svc_chain"                                             │
│  Source: Yoruba "ó wá kí ó jé" (he came to greet her)                  │
│  Expansion:                                                            │
│    GVIEW_PUSH "yor" [S4_svc=1]                                         │
│    MOVI R0, he                                                         │
│    CALL came, [R0]                                                     │
│    ; SVC: result of "came" is implicit subject of "greet"              │
│    PUSH R_result                                                       │
│    CALL greet, [R_implicit_subject, her]                               │
│    GVIEW_POP                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│  MACRO PATTERN: "clusivity_exclusive"                                   │
│  Source: Tamil "nāṅaṉ" (we — excluding listener)                       │
│  Expansion:                                                            │
│    CLUSIVITY_SET R0, EXCLUSIVE                                          │
│    ; Subsequent set operations on R0 exclude the addressee             │
├─────────────────────────────────────────────────────────────────────────┤
│  MACRO PATTERN: "animacy_lifecycle"                                     │
│  Source: Navajo (higher animacy → different verb prefix)                │
│  Expansion:                                                            │
│    ANIMACY_GUARD R_subject, ANIMATE                                     │
│    ; If subject is animate, use animate verb template                  │
│    ; If inanimate, use inanimate verb template                         │
│    ; Maps to: ownership check + dispatch                               │
├─────────────────────────────────────────────────────────────────────────┤
│  MACRO PATTERN: "free_word_order"                                       │
│  Source: Warlpiri / Latin / Russian — any permutation of args          │
│  Expansion:                                                            │
│    ; Words arrive in any order; dependency parser produces             │
│    ; a role-labeled graph, not a linear sequence                       │
│    ; → CALL arguments are identified by role, not position            │
│    CALL verb, {agent: R_ram, patient: R_roti, locative: R_ghar}       │
│    ; Role-labeled call: order-independent argument passing             │
├─────────────────────────────────────────────────────────────────────────┤
│  MACRO PATTERN: "valency_causative"                                     │
│  Source: Turkish "yaz-dır-dı-m" (I caused to be written)               │
│  Expansion:                                                            │
│    VALENCE_ADAPT write, +1  ; increase arity by 1 (add causer)         │
│    CALL write, [R_causer, R_patient]                                   │
│    ; Write now takes 2 args instead of 1                               │
├─────────────────────────────────────────────────────────────────────────┤
│  MACRO PATTERN: "tonal_disambiguate"                                    │
│  Source: Mandarin "mā" (mother, tone 1) vs "mà" (to scold, tone 4)   │
│  Expansion:                                                            │
│    ; Tone is encoded as metadata byte on the value                     │
│    MOVI R0, "ma"                                                       │
│    ; Tone byte attached via MorphBind                                  │
│    MORPH_BIND R0, TONE=1  ; mother                                     │
│    ; dispatch table uses tone byte for disambiguation                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.6 Opcode Count Summary

| Category | Count | Details |
|----------|-------|---------|
| Existing FLUX opcodes | 104 | Core ISA, unchanged |
| New grammatical viewpoint opcodes | 16 | 0xA0–0xAF |
| Parameterized modes on existing opcodes | 8 | Via GVIEW context |
| Macro patterns (sequences) | 12 | Compiled away before emission |
| **Total semantic units** | **140** | 104 native + 36 grammatical |
| New encoding formats | 0 | All new opcodes use Format G |

---

## 4. Vocabulary/Tiling System Architecture

### 4.1 Current System Review

FLUX's vocabulary system works as follows:

```
Vocabulary file (.fluxvocab):
  pattern: "compute $a + $b"
  assembly: MOVI R0, ${a}; MOVI R1, ${b}; IADD R0, R0, R1; HALT
  
Tile levels:
  Level 0: Primitives (compute, load, store)
  Level 1: Compositions (average, percentage) — use Level 0 internally
  Level 2: Domain (is-normal, classify) — use Level 1
  Level N: Each level uses the previous

Compilation: regex match against patterns → assembly expansion → FIR → bytecode
```

### 4.2 Multilingual Vocabulary Architecture

We extend this to a **4-layer vocabulary lattice**:

```
┌───────────────────────────────────────────────────────────────┐
│  LAYER 3: DOMAIN VOCABULARY (language-independent concepts)   │
│  Examples: "steer heading $deg", "check depth $m"             │
│  Shared across ALL languages. Core FLUX-ese.                  │
│  File: domains/maritime.fluxvocab, domains/math.fluxvocab     │
├───────────────────────────────────────────────────────────────┤
│  LAYER 2: LANGUAGE-SPECIFIC VOCABULARY                        │
│  Examples: "計算 $a + $b" (zh), "계산 $a + $b" (ko)           │
│  Each language's surface forms for domain concepts.           │
│  File: langs/zh/vocab.fluxvocab, langs/ko/vocab.fluxvocab     │
├───────────────────────────────────────────────────────────────┤
│  LAYER 1: GRAMMATICAL FAMILY VOCABULARY                       │
│  Examples: "SOV-frame {agent} {patient} {verb}"              │
│  Shared patterns within language families.                    │
│  File: families/svo.fluxvocab, families/sov.fluxvocab         │
├───────────────────────────────────────────────────────────────┤
│  LAYER 0: UNIVERSAL GRAMMATICAL TILES                        │
│  Examples: "class_noun($x, class=$c)", "evidential($x, src)" │
│  The atomic operations that grammar maps to bytecode.         │
│  File: universal/grammatical_tiles.fluxvocab                  │
└───────────────────────────────────────────────────────────────┘
```

### 4.3 Tile Resolution Algorithm

When the compiler encounters a natural language input:

```
function resolve_tile(input: str, lang: GrammaticalFeatureSet) -> Tile:
    # Step 1: Try language-specific tile (Layer 2)
    tile = match(input, lang.vocabulary)
    if tile: return tile
    
    # Step 2: Try family-level tile (Layer 1)
    tile = match(input, lang.family.vocabulary)
    if tile: return tile
    
    # Step 3: Try grammatical decomposition (Layer 0)
    features = extract_features(input, lang)
    for feature in features:
        tile = match(feature, universal_tiles)
        if tile: return compose(tile, remaining_features)
    
    # Step 4: Fall back to domain vocabulary (Layer 3)
    # (only if input has domain-specific content)
    tile = match(input, domain_vocabulary)
    if tile: return tile
    
    # Step 5: Error — no tile found
    raise VocabularyError(input, lang)
```

### 4.4 Cross-Language Vocabulary Interoperability

The key challenge: Kannada-code compiled bytecode must be able to interoperate with Korean-code compiled bytecode.

**Solution: Universal Grammaticical IR (UGIR)**

Every tile resolves to a **UGIR node** — a language-independent intermediate representation that captures the grammatical viewpoint semantics:

```python
@dataclass
class UGIRNode:
    """Universal Grammaticatical IR node — language-independent."""
    op: str                    # e.g., "classify", "verify_evidence", "compose"
    args: list[UGIRValue]     # arguments with optional grammatical annotations
    grammatical_metadata: dict  # viewpoint constraints
    source_language: str      # for debugging
    source_form: str          # original natural language form
    
@dataclass
class UGIRValue:
    value: any                # the actual value
    nominal_class: Optional[int] = None
    evidential_source: Optional[EvidentialType] = None
    honorific_level: Optional[int] = None
    animacy_level: Optional[int] = None
    clusivity: Optional[ClusivityType] = None
    topic_scope: Optional[int] = None
```

**Interoperability invariant:** Any two UGIR nodes from different languages that resolve to the same `op` + `args` (ignoring `grammatical_metadata`) produce identical FIR. The grammatical metadata adds constraints but doesn't change the core computation.

**Example:**
- Hindi: "राम ने रोटी खाई" (Ram ate bread — ergative) → `UGIRNode("eat", [ram(AGENT), roti(PATIENT)], {ergativity=SPLIT_T})`
- English: "Ram ate bread" → `UGIRNode("eat", [ram(AGENT), roti(PATIENT)], {ergativity=NONE})`
- Both produce the same FIR `CALL eat, [R_ram, R_roti]`. The Hindi version additionally emits `GVIEW_PUSH "hin" [T3_ergativity=1]` and `GVIEW_POP`.

### 4.5 Domain-Specific vs. Language-Specific Layering

Vocabulary is **orthogonal** to grammatical structure:

```
                    ┌──────────────────────┐
                    │  DOMAIN: maritime    │  "steer heading 270"
                    │  DOMAIN: math        │  "compute 3 + 4"
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────┴──────┐ ┌──────┴────────┐ ┌─────┴──────────┐
     │  LANG: zh     │ │  LANG: ko     │ │  LANG: en      │
     │  把船头转270° │ │  선수를 270°로│ │  steer to 270° │
     │  (ba-constr.) │ │  돌리시오      │ │                │
     └───────────────┘ └───────────────┘ └────────────────┘
              │                │                │
     ┌────────┴──────┐ ┌──────┴────────┐ ┌─────┴──────────┐
     │  FAMILY:      │ │  FAMILY:      │ │  FAMILY:       │
     │  SVO+topic    │ │  SOV+honor    │ │  SVO           │
     │  +classifier  │ │  +agglut.     │ │  +isolating    │
     └───────────────┘ └───────────────┘ └────────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────┴───────────┐
                    │  UNIVERSAL TILES     │
                    │  classify, compose,  │
                    │  verify, scope       │
                    └──────────────────────┘
```

### 4.6 Vocabulary File Format Extension

```markdown
## language: zho (Mandarin Chinese)
## family: svo + topic-prominent + classifier
## version: 1.0

## tile: 把_转向_$heading_度
## pattern: 把 $obj 转向 $heading 度
## ugir: compose(orient($obj), set_heading($heading))
## assembly: MOVI R0, ${obj}; MOVI R1, ${heading}; CALL steer, [R0, R1]
## requires: [CLASSIFY ${obj}, NAV_CLASSIFIER]
## description: Turn the vessel to a new heading using ba-construction
## tags: maritime, navigation, classifier-trigger

## tile: 验证_来源_$data
## pattern: 验证 $data 的来源
## ugir: verify_evidence($data, REPORTED)
## assembly: GVIEW_PUSH "zho"; VERIFY_EVIDENCE ${data}, REPORTED, 128; GVIEW_POP
## description: Verify the source/provenance of data
## tags: provenance, evidentiality

## tile: 检查_水深_$meters
## pattern: 检查水深 $meters 米
## ugir: check_depth($meters)
## assembly: MOVI R0, ${meters}; CLASSIFY R0, MEASURE_CLASSIFIER; CALL check_depth, [R0]
## requires: [CLASSIFY $meters, MEASURE_CLASSIFIER]
## description: Check water depth in meters
## tags: maritime, depth, classifier-trigger
```

---

## 5. Compiler Pipeline Extensions

### 5.1 Extended Pipeline Architecture

The current FLUX pipeline is:
```
Source → Parser → FIR Builder → Bytecode Encoder → VM
```

The extended pipeline inserts grammatical analysis stages:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  NL Input (.fluxvocab, .ese, raw text)                             │
│  │                                                                  │
│  ▼                                                                  │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 0: LANGUAGE DETECTION                         │           │
│  │ Detect source language from:                         │           │
│  │   - File metadata (## language: xx)                  │           │
│  │   - Unicode script range detection                   │           │
│  │   - Script detection (CJK, Devanagari, Hangul, etc.) │           │
│  │   - N-gram based fallback                            │           │
│  │ Output: ISO code + GrammaticalFeatureSet             │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 1: MORPHOPHONEMIC ANALYSIS                    │           │
│  │ Language-dependent preprocessing:                    │           │
│  │   - Isolating: whitespace tokenization              │           │
│  │   - Agglutinative: morpheme boundary detection      │           │
│  │   - Polysynthetic: morpheme decomposition           │           │
│  │   - Tonal: tone sandhi resolution, tone annotation  │           │
│  │   - Fusional: lemma extraction + inflection parsing │           │
│  │ Output: List[Morpheme] with grammatical tags        │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 2: GRAMMATICAL FEATURE EXTRACTION (GFE)       │           │
│  │ Per-language grammar model applied to morphemes:     │           │
│  │   - Word order determination                         │           │
│  │   - Argument role assignment (agent/patient/etc.)   │           │
│  │   - Classifier matching                              │           │
│  │   - Evidentiality marker identification             │           │
│  │   - Honorific level extraction                      │           │
│  │   - Topic/focus identification                      │           │
│  │   - Switch-reference tracking                        │           │
│  │ Output: AnnotatedDependencyGraph                    │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 3: VIEWPOINT CONSTRAINT VALIDATION (VCV)      │           │
│  │ Validate input against language's grammatical rules: │           │
│  │   - Noun-class concord agreement                     │           │
│  │   - Evidentiality completeness                       │           │
│  │   - Honorific consistency                           │           │
│  │   - Switch-reference coherence                       │           │
│  │   - Classifier appropriateness                      │           │
│  │   - Word order acceptability                        │           │
│  │ On violation: ERROR or WARN (configurable)          │           │
│  │ Output: ValidatedDependencyGraph                   │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 4: UGIR GENERATION                            │           │
│  │ Convert validated dependency graph to UGIR:         │           │
│  │   - Each clause → UGIRNode                          │           │
│  │   - Grammatical features → metadata                  │           │
│  │   - Dependencies → UGIR edge list                    │           │
│  │ Output: UGIRModule                                  │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 5: TILE MATCHING + EXPANSION                  │           │
│  │ Match UGIR nodes against vocabulary tiles:           │           │
│  │   - Layer 2 (language-specific) first                │           │
│  │   - Layer 1 (family) fallback                        │           │
│  │   - Layer 0 (universal) fallback                    │           │
│  │   - Layer 3 (domain) for domain concepts            │           │
│  │ Unmatched nodes → macro expansion or error           │           │
│  │ Output: ExpandedUGIRModule                          │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 6: FIR GENERATION (EXTENDED)                  │           │
│  │ Convert expanded UGIR → FIR with grammatical annots:│           │
│  │   - UGIR ops → FIR instructions                     │           │
│  │   - Grammar metadata → FIR annotations              │           │
│  │   - Viewpoint frames → GVIEW_PUSH/GVIEW_POP pairs   │           │
│  │   - Classifiers → CHECK_TYPE instructions           │           │
│  │   - Evidentiality → VERIFY_EVIDENCE instructions    │           │
│  │ Output: FIRModule (extended)                        │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 7: BYTECODE EMISSION (EXTENDED)               │           │
│  │ Encode FIR → bytecode:                               │           │
│  │   - Existing instructions: unchanged encoding        │           │
│  │   - GVIEW_PUSH/POP: Format G                        │           │
│  │   - CLASSIFY: Format G → CHECK_TYPE at runtime       │           │
│  │   - Other grammatical opcodes: Format G              │           │
│  │   - Macro patterns: expanded to existing opcodes     │           │
│  │ Output: FLUX bytecode (bytes)                       │           │
│  └───────────────────────┬─────────────────────────────┘           │
│                          │                                          │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ STAGE 8: VM EXECUTION (EXTENDED)                    │           │
│  │ Execute bytecode with grammatical runtime support:   │           │
│  │   - Viewpoint stack: new runtime data structure     │           │
│  │   - Classifier tables: per-language class→type maps  │           │
│  │   - Evidentiality metadata: attached to values      │           │
│  │   - Honorific capability checks: via CAP_REQUIRE    │           │
│  │   - Topic register: R63 dedicated                   │           │
│  │ Output: Execution result                            │           │
│  └─────────────────────────────────────────────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Where Grammatical Constraints Get Enforced

Constraints are enforced at **three levels**:

| Level | What | When | How Strict |
|-------|------|------|-----------|
| **Compile-time** | Noun-class concord, classifier match, honorific consistency, word order | Stage 3 (VCV) | **Hard error** for obligatory features (Swahili concord, Korean honorifics) |
| **Link-time** | Cross-language type compatibility, evidentiality sufficiency | Between Stage 6 and 7 | **Warning** by default, configurable to error |
| **Runtime** | Evidentiality provenance, capability checks, animacy guards | Stage 8 (VM) | **Soft check** — can degrade to metadata if opcode not supported |

**Rule of thumb:**
- **Obligatory grammatical features** (must appear in every sentence in that language) → compile-time enforcement
- **Optional grammatical features** (speaker chooses to use or not) → runtime enforcement
- **Cross-language boundaries** → link-time warning

### 5.3 Validation Example

Input (Swahili): "Kijana amekula chakula" ("The young person has eaten food")

```
Stage 0: Language detection → swa (Swahili)
  GFS: {noun_class: NOUN_CLASS(18), word_order: SVO, morph_type: AGGLUTINATIVE}

Stage 1: Morphophonemic analysis
  Morphemes: [kijana(1)] [a-me-kula] [chakula(7)]
  Segments: noun(class=1) + verb(prefix=a, tense=me, root=kula) + noun(class=7)

Stage 2: GFE
  Word order: SVO ✓
  Subject agreement: "a-" prefix matches class 1 (kijana) ✓
  Object: chakula (class 7) — no explicit object agreement on this verb ✓

Stage 3: VCV
  Noun-class concord: subject prefix "a-" → class 1, subject "kijana" → class 1 ✓
  Verb tense: "me" → perfective, requires prior-action context ✓
  No violations found.

Stage 4: UGIR
  UGIRNode("eat", [
    UGIRValue(kijana, nominal_class=1, role=AGENT),
    UGIRValue(chakula, nominal_class=7, role=PATIENT)
  ], {
    tense: PERFECTIVE,
    noun_class_agreement: VERIFIED
  })

Stage 5: Tile matching → "eat" tile expanded

Stage 6: FIR
  GVIEW_PUSH "swa" [T1_class=NOUN_CLASS, S1_order=SVO]
  MOVI R0, kijana
  CLASSIFY R0, 1, BANTU_CLASS  ; compile-time type annotation
  MOVI R1, chakula
  CLASSIFY R1, 7, BANTU_CLASS
  CALL eat, [R0, R1]
  GVIEW_POP

Stage 7: Bytecode
  0xA0 [len] "swa" [flags: T1_class=1, S1_order=SVO]  ; GVIEW_PUSH
  0x2B R0, 0     ; MOVI R0, kijana (placeholder)
  0xA2 [len] R0, 1, 1  ; CLASSIFY R0, class=1, BANTU
  0x2B R1, 0     ; MOVI R1, chakula
  0xA2 [len] R1, 7, 1  ; CLASSIFY R1, class=7, BANTU
  0x07 R0, eat   ; CALL eat
  0xA1           ; GVIEW_POP
```

---

## 6. Key Technical Challenges

### 6.1 Parsing Agglutinative/Polysynthetic Languages

**The Problem:** In Turkish, a single word can be a complete sentence:
- "Yapabilmeyebilecekmişsinizcesine" = "as if you might not have been able to do"
- Morpheme chain: yap + abil + me + yeb + il + ec + eck + miş + siniz + ce + sin + e

In Mohawk, single-word sentences are normal:
- "Sahonwanhotónkwahse" = "I opened the door for her"
- The word contains: prefix+verb+incorporated_noun+suffix+beneficiary+aspect

**The Architecture Solution: Morpheme-Level Compilation**

```
┌─────────────────────────────────────────────────────────────────┐
│  LEVEL 1: Word-level compilation (for isolating/fusional langs) │
│  "compute 3 + 4" → MOVI R0, 3; MOVI R1, 4; IADD R0, R0, R1    │
├─────────────────────────────────────────────────────────────────┤
│  LEVEL 2: Morpheme-level compilation (agglutinative)            │
│  "yap" → base operation (do)                                     │
│  "-abil" → VALENCE_ADAPT +1 (capable)                           │
│  "-me" → ANIMACY_GUARD NEGATION (not)                           │
│  Each morpheme maps to an instruction or instruction modifier   │
├─────────────────────────────────────────────────────────────────┤
│  LEVEL 3: Program-as-word compilation (polysynthetic)            │
│  Entire word → a small program (function with 1-N instructions) │
│  Mohawk: sahonwanhotónkwahse →                                   │
│    FUNC open_door_for_her:                                       │
│      ARG door (incorporated)                                     │
│      ARG beneficiary (suffix)                                    │
│      VALENCE_ADAPT open, +1                                      │
│      CALL open, [caller, door, beneficiary]                      │
│    ENDFUNC                                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Morpheme-to-Instruction Mapping Strategy:**

For agglutinative languages, we build a **morpheme grammar** — a set of ordered suffix/prefix rules that define how morphemes combine:

```python
# Turkish morpheme grammar (simplified)
TURKISH_MORPHEME_GRAMMAR = {
    "verb_stem": {
        "order": 0,
        "maps_to": "CALL verb",
    },
    "-abil": {  # able to
        "order": 1,
        "requires": "verb_stem",
        "maps_to": "VALENCE_ADAPT +0; PUSH R_TRUE",  # capability modifier
    },
    "-me": {  # not
        "order": 2,
        "requires": "verb_stem",
        "maps_to": "INOT R_result",  # negate result
    },
    "-yor": {  # present continuous
        "order": 3,
        "requires": "verb_stem",
        "maps_to": "TEMPORAL_MARK ASPECT_CONTINUOUS",
    },
    "-di": {  # past tense
        "order": 3,
        "requires": "verb_stem",
        "maps_to": "TEMPORAL_MARK TENSE_PAST",
    },
    "-miş": {  # reported/inferred (EVIDENTIAL!)
        "order": 4,
        "requires": "verb_stem",
        "maps_to": "VERIFY_EVIDENCE REPORTED, 128",
    },
    "-siniz": {  # 2nd person plural
        "order": 5,
        "maps_to": "CHECK_HONORIFIC FORMAL",
    },
    # ... more morphemes
}
```

For polysynthetic languages, we define a **verb template** — a fixed positional structure where each position has a grammatical function:

```python
# Mohawk verb template (simplified)
MOHAWK_VERB_TEMPLATE = {
    # Position 0: Pre-pronominal prefixes (directional, reflexive)
    "pre_pronominal": {
        "maps_to": "DIRECTIONAL_ENC / ANIMACY_GUARD",
        "optional": True,
    },
    # Position 1: Subject pronominal prefix
    "subject_prefix": {
        "maps_to": "MOVI R_agent, <person_index>",
        "required": True,
    },
    # Position 2: Object pronominal prefix (if transitive)
    "object_prefix": {
        "maps_to": "MOVI R_patient, <person_index>",
        "optional": True,
    },
    # Position 3: Verb root
    "verb_root": {
        "maps_to": "CALL <verb_root>",
        "required": True,
    },
    # Position 4: Incorporated noun (THE KEY FEATURE)
    "incorporated_noun": {
        "maps_to": "MOVI R_incorp, <noun>; CLASSIFY R_incorp, <class>",
        "optional": True,
        # When present, the noun becomes the first argument of the verb
        "compilation_effect": "prepend_to_call_args(R_incorp)",
    },
    # Position 5: Post-root suffixes (aspect, mood)
    "aspect_suffix": {
        "maps_to": "TEMPORAL_MARK <aspect>",
        "optional": True,
    },
    # Position 6: Benefactive/applicative
    "benefactive": {
        "maps_to": "VALENCE_ADAPT +1; MOVI R_benefactive, <person>",
        "optional": True,
    },
}
```

### 6.2 Tonal Languages — Can Tone Carry Semantic Payload?

**The Problem:** Mandarin has 4 tones, Yoruba has 3, Vietnamese has 6. In some languages, tone is **grammatical** (changes meaning of grammatical markers), not just lexical.

**Examples:**
- Mandarin: 妈 (mā, tone 1) = "mother" vs. 骂 (mà, tone 4) = "to scold" — lexical
- Yoruba: "ó jó" (he ran) vs. "ó jọ́" (he was ashamed) — grammatical tone on verb
- Navajo: Tonal sandhi rules change tone contours in predictable ways

**The Architecture Solution: Tone as Metadata Channel**

Tone does NOT become a separate opcode. Instead, tone information is attached to values as **metadata bytes** using `MORPH_BIND` (0xAE):

```
At the tokenization level:
  "mā" → token {base: "ma", tone: 1}  → MOVI R0, "ma"; MORPH_BIND R0, TONE=1
  "mà" → token {base: "ma", tone: 4}  → MOVI R0, "ma"; MORPH_BIND R0, TONE=4

At the dispatch level:
  Dispatch table for "ma" uses tone byte to select:
    TONE=1 → "mother" → CLASSIFY R0, HUMAN_CLASS
    TONE=2 → "hemp"   → CLASSIFY R0, PLANT_CLASS
    TONE=3 → "horse"  → CLASSIFY R0, ANIMAL_CLASS
    TONE=4 → "scold"  → CALL scold

At the grammatical level (Yoruba):
  Verb "jọ" (low tone) = "meet"
  Verb "jọ́" (high tone) = "be ashamed" (grammatical change)
  → Tone byte selects different verb in dispatch table
  → This is essentially a **one-byte opcode extension** — tone becomes a selector
```

**Tone Sandhi Resolution:**

Tone sandhi (context-dependent tone changes) must be resolved before compilation:
- Mandarin 3rd tone sandhi: "nǐ hǎo" → [ní hǎo] (tone 3 → tone 2 before another 3)
- Resolution algorithm: apply language-specific sandhi rules at Stage 1 (morphophonemic analysis)
- Output: underlying tones (before sandhi) attached as metadata

**Compact Encoding Opportunity:**

In tonal languages, tone can **compress the instruction space**:
- Instead of: `MOVI R0, 5; MOVI R1, 3; IADD R0, R0, R1` (8 bytes)
- With tone: single syllable "sānjiā" (three-add, tones 1+1) → 4 bytes (base + tone metadata)
- This is speculative but demonstrates a potential **density advantage** of NL bytecode

### 6.3 SOV Topic-Prominent Languages — Word Order as Control Flow

**The Problem:** Chinese, Japanese, Korean are SOV (verb comes last) and topic-prominent (the topic comes first, setting context for everything that follows). How does this map to bytecode where operations are sequential?

**The Architecture Solution: Stack-Based Ordering + Topic Register**

```
Chinese: "关于预算（topic），我们需要讨论三点（comment）"
           "Regarding budget, we need to discuss three points"

Compilation:
  ;; Step 1: Topic establishes context
  MOVI R63, budget              ; R63 = dedicated topic register
  SCOPE_TOPIC R63, TOPIC_ONLY   ; Everything below implicitly uses R63
  
  ;; Step 2: Subject-agent
  MOVI R0, we
  
  ;; Step 3: Verb (SOV — verb last)
  CALL discuss, [R63, 3]        ; budget is passed implicitly from topic

Japanese: "象は鼻が長い" (Elephant topic, nose is long)
  Translation: "As for elephants, their noses are long"

Compilation:
  MOVI R63, elephant            ; topic = elephant
  SCOPE_TOPIC R63, FRAME        ; frame scope (Japanese wa)
  
  ;; Nested topic (ga marks new focus within wa scope)
  MOVI R1, nose                 ; new focus within topic scope
  FOCUS_MARK R1, FOCUS          ; nose is the focused element
  
  MOVI R2, long
  CALL is_long, [R1, R2]        ; nose is long (within elephant context)

Korean: "사용자가 시스템에 접근합니다" (user-nominative system-to approaches-formally)
  Honorific suffix -ㅂ니다 triggers CHECK_HONORIFIC
  
Compilation:
  GVIEW_PUSH "kor" [E4_honorific=FORMAL]
  MOVI R0, user                 ; agent
  CLASSIFY R0, AGENT            ; -가 marks agent
  MOVI R1, system               ; destination
  CHECK_HONORIFIC R0, 0x20, INTER_AGENT  ; -ㅂ니다 → formal level
  CALL access, [R0, R1]
  GVIEW_POP
```

**SOV as Continuation-Passing Style (CPS):**

SOV languages naturally map to a CPS-like evaluation order:
- Arguments (S, O) are pushed first
- Operation (V) is applied last
- This is literally how the VM register allocation works: load args into registers, then execute operation

```
English (SVO):  I(V→agent) eat(V→operation) food(V→patient)
Japanese (SOV): 私は(I) 食べ物を(food) 食べる(eat)
  → MOVI R0, I        ; load agent
  → MOVI R1, food     ; load patient
  → CALL eat, [R0, R1]; apply operation (verb last = CPS)
```

**Topic as Implicit State Thread:**

Topic-prominent languages give us a natural model for **implicit state passing** — the topic register (R63) acts like a Haskell implicit parameter or a React context:

```
# Without topic (English-style, explicit):
CALL analyze, [budget, quarter, trend]

# With topic (Chinese-style, implicit):
MOVI R63, budget
SCOPE_TOPIC R63, COMMENT_SCOPE
CALL analyze, [quarter, trend]  ; budget passed implicitly via R63
```

### 6.4 Classifier Languages — Noun Classifiers as Type Annotations

**The Problem:** Mandarin requires numeral classifiers: 一**只**猫 (one *classifier-animal* cat), 一**本**书 (one *classifier-flat* book). Swahili requires noun-class agreement throughout the sentence. Navajo requires shape classifiers on verbs. Can these become a type system?

**The Architecture Solution: Classifiers as Runtime Type Tags**

```
┌─────────────────────────────────────────────────────────────────┐
│  CLASSIFIER LEVELS                                              │
│                                                                 │
│  Level 1: NUMERAL CLASSIFIER (Mandarin, Japanese, Thai)        │
│  Usage: Before counting/measuring nouns                         │
│  Bytecode: CLASSIFY R_noun, class_id, NUM_CLASSIFIER           │
│  Maps to: CHECK_TYPE at runtime + dispatch selection           │
│  Examples:                                                     │
│    只 (zhī) → ANIMAL_CLASSIFIER → {cat, dog, bird}            │
│    本 (běn) → FLAT_OBJECT_CLASSIFIER → {book, magazine}       │
│    条 (tiáo) → LONG_FLEXIBLE_CLASSIFIER → {river, road, fish}  │
│                                                                 │
│  Level 2: NOUN CLASS / GENDER (Swahili, Zulu, German)          │
│  Usage: Agreement throughout clause (verbs, adjectives, etc.)  │
│  Bytecode: CLASSIFY R_noun, class_id, NOUN_CLASS              │
│  Maps to: Type system with concord checking                    │
│  Example (Swahili):                                            │
│    class 1/2 (persons) → agreement prefix "a-" / "wa-"        │
│    class 7/8 (objects) → agreement prefix "ki-" / "vi-"       │
│    Incompatible class + agreement prefix = COMPILE ERROR       │
│                                                                 │
│  Level 3: VERB CLASSIFIER (Navajo, Athabaskan)                 │
│  Usage: Verb prefix selects handling/shape class of object     │
│  Bytecode: CLASSIFY R_obj, class_id, SHAPE_CLASSIFIER          │
│  Maps to: Method dispatch by object shape                     │
│  Example (Navajo):                                             │
│    -'á → handling round object                                 │
│    -tée → handling long flexible object                        │
│    -łtól → handling flat object                                │
│    Verb "to throw" has different roots for each shape class    │
│                                                                 │
│  Level 4: ANIMACY HIERARCHY (Ojibwe, Russian, Latin)           │
│  Usage: Different verb agreement for animate vs inanimate      │
│  Bytecode: ANIMACY_GUARD R_subj, ANIMATE | INANIMATE          │
│  Maps to: Ownership/lifecycle tracking                         │
│  Example (Ojibwe):                                             │
│    Animate nouns → "he/she" verb prefix, can be agent          │
│    Inanimate nouns → "it" verb prefix, cannot initiate action  │
│    → ANIMACY_GUARD prevents inanimate objects from being agents│
└─────────────────────────────────────────────────────────────────┘
```

**Swahili Noun Class System as a Full Type System:**

```python
# Swahili noun class definitions
SWAHILI_CLASSES = {
    1: {"name": "M/Wa", "singular": "m-", "plural": "wa-", "semantic": "humans"},
    2: {"name": "M/Mi", "singular": "m-", "plural": "mi-", "semantic": "trees, natural phenomena"},
    3: {"name": "Ki/Vi", "singular": "ki-", "plural": "vi-", "semantic": "artifacts, languages"},
    7: {"name": "Ki/Vi", "singular": "ki-", "plural": "vi-", "semantic": "diminutives, tools"},
    9: {"name": "N/N", "singular": "N", "plural": "N", "semantic": "animals, loanwords"},
    # ... 18 classes total
}

# Compilation rule: concord must match class
# "Watoto wadogo wanalala" (Small children are sleeping)
# wadogo (small) must agree with watoto (children, class 1/2 plural → wa-)
# wanalala (are sleeping) must agree with watoto (class 1/2 plural → wa-)

# Bytecode:
GVIEW_PUSH "swa" [T1_class=NOUN_CLASS(18)]
MOVI R0, children
CLASSIFY R0, 2, BANTU_CLASS      ; class 2 (wa- prefix, persons plural)
MOVI R1, small
CLASSIFY R1, 2, BANTU_CLASS      ; concord: adjective matches class 2 ✓
MOVI R2, sleeping
CLASSIFY R2, 2, BANTU_CLASS      ; concord: verb matches class 2 ✓
CALL state, [R0, R1, R2]
GVIEW_POP
```

**Mandarin Classifier as Dispatch Selector:**

```python
# Mandarin classifier → verb/method selection
# "打一只猫" (hit one classifier-animal cat) vs "打一拳" (hit one-fist-punch)

# Without classifier: ambiguous "打" (hit/play/type...)
# With classifier: "打" context disambiguated

# Bytecode for "打一只猫":
GVIEW_PUSH "zho" [T1_class=NUM_CLASSIFIER, S1_order=SVO]
MOVI R0, cat
CLASSIFY R0, 0x0A, NUM_CLASSIFIER  ; 只 → ANIMAL_CLASSIFIER
MOVI R1, hit
; Dispatch table selects "hit_physical" based on classifier ANIMAL
CALL hit_physical, [R1, R0]
GVIEW_POP

# Bytecode for "打字" (type characters):
MOVI R0, characters
CLASSIFY R0, 0x1F, NUM_CLASSIFIER  ; implicit classifier for activity
CALL type_text, [R0]
```

### 6.5 Free Word Order Languages — Dependency Graph Compilation

**The Problem:** Warlpiri, Latin, Russian, Sanskrit allow (virtually) any word order. "Ram ate bread" can be:
- Warlpiri: "kurdu-jarra-rlu ka ngaju maliki wajilypi-nyanyi" (any order permutation is grammatical)
- Latin: "Rāma rotī" vs "rotī Rāma" vs "rotam Rāma" (case marks roles, not order)
- Russian: "Рам ел хлеб" vs "Хлеб ел Рам" vs "Ел Рам хлеб" (case + animacy resolves)

**The Architecture Solution: Role-Labeled Calls**

```python
# Instead of positional arguments:
#   CALL eat, [R_ram, R_roti]  ← order matters

# Use role-labeled arguments (like Python kwargs):
#   CALL eat, {agent: R_ram, patient: R_roti}  ← order doesn't matter

# Bytecode encoding (Format G):
# CALL_EAT [num_args:u8] [arg_name_len:u8] [arg_name:bytes] [reg:u8] ...

# Warlpiri "kurdu-jarra-rlu ka ngaju maliki wajilypi-nyanyi"
# (child-ERGATIVE PRESENT I-NOMINATIVE meat-ACCORPORATED bite-NONPAST)
# Word order could be ANY permutation — role is in morphology, not position

# Compilation:
GVIEW_PUSH "wbp" [S1_order=FREE, T3_ergativity=FULL]
; Arguments arrive in whatever order — dependency parser assigns roles
MOVI R0, child      ; kurdu
MOVI R1, meat       ; maliki
MOVI R2, I          ; ngaju

; Role-labeled call — register-to-role mapping defined by morphology
; -jarra-rlu marks agent (ergative case)
; -nyanyi is the verb root
CLASSIFY R0, AGENT, ERGATIVE
CLASSIFY R1, PATIENT, ACCORPORATED  ; noun incorporation!
CLASSIFY R2, BENEFICIARY, NOMINATIVE
CALL bite, {agent: R0, patient: R1, beneficiary: R2}
GVIEW_POP
```

**Implementation:** The FIR instruction set gains a `CallNamed` variant:
```python
class CallNamed(Instruction):
    """Role-labeled call — argument order doesn't matter."""
    func_name: str
    args: dict[str, Value]  # role → value mapping
    return_type: Optional[FIRType] = None
```

At bytecode emission time, `CallNamed` resolves to a standard `CALL` after the compiler establishes the positional mapping based on the function's parameter names. This means **no new opcodes** — just a different compilation path.

---

## 7. Cross-Language Interoperability

### 7.1 The Cross-Language Binding Problem

When Kannada-compiled bytecode calls a function written in Korean, the grammatical metadata must be reconciled:

```
Kannada: "ನಾನು ಅವರಿಗೆ ಹೇಳುತ್ತೇನೆ" (I tell them — no evidentiality, simple present)
Korean: "그들에게 알려줍니다" (I inform them — formal honorific, no evidentiality)
```

**Reconciliation rules:**
1. **Intersection is safe:** Both languages lack evidentiality → no evidence check needed
2. **One language has stricter requirements:** If the caller requires honorific level but the callee's metadata doesn't specify one → honorific check is relaxed (no false positive)
3. **One language provides more metadata:** If the callee was compiled with evidentiality but the caller doesn't expect it → evidential metadata is preserved but not checked

### 7.2 The CROSS_LANG_BIND Opcode (0xAF)

```
Format G: [0xAF][len:u16][src_lang:3B][dst_lang:3B][compat_flags:varB]

Establishes a cross-language binding between two viewpoint frames.
The compat_flags specify how grammatical features are reconciled:

  Bit 0: EVIDENCE_STRICT   — require evidentiality in both languages
  Bit 1: HONORIFIC_STRICT  — require matching honorific levels
  Bit 2: CLASS_RELAX       — relax classifier constraints at boundary
  Bit 3: ORDER_ADAPT       — adapt argument order between SVO/SOV
  Bit 4: TOPIC_PASSTHROUGH — pass topic register across language boundary
```

### 7.3 Universal Bytecode, Multiple Viewpoints

The key insight: **there is only one bytecode format**. All 80+ languages compile to the same FLUX bytecode. The grammatical opcodes are **metadata and guards** — they annotate and constrain execution but don't change the fundamental instruction set.

This means:
- A module compiled from Quechua code can be linked with a module compiled from Hindi code
- The VM doesn't need to know which language compiled each function
- Grammatical opcodes are **idempotent**: if the VM doesn't support a specific grammatical opcode, it's a NOP (graceful degradation)
- The **same computation** expressed in different languages produces **different grammatical metadata** but **identical core instructions**

---

## 8. Testing Strategy

### 8.1 Test Matrix

```
┌────────────────────────────────────────────────────────────────────┐
│  TIER 1: CORE GRAMMATICAL FEATURE TESTS (per feature, not language)│
│  18 features × 3 test types (happy path, error, edge case) = 54   │
├────────────────────────────────────────────────────────────────────┤
│  TIER 2: LANGUAGE PAIR COMPATIBILITY TESTS                        │
│  C(80,2) = 3160 pairs × core operations = targeted subset         │
│  Priority: test all 7 cluster-internal pairs first                │
├────────────────────────────────────────────────────────────────────┤
│  TIER 3: CROSS-LANGUAGE INTEGRATION TESTS                         │
│  Compile module A in lang X, module B in lang Y, link+run         │
│  80 languages × 5 domains = 400 tests                             │
├────────────────────────────────────────────────────────────────────┤
│  TIER 4: GRACEFUL DEGRADATION TESTS                               │
│  Run grammatical bytecode on VM without grammatical support       │
│  Verify: no crashes, metadata preserved, core computation correct │
├────────────────────────────────────────────────────────────────────┤
│  TIER 5: REGRESSION TESTS                                         │
│  Existing 2037 tests must continue to pass unchanged             │
│  All new tests layered on top, not modifying existing             │
└────────────────────────────────────────────────────────────────────┘
```

### 8.2 Test Template (per language)

```python
@pytest.mark.language("quz")  # Quechua
@pytest.mark.grammatical_feature("evidentiality")
def test_quechua_evidential_direct():
    """Quechua direct evidential (-mi) compiles to VERIFY_EVIDENCE DIRECT."""
    source = "Payam chayamullam"  # He just arrived (direct evidence)
    bytecode = compile_nl(source, lang="quz")
    # Verify bytecode contains GVIEW_PUSH + VERIFY_EVIDENCE + GVIEW_POP
    assert_opcode_sequence(bytecode, [0xA0, 0xA3, 0xA1])
    # Verify evidential type is DIRECT
    assert evidential_type(bytecode) == EvidentialType.DIRECT

@pytest.mark.language("swa")
@pytest.mark.grammatical_feature("noun_class")
def test_swahili_noun_class_concord():
    """Swahili noun-class concord is enforced at compile time."""
    source = "Watoto wadogo wanalala"  # Small children are sleeping
    bytecode = compile_nl(source, lang="swa")
    # All three content words must agree on class 2 (wa- prefix)
    assert_class_agreement(bytecode, expected_class=2)

@pytest.mark.language("swa")
@pytest.mark.grammatical_feature("noun_class")
def test_swahili_noun_class_violation():
    """Swahili noun-class concord violation is a compile error."""
    source = "Kitabu wadogo"  # Book (class 7) + small (class 1/2 prefix) — WRONG
    with pytest.raises(ConcordViolationError):
        compile_nl(source, lang="swa")
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1–4)
- [ ] Implement `GrammaticalFeatureSet` data structure
- [ ] Create feature profiles for 5 pilot languages (English, Mandarin, Turkish, Swahili, Korean)
- [ ] Add 16 grammatical viewpoint opcodes to `opcodes.py`
- [ ] Extend `BytecodeEncoder` with Format G handling for new opcodes
- [ ] Implement `GVIEW_PUSH`/`GVIEW_POP` in the VM interpreter
- [ ] Add viewpoint stack to VM runtime state

### Phase 2: Core Feature Implementation (Weeks 5–10)
- [ ] Implement `CLASSIFY` + noun-class system (Swahili pilot)
- [ ] Implement `VERIFY_EVIDENCE` (Turkish + Quechua pilot)
- [ ] Implement `CHECK_HONORIFIC` (Korean pilot)
- [ ] Implement `SCOPE_TOPIC` (Mandarin pilot)
- [ ] Implement `SWITCH_REF` (Warlpiri pilot)
- [ ] Implement morphophonemic analyzer for agglutinative languages (Turkish pilot)

### Phase 3: Vocabulary System Extension (Weeks 11–14)
- [ ] Design multilingual vocabulary file format (`.fluxvocab` v2)
- [ ] Implement 4-layer vocabulary resolution algorithm
- [ ] Create vocabulary files for 5 pilot languages
- [ ] Implement tile resolution with grammatical awareness
- [ ] Build language-family shared vocabulary (SOV, SVO, etc.)

### Phase 4: Compiler Pipeline Integration (Weeks 15–20)
- [ ] Implement language detection (Stage 0)
- [ ] Implement viewpoint constraint validator (Stage 3)
- [ ] Implement UGIR generation (Stage 4)
- [ ] Extend FIR builder with grammatical annotations
- [ ] Implement cross-language linking (Stage 7 bridge)

### Phase 5: Scale (Weeks 21–30)
- [ ] Add 15 more languages (complete all 7 clusters)
- [ ] Implement polysynthetic language support (Mohawk, Inuktitut)
- [ ] Implement tonal language support (Mandarin, Yoruba)
- [ ] Implement free word order support (Warlpiri, Latin)
- [ ] Full test matrix for 20 languages

### Phase 6: 80-Language Coverage (Weeks 31–50)
- [ ] Add remaining 60 languages (feature profiles + vocabulary files)
- [ ] Community vocabulary contribution pipeline
- [ ] Automated language profile extraction from grammars
- [ ] Cross-language interoperability testing
- [ ] Performance benchmarking and optimization

---

## Appendix A: Complete PRGF-to-Opcode Reference

| PRGF | Primary Opcode | Secondary (Macro) | Runtime Behavior |
|------|---------------|-------------------|-----------------|
| S1 Word Order | None (controls argument eval order) | `free_word_order` | Argument ordering in CALL |
| S2 Head Direction | None (controls operand order) | — | Prefix/postfix notation selection |
| S3 Topic-Prominent | `0xA6 SCOPE_TOPIC` | `topic_frame` | Implicit arg via R63 |
| S4 Serial Verb | None (function composition) | `svc_chain` | Implicit subject threading |
| S5 Noun Incorporation | None (inline expansion) | `noun_incorporation` | Argument prepending |
| T1 Nominal Classification | `0xA2 CLASSIFY` | — | Runtime type check |
| T2 Animacy Hierarchy | `0xA7 ANIMACY_GUARD` | `animacy_lifecycle` | Ownership/lifecycle guard |
| T3 Ergativity | None (argument role mapping) | `ergativity_pattern` | Role-labeled dispatch |
| T4 Clusivity | `0xA8 CLUSIVITY_SET` | `clusivity_exclusive` | Set boundary definition |
| T5 Valency Morphology | `0xA9 VALENCE_ADAPT` | `valency_causative` | Arity modification |
| E1 Evidentiality | `0xA3 VERIFY_EVIDENCE` | — | Provenance verification |
| E2 Evidential Strength | `0xA3 VERIFY_EVIDENCE` (confidence param) | — | Confidence scoring |
| E3 Mirativity | `0xA3 VERIFY_EVIDENCE` (UNEXPECTED type) | — | Anomaly detection trigger |
| E4 Honorifics | `0xA4 CHECK_HONORIFIC` | — | Capability check |
| D1 Switch-Reference | `0xA5 SWITCH_REF` | — | Dependency tracking |
| D2 Definiteness | `0xA6 SCOPE_TOPIC` (EXISTS/FORALL mode) | — | Quantification strategy |
| D3 Focus/Contrast | `0xAC FOCUS_MARK` | `focus_driven_branch` | Attention/selection |
| D4 Temporal Encoding | `0xAD TEMPORAL_MARK` | — | Temporal logic annotation |
| M1 Morphological Type | `0xAE MORPH_BIND` | `morpheme_chain` | Instruction granularity |
| M2 Tone | `0xAE MORPH_BIND` (tone param) | `tonal_disambiguate` | Metadata dispatch |
| M3 Directional Encoding | `0xAB DIRECTIONAL_ENC` | — | Spatial reference |
| M4 Sound Symbolism | None (domain-specific) | — | Pattern matching |

## Appendix B: Opcode Map (Extended ISA)

```
0x00-0x07  Control flow         (existing, 8 opcodes)
0x08-0x0F  Integer arithmetic   (existing, 8 opcodes)
0x10-0x17  Bitwise              (existing, 8 opcodes)
0x18-0x1F  Comparison           (existing, 8 opcodes)
0x20-0x27  Stack ops            (existing, 8 opcodes)
0x28-0x2F  Function ops         (existing, 8 opcodes)
0x30-0x37  Memory mgmt          (existing, 8 opcodes)
0x38-0x3F  Type ops             (existing, 6 opcodes + 2 free: 0x3D, 0x3E)
0x40-0x4F  Float arithmetic     (existing, 16 opcodes)
0x50-0x5F  SIMD vector ops      (existing, 7 opcodes + 8 free)
0x60-0x7F  A2A protocol         (existing, 28 opcodes)
0x80-0x9F  System               (existing, 5 opcodes + 27 free)
0xA0-0xAF  GRAMMATICAL VIEWPOINT (NEW, 16 opcodes)
0xB0-0xFF  Reserved for future  (80 opcodes free)
```

## Appendix C: Formatted Feature Profile Example

```yaml
# language_profiles/quz.yaml — Quechua
iso_code: quz
name: Cuzco Quechua
family: Quechuan
wals_url: https://wals.info/languoid/lect/walk_code/quc

structural:
  word_order: SOV
  head_direction: HEAD_FINAL
  topic_prominent: false
  serial_verb: false
  noun_incorporation: false

typological:
  nominal_classification: NONE
  num_classes: 0
  animacy_hierarchy: false
  ergativity: NONE  # Quechua has been argued to have some ergative traits
  clusivity: true  # ñuqanchik (inclusive) vs ñuqaku (exclusive)
  valency_morphology: true  # -chi (causative), -ku (reflexive), -mu (directional)

epistemic:
  evidentiality: OBLIGATORY  # THIS IS THE KEY FEATURE
  evidential_dimensions: 3   # -mi (direct), -si (reported), -cha (hearsay/doubt)
  mirativity: true  # -mi can also mark surprise/new information
  honorific_levels: 0

discourse:
  switch_reference: false
  definiteness: DEMONSTRATIVE  # kay (this), huk (one/some), chay (that)
  focus_system: NONE
  temporal_encoding: ASPECT  # Quechua has aspect (perfective, imperfective) not tense

morphological:
  morphological_type: AGGLUTINATIVE
  tone_system: NONE
  directional_encoding: NONE
  sound_symbolism: false

compilation_strategy:
  primary_opcode: VERIFY_EVIDENCE
  secondary_opcodes: [CLUSIVITY_SET, VALENCE_ADAPT, TEMPORAL_MARK]
  macro_patterns: [valency_causative, valency_reflexive, valency_directional]
  vocabulary_family: sov + agglutinative

pilot_sentences:
  - quechua: "Payam chayamullam"
    gloss: "he/she just arrived"
    evidential: DIRECT (-mi)
    ugir: arrive(he/she, evidential=direct)
    
  - quechua: "Payam chayamunsi"
    gloss: "he/she reportedly arrived"
    evidential: REPORTED (-si)
    ugir: arrive(he/she, evidential=reported)
    
  - quechua: "Payam chayamunchá"
    gloss: "he/she may have arrived"
    evidential: DOUBTFUL (-cha)
    ugir: arrive(he/she, evidential=doubtful)
```

---

*This architecture document is a living design. It will be refined as we implement each phase and learn from the 5 pilot languages. The key invariant: **every decision must preserve the ability to compile any of the 80 languages to the same FLUX bytecode format, with grammatical constraints expressed as annotations and guards, never as language-specific forks of the VM.***
