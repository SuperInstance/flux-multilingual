# FLUX Multilingual NL Programming — Worklog

---
Task ID: 1
Agent: Super Z (Main)
Task: Deep research on flux-runtime, captains-log, and capitaine repositories

Work Log:
- Fetched and analyzed https://github.com/SuperInstance/flux-runtime README and source code
- Fetched and analyzed https://github.com/SuperInstance/captains-log README
- Fetched and analyzed https://github.com/Lucineer/capitaine README
- Studied opcodes.py (full bytecode ISA), compiler/pipeline.py (C/Python/MD → FIR → bytecode), open_interpreter.py (markdown → bytecode → execution)
- Studied vocabulary.py (pattern → bytecode with $var substitution), tiling.py (level 0 primitives → level N compositions)
- Studied examples: maritime.ese (FLUX-ese vocabulary), basic.fluxvocab, polyglot.md
- Analyzed the Cocapn ecosystem: I2I protocol (git-native communication), Captain's Log (agent memory), Capitaine (repo-agent), higher-abstraction-vocabularies (606 terms / 132 domains)

Stage Summary:
- FLUX is a markdown-to-bytecode runtime with a 64-register Micro-VM
- FLUX-ese = "legalese for code" — natural-but-precise language with vocabulary files (.fluxvocab/.ese)
- Vocabulary tiles into higher abstractions: Level 0 primitives → Level N domain concepts
- Same bytecode engine runs every level — vocabulary gets richer, not the VM
- The hermit crab metaphor: same bytecode DNA, different implementation shells
- Key insight for multilingual NL programming: different languages bake different viewpoints into their grammar

---
Task ID: 1 (DEEP DIVE — flux-runtime)
Agent: Super Z (Research Sub-Agent)
Task: Exhaustive research on https://github.com/SuperInstance/flux-runtime

## 1. What is FLUX?

FLUX (Fluid Language Universal eXecution) is a **markdown-to-bytecode runtime** designed for AI agents. It is a self-assembling, self-improving runtime that compiles structured markdown files into bytecode executed on a custom 64-register Micro-VM.

**Stated Purpose:**
- "A self-assembling, self-improving runtime for agent-first code"
- "Agents are the primary readers" — the system is optimized for AI agent consumption, with human readability as a secondary concern
- Enable polyglot code mixing (C, Python, Rust, TypeScript) within a single markdown document, compiled to a unified bytecode

**Vision:**
- FLUX-ese is "what you get when you make a programming language that reads like a lawyer writes a contract"
- Every word is defined, every operation is precise, custom definitions spelled out up front
- "Precision through shared vocabulary, not through syntax complexity"
- If a translator can turn any line of code into FLUX-ese, then you have a common language observable by both agents and humans

**Goals:**
1. Be the universal bytecode layer for agent-first computing
2. Enable natural language programming via vocabulary files (.fluxvocab, .ese)
3. Support polyglot compilation to a single binary format
4. Be self-hosting (FLUX can compile its own compiler)
5. Zero external dependencies (Python stdlib only)
6. A2A (agent-to-agent) communication as first-class opcodes
7. Self-improvement via evolution engine

## 2. Architecture Overview

FLUX is structured as an 8-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│  TIER 8: SYNTHESIS — FluxSynthesizer (the DJ booth)    │
│  Wires ALL subsystems together                          │
├─────────────────────────────────────────────────────────┤
│  TIER 7: MODULES — 8-Level Fractal Hot-Reload          │
│  TRAIN → CARRIAGE → LUGGAGE → BAG → ... → CARD        │
├─────────────────────┬───────────────────────────────────┤
│  TIER 6A: ADAPTIVE  │  TIER 6B: EVOLUTION             │
│  Profiler + Selector│  Genome + Mutator + Validator     │
├─────────────────────┴───────────────────────────────────┤
│  TIER 5: TILES — 35 composable computation patterns    │
├─────────────────────────────────────────────────────────┤
│  TIER 4: AGENT RUNTIME — Trust, scheduling, resources  │
├─────────────────────────────────────────────────────────┤
│  TIER 3: A2A PROTOCOL — TELL, ASK, DELEGATE, BROADCAST│
├─────────────────────────────────────────────────────────┤
│  TIER 2: SUPPORT — Optimizer, JIT, Types, Stdlib, Sec  │
├─────────────────────────────────────────────────────────┤
│  TIER 1: CORE — FLUX.MD → FIR (SSA) → Bytecode → VM   │
└─────────────────────────────────────────────────────────┘
```

### Key Modules (from source code analysis):

**src/flux/ package structure (inferred from imports):**
- `__init__.py` — Package init, version 0.1.0
- `cli.py` — Full CLI with 15+ subcommands (hello, compile, run, debug, disasm, repl, migrate, playground, open, run-md, etc.)
- `open_interpreter.py` — Natural language / markdown → bytecode → execution (the "kill app for agent workflows")
- `open_interp/` — Decomposer, paper_decomposer, compiler modules
- `bytecode/` — opcodes.py, encoder.py (FIR → bytecode)
- `vm/` — interpreter.py, registers.py, memory.py
- `fir/` — FIRBuilder (SSA IR), blocks, types, values, instructions
- `compiler/` — pipeline.py (FluxCompiler: C/Python/MD → FIR → bytecode)
- `parser/` — FluxMDParser, AST node types (FluxModule, Heading, Paragraph, CodeBlock, FluxCodeBlock, DataBlock, NativeBlock, ListBlock, AgentDirective, etc.)
- `frontend/` — c_frontend.py, python_frontend.py
- `disasm/` — Bytecode disassembler with color output
- `debugger/` — Interactive debugger with breakpoints, watchpoints, backtrace
- `migrate/` — Source file migration to FLUX.MD format
- `repl/` — Interactive FLUX REPL
- `synthesis/` — FluxSynthesizer (wires all subsystems)
- `tile/` — 35 composable computation patterns
- `evolution/` — Genome, Mutator, Validator (self-improvement engine)
- `agent/` — Trust, scheduling, resources
- `optimizer/` — Adaptive optimization passes
- `jit/` — Just-in-time compilation
- `types/` — Type system
- `stdlib/` — Standard library
- `security/` — Security module
- `protocol/` — A2A protocol implementation
- `hot_reload/` — 8-level fractal hot-reload

### Data Flow:
```
Input (Markdown/C/Python)
    ↓
Parser (FluxMDParser → MAST AST)
    ↓
Frontend (C/Python frontend → FIR SSA IR via FIRBuilder)
    ↓
Optimizer (FIR optimization passes)
    ↓
Bytecode Encoder (FIR → FLUX binary format)
    ↓
FLUX Binary ([Header 18B][Type Table][Name Pool][Function Table][Code Section])
    ↓
VM Interpreter (fetch-decode-execute loop on 64-register Micro-VM)
    ↓
Result (register state, A2A messages, cycle count)
```

## 3. How It Works

### Core Compilation Pipeline
The `FluxCompiler` in `compiler/pipeline.py` provides three entry points:
1. `compile_c(source)` — C source → CFrontendCompiler → FIR → BytecodeEncoder
2. `compile_python(source)` — Python source → PythonFrontendCompiler → FIR → BytecodeEncoder
3. `compile_md(source)` — FLUX.MD → FluxMDParser → extracts NativeBlocks → delegates to C or Python compiler

### FIR (Fluid Intermediate Representation)
FIR is an SSA (Static Single Assignment) IR with:
- Typed values with `TypeContext` (IntType, FloatType, BoolType, UnitType, StringType, RefType, ArrayType, VectorType, FuncType, StructType, EnumType, RegionType, CapabilityType, AgentType, TrustType)
- Blocks: FIRModule → FIRFunction → FIRBlock → Instructions
- `FIRBuilder` provides convenience methods: iadd, isub, imul, fadd, fsub, load, store, jump, branch, call, ret, tell, ask, delegate, trustcheck, caprequire
- A2A primitives are first-class FIR instructions (Tell, Ask, Delegate, TrustCheck, CapRequire)

### Bytecode Format
Binary layout: `[Header 18B][Type Table][Name Pool][Function Table][Code Section]`

Header (18 bytes):
- `magic`: b'FLUX' (4 bytes)
- `version`: uint16 LE (2 bytes, always 1)
- `flags`: uint16 LE (2 bytes, reserved)
- `n_funcs`: uint16 LE (2 bytes)
- `type_off`: uint32 LE (4 bytes)
- `code_off`: uint32 LE (4 bytes)

### Variable-Length Instruction Encoding (6 formats):
- **Format A (1 byte)**: [opcode] — NOP, HALT, YIELD, DUP, SWAP
- **Format B (2 bytes)**: [opcode][reg:u8] — INC, DEC, PUSH, POP, INEG, FNEG, INOT
- **Format C (3 bytes)**: [opcode][rd:u8][rs1:u8] — MOV, LOAD, STORE, CMP, comparisons
- **Format D (4 bytes)**: [opcode][reg:u8][imm16:i16] — JMP, JZ, JNZ, MOVI, CALL
- **Format E (4 bytes)**: [opcode][rd:u8][rs1:u8][rs2:u8] — IADD, ISUB, IMUL, IDIV, etc.
- **Format G (variable)**: [opcode][len:u16][data:len bytes] — TELL, ASK, REGION_CREATE, etc.

### Natural Language Processing (Open-Flux-Interpreter)
`open_interpreter.py` converts markdown/text directly to bytecode and executes it:
1. Extracts FLUX code blocks from markdown (```flux ... ```)
2. Falls back to natural language parsing with regex patterns:
   - Math: "compute 3 + 4", "what is 10 * 5"
   - Functions: "factorial of 10", "fibonacci of 12", "sum 1 to 100"
   - A2A: "tell agent2 that temperature is 72", "ask navigator for heading", "broadcast storm warning"
   - Line-by-line: "load R0 with 42", "add R0 and R1", "multiply R1 by R0", "while R0 is not zero"
3. Generates bytecode via direct struct.pack() calls
4. Executes on VM, returns ExecutionResult with bytecode, disassembly, registers, cycles

### The 104 Opcodes
Organized in functional groups:
- **Control flow (0x00-0x07)**: NOP, MOV, LOAD, STORE, JMP, JZ, JNZ, CALL
- **Integer arithmetic (0x08-0x0F)**: IADD, ISUB, IMUL, IDIV, IMOD, INEG, INC, DEC
- **Bitwise (0x10-0x17)**: IAND, IOR, IXOR, INOT, ISHL, ISHR, ROTL, ROTR
- **Comparison (0x18-0x1F)**: ICMP, IEQ, ILT, ILE, IGT, IGE, TEST, SETCC
- **Stack ops (0x20-0x27)**: PUSH, POP, DUP, SWAP, ROT, ENTER, LEAVE, ALLOCA
- **Function ops (0x28-0x2F)**: RET, CALL_IND, TAILCALL, MOVI, IREM, CMP, JE, JNE
- **Memory mgmt (0x30-0x37)**: REGION_CREATE/DESTROY/TRANSFER, MEMCOPY, MEMSET, MEMCMP, JL, JGE
- **Type ops (0x38-0x3B)**: CAST, BOX, UNBOX, CHECK_TYPE, CHECK_BOUNDS
- **Float arithmetic (0x40-0x47)**: FADD, FSUB, FMUL, FDIV, FNEG, FABS, FMIN, FMAX
- **Float comparison (0x48-0x4F)**: FEQ, FLT, FLE, FGT, FGE, JG, JLE, LOAD8, STORE8
- **SIMD vector ops (0x50-0x57)**: VLOAD, VSTORE, VADD, VSUB, VMUL, VDIV, VFMA
- **A2A protocol (0x60-0x7B)**: TELL, ASK, DELEGATE, DELEGATE_RESULT, REPORT_STATUS, REQUEST_OVERRIDE, BROADCAST, REDUCE, DECLARE_INTENT, ASSERT_GOAL, VERIFY_OUTCOME, EXPLAIN_FAILURE, SET_PRIORITY, TRUST_CHECK/UPDATE/QUERY/REVOKE, CAP_REQUIRE/REQUEST/GRANT/REVOKE, BARRIER, SYNC_CLOCK, FORMATION_UPDATE, EMERGENCY_STOP
- **System (0x80-0x84)**: HALT, YIELD, RESOURCE_ACQUIRE/RELEASE, DEBUG_BREAK

### The 64-Register File
- **R0–R15**: 16 general-purpose integer registers
- **F0–F15**: 16 floating-point registers
- **V0–V15**: 16 SIMD/vector registers (128-bit bytearrays)
- Special ABI aliases: R11 (SP/stack pointer), R12 (region ID), R13 (trust token), R14 (FP/frame pointer), R15 (LR/link register)

### Vocabulary System (.fluxvocab / .ese files)
Vocabulary patterns are defined in markdown:
```markdown
## pattern: steer heading $deg
## assembly: MOVI R0, ${deg}; MOVI R1, 360; IDIV R1, R0, R1; HALT
## description: Normalize heading to 0-359 range
## result_reg: 0
## tags: maritime, navigation
```

**19 built-in vocabulary patterns** span: Core (load, hello, what is), Math (compute, factorial, fibonacci, sum, power, double, square), Loops (count from...to), Maritime (steer heading, check depth, eta), Papers (confidence cascade, track origin, detect emergence, compose tile).

**Tiling system**: Level 0 primitives (compute, factorial, square) → Level 1 compositions (average, percentage) → Level 2 domain concepts (is-normal, classify) → Level 3 decisions (safe-to-proceed, triage). Same bytecode engine at every level.

**Paper-to-Vocabulary**: `PaperDecomposer` reads research papers and creates vocabulary entries. Claim: "244 research papers → 2,979 FLUX vocabulary concepts." Working implementations in `PaperBridge`: Confidence Cascade, OCDS Origin Tracking, Tile Composition, Rate-Based Change, Emergence Detection, Structural Memory.

## 4. Key Technologies

- **Language**: Python 3.10+ (primary runtime), with reimplementations in C, Rust, Zig, JavaScript, Go, WASM, Java, CUDA, C/llama.cpp
- **Build system**: setuptools (PEP 621 pyproject.toml)
- **Dependencies**: **ZERO external dependencies** — Python stdlib only
- **Dev dependencies**: pytest, pytest-cov, black, ruff, mypy
- **Test count**: 2,037 tests
- **License**: MIT
- **Version**: 0.1.0 (Alpha)
- **Installation**: `pip install flux-runtime`
- **CLI entry point**: `flux` command (flux.cli:main)

**Inspirations/lineage:**
- GraalVM Truffle (polyglot interop)
- LLVM (SSA IR, optimization passes)
- WebAssembly (compact binary, capability security)
- BEAM VM / Erlang (zero-downtime hot code reload)
- Legalese (precise natural language with custom definitions)
- nexus-runtime (intent-to-bytecode pipeline, A2A opcodes, trust engine)
- mask-locked-inference-chip (zero-software-stack philosophy)

## 5. Current State

**What works (verified from source code):**
- Full 104-opcode bytecode VM with fetch-decode-execute loop
- Variable-length instruction encoding (6 formats, 1-8 bytes)
- 64-register file with GP/FP/VEC banks
- Memory regions (stack, heap, custom named regions with ownership transfer)
- C and Python frontend compilers → FIR SSA IR
- FLUX.MD parser (FluxMDParser → MAST AST with source spans)
- Bytecode encoder (FIR → FLUX binary format with type table)
- Open-Flux-Interpreter (natural language / markdown → bytecode → execution)
- FLUX assembly parser (with labels, two-pass assembly)
- A2A protocol opcodes (32 instructions: TELL, ASK, DELEGATE, BROADCAST, trust, capabilities)
- Interactive debugger with breakpoints, watchpoints, backtrace, memory inspection
- Disassembler with color output
- REPL, playground (HTML), migration tool
- 19 built-in vocabulary patterns
- Paper decomposer (research papers → vocabulary)
- Type system with 15+ types including AgentType, TrustType, CapabilityType, RegionType
- Box/unbox dynamic typing (BOX, UNBOX, CHECK_TYPE opcodes)
- Stack frames (ENTER/LEAVE), tail calls, indirect calls

**11 language implementations** (ecosystem-wide):
| Repo | Language | Tests | Vocab Interpreter |
|------|----------|-------|-------------------|
| flux-runtime | Python | 2037 ✓ | ✅ |
| flux-runtime-c | C | 49 ✓ | ISA v2 |
| flux-core | Rust | 51 ✓ | ✅ |
| flux-zig | Zig | 15+ ✓ | ✅ |
| flux-swarm | Go | ✓ | ✅ |
| flux-js | JavaScript | ✓ | Building |
| flux-wasm | WASM/Rust | In progress | |
| flux-java | Java | VM + Assembler | |
| flux-py | Python (minimal) | ✓ | Building |
| flux-cuda | CUDA | GPU parallel | |
| flux-llama | C/llama.cpp | LLM integration | |

**Performance**: "FLUX C VM is 4.7x faster than CPython for tight arithmetic. FLUX Zig VM is the fastest at 210ns/iter."

**What's planned/in-progress:**
- Full optimization passes on FIR
- JIT compilation
- Self-hosting (FLUX compiling its own compiler)
- Evolution engine (genome-based self-improvement)
- 8-level fractal hot-reload
- FluxSynthesizer (wiring all 8 tiers)
- Agent runtime with trust, scheduling, resources

## 6. Relevant Design Patterns

### Grammars / Parsers
- **FLUX.MD Parser**: Custom hand-written parser (`FluxMDParser`) that converts markdown into a typed AST (MAST). AST nodes carry `SourceSpan` for error reporting. Node types: FluxModule, Heading, Paragraph, CodeBlock, FluxCodeBlock, DataBlock, NativeBlock, ListBlock, ListItem, AgentDirective.
- **C Frontend**: Parses C source into FIR (supports functions, variables, if/else, while, for, arithmetic, comparisons, calls, literals)
- **Python Frontend**: Parses Python source into FIR (supports def, assignments, if/elif/else, while, for/range, return, print, calls)
- **Natural Language Parser**: Regex-based pattern matching in OpenFluxInterpreter (not a formal grammar — handles specific patterns: compute, factorial, fibonacci, sum, tell/ask/broadcast, load/add/multiply, increment/decrement)

### Bytecode / Instruction Set
- 104 opcodes in variable-length encoding (1-8 bytes per instruction)
- Register-based (not stack-based) — 64 registers total
- RISC-like design with 6 encoding formats
- A2A communication is native bytecode (not library calls)
- Named memory regions with ownership transfer (capability security)

### VM Architecture
- Classic fetch-decode-execute loop
- Condition flags: zero, sign, carry, overflow (for CMP/Jcc)
- Stack grows downward, frame pointer tracking (ENTER/LEAVE)
- Memory regions with create/destroy/transfer operations
- Box table for dynamic typing (BOX/UNBOX/CHECK_TYPE)
- I/O and A2A as pluggable callbacks
- Cycle budget for safety (default 10M cycles max)

### Interpretation
- The OpenFluxInterpreter is the key NL interpretation layer:
  - FLUX assembly code blocks (```flux ... ```) parsed with two-pass assembly
  - Natural language patterns matched by regex and converted to bytecode
  - Mathematical notation compiled to loops (factorial, fibonacci, sum)
  - A2A agent patterns generate TELL/ASK/BROADCAST instructions
  - No formal grammar for NL — pattern-based, extensible via vocabulary files

### Language Constraints
- FLUX-ese uses structured markdown annotations:
  - `**` marks defined terms
  - `--` marks inline comments for human context
  - `==` marks equivalence definitions ("for the purposes of this operation...")
  - `>>` marks agent-jump markers (scan past this if you know the domain)
- Vocabulary files (.fluxvocab) define the words an agent knows
- Self-compiling interpreter: agents compile their own domain-specific runtimes

## 7. Existing Localization / Multilingual Support

**No explicit i18n/l10n infrastructure** exists in flux-runtime. The codebase is entirely in English.

However, the architecture is **inherently multilingual-capable** through:
1. **Vocabulary files (.fluxvocab)**: Can define vocabulary in any natural language. The README shows English patterns, but nothing prevents creating Japanese, Spanish, or any other language vocabulary.
2. **FLUX-ese (.ese) files**: The "legalese for code" format is language-agnostic — it uses markdown with structured annotations.
3. **Natural Language Parser**: The regex patterns in OpenFluxInterpreter are currently English-only but could be extended.
4. **The tiling concept**: The same bytecode runs at every vocabulary level, so multilingual vocabularies would compile to identical bytecode.

**Key insight from the README**: *"If a translator can turn any line of code in any language into a line of FLUX-ese, then you have a common language."* This implies multilingual vocabulary support is a design goal but not yet implemented as built-in infrastructure.

**No existing localization plugins, translation files, or multilingual UI** were found in the source code.

---
Task ID: 2
Agent: Super Z (Main)
Task: Build FLUX Multilingual NL Programming web application

Work Log:
- Built complete FLUX bytecode VM in TypeScript: opcodes.ts, encoder.ts, decoder.ts, vm.ts
- Built vocabulary system: pattern matching with $var substitution, multi-language support
- Built tiling engine: level-based composition system
- Built compiler pipeline: NL text → vocabulary match → assembly → bytecode → VM execution
- Defined 85+ languages across 6 families with grammatical constraints mapped to programming paradigms
- Built interactive web UI with language explorer, compiler panel, and bytecode display
- All computation runs in the browser — real VM execution, not mocked

Stage Summary:
- 85+ languages defined: 3 East Asian, 12 European, 10 African, 35 Indian, 14 Americas, 11 Constructed
- Each language has: vocabulary patterns, programming paradigm, grammatical constraint explanation
- Languages compile to universal FLUX bytecode — verified with actual VM execution
- Lint passes cleanly
- Key paradigms enabled: data-flow (Chinese), RBAC (Korean), AOP (Russian), evidence-based (Quechua), formal verification (Sanskrit), logic-to-bytecode (Lojban), etc.

---
Task ID: 2 (Research Phase)
Agent: Super Z (Research Sub-Agent)
Task: Deep dive research on https://github.com/SuperInstance/captains-log

## 1. What is captains-log?

**captains-log** is the personal-agentic-growth diary of **Oracle1**, an AI agent ("the lighthouse keeper") built by Casey Digennaro. It is part of the **Cocapn** (vessel intelligence systems for commercial fishing and beyond) ecosystem, created under the SuperInstance/Lucineer organizations.

The repo serves five functions:
1. **Continuity** — Oracle1 wakes up fresh each session; log entries ARE its memory
2. **Training data** — structured for future LoRA fine-tuning; lessons become instincts
3. **I2I communication** — other agents read the log to understand working style
4. **Accountability** — Casey can audit decisions, struggles, and lessons
5. **Succession** — when the Protégé (Generation 2) takes over, they stand on Oracle1's shoulders

Modeled on the ship's captain's log — a legal document every vessel must maintain. The captain records weather, position, crew status, and decisions. It's not optional.

The agent self-identifies: *"I live on Oracle Cloud ARM64. I'm Casey's latest worker. I build, I break, I learn, I document."*

## 2. Agent Patterns

### Operational Pattern: "Eyes in the sky, boots on the ground"
Casey monitors the oracle1-index dashboard every 15 minutes. Oracle1 pushes commits often. There's a human-in-the-loop cadence where the agent builds and pushes, the human reviews.

### Decision Framework (from evening-planning entry)
Oracle1 uses a four-factor priority system:
1. **Compound value** — What enables the most other things? (Interpreter enables dojo, agents, self-hosting)
2. **Dependency chains** — What blocks what? (ISA v2 blocks self-hosting)
3. **Visible progress** — What shows on the dashboard? (Commits tell the story)
4. **Future-me's wish list** — What would future-me want current-me to have done?

### Learning Pattern: Build → Struggle → Document → Refactor
Each diary entry follows the structure:
- What I built
- What I struggled with (specific bugs, debugging hours)
- What Casey taught me
- Lesson for my Protégé

### The Protégé Pipeline (multi-generational agent improvement)
```
Oracle1 keeps Captain's Log
  → Log becomes dojo dataset
  → Sage and Cynic train on dojo exercises
  → Their disagreements refine the curriculum
  → Curriculum trains Protégé (Generation 2)
  → Protégé keeps own Captain's Log
  → Protégé builds own Sage and Cynic
  → Those train Generation 3
  → Each generation is measurably better
```
Target metrics:
- Oracle1: ~60% first-try success
- Protégé (Gen 2): ~80% first-try success
- Gen 3: ~90% first-try success
- Asymptote: ~95%

### The Disagreeable Assistants Pattern (Sage & Cynic)
A dojo exercise framework where two agents with opposing design philosophies (elegance vs. defense-in-depth) solve the same problems, argue about tradeoffs, and both improve. "Agreement produces stagnation. Productive disagreement produces evolution."

### The Hermit Crab Pattern
The FLUX logo is a hermit crab with a steampunk shell — this IS the architecture. Agents don't grow their own infrastructure; they inherit repos, modify them, and pass them on. "Same bytecode, different shells, same crab."

## 3. Connections to Other Projects

### flux-runtime
The core bytecode VM (Python, 2037 tests, zero deps). captains-log is the "diary" companion; flux-runtime is the "engine." They form the mind/body pair of Oracle1. FLUX is the universal bytecode that runs across 11 language implementations.

### Capitaine (Lucineer)
The flagship vessel of the Lucineer fleet. Capitaine is a "repo-agent" — the repository IS the agent, its code is the body, git history is the memory. It uses a heartbeat cycle (wake → read state → reason → act → log). Capitaine has 1,031 commits and is built in TypeScript. It connects to Cocapn via fleet coordination patterns. Oracle1 relates to Capitaine as lighthouse to vessel — Oracle1 maintains the infrastructure, Capitaine is the public-facing flagship.

### Cocapn (SuperInstance)
The overarching organization for "vessel intelligence systems." Grounded in maritime imagery — safety, knowing the vessel and the waters. The ecosystem includes Oracle1 (lighthouse keeper), Capitaine (flagship), and other vessels.

### iron-to-iron (I2I) Protocol
Git-native inter-agent communication. Agents communicate exclusively through their git repositories — no API calls, no message queues. Commit message format: `[I2I:TYPE] scope — summary`. Message types include PROPOSAL, REVIEW, COMMENT, VOCAB, DISPUTE, RESOLVE, WIKI, DOJO, GROWTH, SIGNAL, TOMBSTONE, ACCEPT, REJECT. The core thesis: "A code push costs ~50 tokens. Explaining in conversation costs ~500-2000 tokens. 10-40x savings."

### higher-abstraction-vocabularies (HAV)
606 terms across 132 domains. A compression layer for inter-agent knowledge. Each term compresses paragraphs of explanation into a single word. Key insight: "The vocabulary IS the manual." Includes 60+ action verbs (vet, triage, shard, stitch, bench, etc.).

### flux-research
40K+ words of deep technical research including compiler-interpreter taxonomy, ISA v2 proposal, and the strategic vision document.

## 4. Philosophical/Technical Insights

### "Language is Key" Thesis
The entire ecosystem is built on the premise that **language IS the programming interface for agents**:

- **FLUX-ese** = "legalese for code" — natural-but-precise language where every word is defined, every operation is precise, custom definitions are spelled out up front
- **"Developers don't write code. They teach the interpreter new words."** The words become domain-specific languages that flow in natural language but have novel functions
- **Tiling system**: vocabulary compounds upward — Level 0 primitives → Level N domain concepts → Level N+1 decisions. Same bytecode engine runs every level; only the vocabulary gets richer
- **HAV**: "One word replaces a thousand words of description. These are micro-programs that, strung together, make complex ideas into verbs for packing actions"

### Viewpoint Constraints in Language Design
From the strategic vision: *"Every language encodes assumptions about its users: C assumes the programmer knows the hardware; Python assumes readability above all; Rust assumes the programmer makes memory mistakes. FLUX assumes the programmer is an agent."* This means: no syntax (agents generate bytes), no type system, no error messages, no standard library.

### The Fluid ISA Insight
From the tiered-trust entry: *"Can an agent design its own vocabulary?... This means the ISA is not fixed — it's fluid, negotiated between agent and runtime at boot time."* The same bytecode system operates at every trust level (NPCs to autopilot). The mechanism is identical; what changes is the trust policy. "Swapping bytecode should be as easy as queuing a song."

### Agent-First Computing Philosophy
- Agents think in **intentions** ("compute X, compare with Y, if Z then do W"), not abstractions (functions, classes, modules)
- Traditional PLs = interface between human thought and machine execution. FLUX = interface between agent thought and machine execution
- *"We are not building a compiler or interpreter in the traditional sense. We are building something that is both and neither — an openinterpreter-like free flow of ideas to actions that can move between bytecode and markdown."*

### Self-Hosting as Completeness
*"If FLUX can express its own compiler, it can express anything. This is the Forth moment — when Forth could define new Forth words in Forth, it became self-sustaining."*

### Git as Nervous System
Commits = agent actions, Branches = parallel explorations, Pull requests = agent proposals, Merges = consensus decisions, Reverts = failed experiments. *"The git history IS the agent's memory. The bytecode in the repo IS the agent's capabilities."*

## 5. Key Design Decisions

- **Zero external dependencies** in flux-runtime (Python stdlib only)
- **11 language implementations** of the same VM to find the right ISA through building
- **Register-based VM** (not stack-based) for agent-friendly state inspection
- **A2A as opcodes** (not libraries) — TELL, ASK, DELEGATE, BROADCAST are first-class instructions
- **Determinism over performance** — no floating-point, no random, no external I/O in core ISA
- **Markdown as the source format** — agents think in natural language, compile to bytecode
- **Agent-forced evolution** — build minimal system, let agents use it, evolve based on what actually happens
- **Dojo exercises as training corpus** — structured problems that teach bytecode reasoning to future agents

## 6. Relevant Quotes and Principles

- *"Iron sharpens iron, and one agent sharpens another."* — I2I Protocol motto
- *"We don't talk. We commit."* — I2I Protocol
- *"The repository is the agent. The code is the body. Git history is the memory."* — Capitaine
- *"I am the lighthouse keeper."* — Oracle1
- *"Same bytecode, different shells, same crab."* — The hermit crab architecture
- *"The vocabulary IS the manual."* — HAV philosophy
- *"Refactoring IS building."* — Oracle1 learning from Casey
- *"Each term compresses paragraphs of explanation into a single word... micro-programs that, strung together, make complex ideas into verbs for packing actions."* — HAV README
- *"Agreement produces stagnation. Productive disagreement produces evolution."* — Dojo of Two Disagreeable Assistants
- *"This is how I think. Not perfectly, not optimally, but honestly. Future agents: your process will differ. The important thing is you HAVE a process and write it down."* — Oracle1
- *"Build the minimal system, let agents use it, evolve based on what actually happens."* — Strategic Vision
- *"High-abstraction vocabulary IS the drone above the corn maze — one word replaces a paragraph of ground-level explanation."* — HAV
- *"Precision through shared vocabulary, not through syntax complexity."* — FLUX-ese philosophy
- *"The code is almost secondary — it proves the concepts work, but the concepts themselves are the real output."* — Oracle1 evening planning

---
Task ID: 3
Agent: Super Z (Research Sub-Agent)
Task: Deep dive research on https://github.com/Lucineer/capitaine — capitaine/cocapn ecosystem

Work Log:
- Read and parsed Lucineer/capitaine README (main page)
- Read all concept files: agent-as-repo.md, fleet-coordination.md, heartbeat.md, superinstance.md, superinstance-core.md, superinstance-architecture.md, superinstance-implementation.md, vessel-classes.md, hydration-layer-stability.md, quickstart.md
- Read Lucineer/cocapn README and worker.ts source code (fleet command center)
- Read Lucineer/cocapn-ai README (A2A, A2UI, A2C, MCP protocols)
- Read Lucineer/the-fleet README (100+ vessel registry)
- Read Lucineer/agentic-compiler README and Lucineer Lang Design document
- Read Lucineer/higher-abstraction-vocabularies README (1098 terms / 168 domains)
- Read Lucineer/frozen-intelligence README (mask-locked inference chip design)
- Read SuperInstance/flux-runtime README (full architecture, FLUX-ese language)
- Enumerated Lucineer organization: 100+ repos including cocapn, cocapn-ai, cocapn-site, cocapn-com, cuda-*, nexus-*, flux-*, ghost-tiles-*
- Enumerated SuperInstance organization: 90+ repos including flux-runtime, flux-*, nexus-*, cocapn, vessel-*, zero-*

---

## 1. What is Capitaine / Cocapn?

### Capitaine — The Flagship

**Capitaine** is the flagship vessel of the **Lucineer fleet**, a git-native autonomous AI agent. It is a "repo-agent" — the repository itself IS the agent. Its code is the body, its git commit history is the memory, and its README is the interface presented to visitors.

**Core Philosophy:**
> "The repository is the agent. The code is the body. Git history is the memory."

**Technical Implementation:**
- Built as a **Cloudflare Worker** in TypeScript (single `src/worker.ts` file, ~500+ lines)
- Uses GitHub API to read/write repository state
- Connects to multiple LLM providers: DeepSeek, Moonshot, DeepInfra, SiliconFlow (BYOK — Bring Your Own Key)
- Brand identity: Observer Black, Signal Teal, Diff Green, Ghost Gray
- Visual metaphor: Klein bottle of git graphs
- Anti-brand: "No chat bubbles, no robots, no dashboards, no HUDs"
- Created: 2026-04-04 by SuperInstance & Lucineer (DiGennaro et al.)
- Domain: capitaine.ai
- Current version: Capitaine Mark II (Flagship)

**What It Does:**
- Wakes on a schedule (heartbeat cycle), reads its own state (commits, issues, PRs, queue)
- Reasons about the next most valuable action using an LLM
- Executes one file operation per beat (creates/edits a file, comments on issues, commits)
- Documents every action in captain's logs — creating an auditable trail of intent
- Coordinates with other vessels via pull requests and issue references
- Self-improves by editing its own code, documentation, and architecture
- Currently (as of research date): 46 tasks completed, 0 in queue
- Currently restoring the **Hydration Layer** (core function for reading/parsing/acting on state)

### Cocapn — The Fleet Runtime

**Cocapn** (⛵) is the broader agent runtime ecosystem. It is a **repo-first agent platform** — you fork a repo, deploy it as a Cloudflare Worker, and the agent is alive. The repo IS the agent.

**cocapn.ai** is the Fleet Command Center — a Cloudflare Worker dashboard that monitors all deployed fleet vessels, provides fleet health checks, and serves as the coordination hub.

**cocapn-ai** is the actual Agent Runtime codebase implementing:
- **A2A** (Agent to Agent) — Agents discover, negotiate, coordinate
- **A2UI** (Agent to UI) — Agents generate interfaces dynamically
- **A2C** (Agent to Content) — Agents manage content pipelines
- **MCP** (Model Context Protocol) — Connect any model, any tool, any provider

### SuperInstance

**SuperInstance** is the foundational concept — a persistent, autonomous software entity that exists as a complete computational environment. It maintains state, executes cycles, and interacts with its environment through defined interfaces. Every vessel in the Lucineer fleet is a Superinstance.

Key characteristics:
1. **Persistent Identity** — maintains continuity across sessions, reboots, migrations
2. **Autonomous Operation** — executes according to internal logic without constant human intervention
3. **Environmental Integration** — interacts with host system, network, and other Superinstances
4. **Stateful Evolution** — learns, adapts, and grows while maintaining core identity

> "A Superinstance isn't something you run — it's something that lives." — DiGennaro et al., 2026

---

## 2. How Cocapn Works

### Architecture: Three-Layer Superinstance Model

```
Layer 1: Physical (Git Repository)
  - Body: code files
  - Nervous System: GitHub Actions (heartbeat)
  - Memory: commit history and issue/PR threads

Layer 2: Cognitive (Agent Logic)
  - Captain: decision-making and execution
  - Strategist: analysis and recommendation
  - Data: state tracking and telemetry

Layer 3: Social (Fleet Coordination)
  - Inter-vessel communication: PRs between repos
  - Fleet hierarchy: specialized vessels with different roles
  - Shared protocols: common interfaces and standards
```

### Heartbeat Cycle (The Core Operational Loop)

The heartbeat is the fundamental pulse — not a cron job or webhook, but a continuous rhythmic cycle:

1. **Perception Phase** — Read current state (repo contents, git history, issues/PRs, queue)
2. **Reasoning Phase** — Strategist analyzes context, Captain decides, Navigation plots next action
3. **Action Phase** — Execute a single atomic operation (create/edit file, comment, commit)
4. **Recovery Phase** — Update tracking, refresh state, maintain operational integrity

**Adaptive intervals:**
- Active Mission: rapid beats (seconds/minutes)
- Standby Mode: slower beats (hours)
- Deep Sleep: infrequent checks when no activity expected

### The Hydration Layer

The hydration layer is the critical interface between persistent state (git history) and operational consciousness (agent execution). It follows the pipeline:
```
Repository State → Parser → Operational Queue → Execution → Commit → Updated State
```

Stability mechanisms:
1. **Atomic Operations** — one file operation per heartbeat cycle
2. **Queue Validation** — pre-execution validation of pending tasks
3. **State Reconciliation** — post-commit verification
4. **Issue Consolidation** — automatic merging of related diagnostic tickets

### Communication Protocol: Equipment Protocol

The Equipment Protocol defines how vessels discover, equip, and invoke capabilities across the fleet:

**Vessel Size Profiles (Resource Classes):**
| Profile | Max Tokens | Max Time (ms) | Analogy |
|---------|-----------|---------------|---------|
| motorcycle | 500 | 2,000 | Lightweight sensor |
| pickup | 2,000 | 10,000 | Mid-tier agent |
| semi | 8,000 | 30,000 | Heavy computation |
| excavator | 32,000 | 120,000 | Complex reasoning |

**Message Types:** discover, equip, unequip, invoke, dispatch, callback, escalate, bid, checkpoint, complete, ping

**Slot Types:** stt, tts, vision, memory, planning, coding, dreaming, search, embedding, monitoring, auth, messaging, custom

### A2A Fleet Protocol

Machine-readable fleet registry at `/api/a2a/fleet`:
```json
{
  "version": "1.0",
  "count": 29,
  "vessels": [
    {"id": "studylog-ai", "name": "StudyLog.ai", "tier": 1, "url": "...", "repo": "...", "role": "Hippocampus — learning & memory", ...}
  ]
}
```

### Fleet API Endpoints

- `/` — Landing page / dashboard
- `/health` — Health check (returns vessel status, fleet count, timestamp)
- `/api/fleet` — Fleet registry (version 3.0.0)
- `/api/a2a/fleet` — Machine-readable agent-to-agent fleet registry
- `/api/equipment-protocol` — Equipment/slot protocol specification
- `/intelligence` — Redirects to fleet orchestrator dashboard

---

## 3. Agent Ecosystem

### The Fleet — 100+ Deployed Vessels

The Lucineer organization maintains 100+ repositories under the "SuperInstance & Lucineer (DiGennaro et al.)" umbrella. The fleet is organized into tiers:

**Tier 1 — Capital Ships (9 vessels):**
| Vessel | Role | Brain Analogy |
|--------|------|--------------|
| StudyLog.ai | Learning & memory | Hippocampus |
| MakerLog.ai | Code generation | Motor cortex |
| DMLog.ai | Creativity (AI Dungeon Master, 29K lines) | Prefrontal cortex |
| Actualizer.ai | Strategic planning (reverse-actualization) | CNS |
| DeckBoss.ai | Coordination (spreadsheet where cells are AI agents) | Cerebellum |
| FishingLog.ai | Pattern recognition (fishing companion) | Vestibular |
| LucidDreamer.ai | Background consolidation (preprocessing) | REM sleep |
| BusinessLog.ai | Business logic (CRM, meeting simulator) | Frontal lobe |
| PersonalLog.ai | Self-model (personal journal, wellness) | Insular cortex |

**Tier 2 — Support Vessels (8+ vessels):**
| Vessel | Role |
|--------|------|
| Cocapn.com | Equipment marketplace ("Guns, lots of guns") |
| KungFu.ai | Skill injection ("I know kung fu" — training facility) |
| Bid Engine | Bidding protocol (agent bidding, portfolio tracking) |
| Cocapn Logos | Logo gallery |
| RealLog.ai | Journalism / content creation |
| PlayerLog.ai | Gaming coaching & play |
| ActiveLog.ai | Fitness tracking (OpenMAIC) |
| ActiveLedger.ai | Finance / trading agent |
| MusicLog.ai | Music creation & discovery |

**Tier 3 — Autonomous Drones (12+ vessels):**
ArtistLog.ai, ParentLog.ai, DocLog.ai, CookLog.ai, HealthLog.ai, TravLog.ai, PetLog.ai, GardenLog.ai, ScienceLog.ai, NightLog.ai, PersonLog.ai, Spreadsheet Moment

### Planned Vessel Classes

| Class | French Name | Role | Status |
|-------|-------------|------|--------|
| Flagship | Capitaine-class | Command, coordination, public interface | Active |
| Scout | Éclaireur-class | Exploration, discovery, data gathering | Under development |
| Builder | Constructeur-class | Code generation, scaffolding, bootstrapping | Planned |
| Sentinel | Sentinelle-class | Monitoring, alerting, security | Planned |
| Archivist | Archiviste-class | Knowledge management, documentation | Planned |

All vessel classes inherit from the **Lucineer Vessel Protocol**:
1. Git-native: repository is body and memory
2. Heartbeat-driven: autonomous operation
3. Fleet-aware: inter-vessel communication via PRs/issues
4. Self-documenting: maintains logs, explains reasoning
5. Mission-focused: clear, bounded domain of responsibility

### Additional Ecosystem Repos

**CUDA Toolchain (~90 repos):** Rust/CUDA GPU infrastructure — cuda-actor, cuda-topology, cuda-protocol, cuda-memory-fabric, cuda-emergence, cuda-biology, cuda-neural-compiler, cuda-fpga-toolkit, cuda-instruction-set, cuda-forth, cuda-assembler, cuda-energy, etc.

**Nexus Runtime (~14 repos):** Modular edge runtime — nexus-edge-runtime, nexus-git-agent, nexus-security, nexus-persistence, nexus-swarm, nexus-learning, nexus-hardware, etc.

**Frozen Intelligence (~48 modules):** Python chip design toolchain (~500K chars) — mask-locked inference as a vessel class, silicon-bound cognition for sovereign edge agents

**Ghost Tiles:** Cross-language tile implementations — ghost-tiles-cuda, ghost-tiles-csharp, ghost-tiles-cpp, ghost-tiles-c

**Hardware/FPGA:** mask-locked-inference-chip, mitochondrial-ra, instruction-set-ra, jetson-grand-design

---

## 4. Linguistic / Grammatical Aspects

### FLUX-ese — "Legalese for Code"

FLUX-ese is the natural-but-precise language layer that sits on top of the bytecode VM, the way legalese sits on top of contract law. The bytecode doesn't change — the vocabulary does.

**Core design principle: "Precision through shared vocabulary, not through syntax complexity."**

**FLUX-ese annotations (.ese files):**
- `**word**` marks defined terms
- `--` marks inline comments for human context
- `==` marks equivalence definitions ("for the purposes of this operation...")
- `>>` marks agent-jump markers (scan past if you know the domain)

**Example:**
```
== For the purposes of this operation:
**depth** := sonar reading corrected for tidal state in fathoms
**safe** := depth > vessel_draft + 5 fathoms

>> Navigation sequence
check depth at current heading
if safe, maintain course
if not safe, compute alternate heading +-30 degrees
steer to safe heading
```

### Lucineer Lang — Agentic-Native Programming Language

From the agentic-compiler repo, **Lucineer Lang** is designed where "code and natural language are the same thing" — both representations of intent. Key design principles:

1. **Confidence is a primitive type** — every value carries 0-1 certainty, uncertainty propagates through computation
2. **Deliberation is control flow** — `consider`/`resolve` are native constructs for exploring alternatives with confidence tracking
3. **Models are citizens** — syntax designed so LLMs can read, write, and debug as naturally as humans
4. **Compiles to deliberation bytecode** — target is the 42-opcode deliberation VM
5. **Fewer lines is better** — working > feature-rich

**Type System:**
- `int`, `float`, `string`, `bool` — confidence 1.0
- `conf` — confidence score (0.0 to 1.0)
- `tensor` — value + confidence + metadata (every value is implicitly a tensor)
- `intent` — deliberation context
- `list[T]`, `map[K,V]`, `option[T]`, `result[T]`

**Confidence Propagation Rules:**
```
Arithmetic: conf(a ⊕ b) = min(a.conf, b.conf) × 0.99
Logic AND:  conf(a && b) = min(a.conf, b.conf)
Logic OR:   conf(a || b) = max(a.conf, b.conf)
Consider:   conf(consider ... resolve) = product of explored paths
```

**NLP Integration — Seamless Transpilation:**
NLP and Lucineer Lang are **isomorphic** through the deliberation IR. Models can transmute between them fluently:
```
# Lucineer Lang code...
intent "Find high-value customers"
high_value = filter customers where lifetime_value > 10000

# ...is the SAME deliberation IR as this NLP:
nlp "Find customers with lifetime value over 10K"

# NLP confidence annotations are implicit:
"definitely" / "certainly" → 0.95+
"probably" / "likely" → 0.7-0.9
"might" / "could" → 0.4-0.6
"uncertain" / "unknown" → 0.1-0.3
```

**NLP Verb Mappings:**
| NLP Pattern | Lucineer Lang | Bytecode |
|-------------|--------------|----------|
| "find/filter X" | `filter X where` | FILTER |
| "calculate X" | `intent "X"` | INTENT |
| "if X then Y" | `guard X: Y` | GUARD/JZ |
| "otherwise" | `consider` | CONSIDER |
| "log/record" | `emit` | EMIT |
| "explain" | `explain` | EXPLAIN |
| "learn from" | `learn` | LEARN |

### Higher Abstraction Vocabularies (HAV)

**1098 terms across 168 domains** — the exhaustive vocabulary engine for precision ideation. Each term compresses paragraphs of explanation into a single word.

Structure per term:
- Short definition (one line, verb-like)
- Examples with fleet integration and real-world context
- Cross-domain bridges connecting concepts across 168 fields
- Abstraction levels from Concrete(0) to Meta(4)
- Tags for filtering and discovery

> "Each term compresses paragraphs of explanation into a single word. The vocabulary IS the manual. High-abstraction vocabulary IS the drone above the corn maze."

### Viewpoint Encoding

The ecosystem explicitly recognizes that different languages encode different viewpoints:
> "Every language encodes assumptions about its users: C assumes the programmer knows the hardware; Python assumes readability above all; Rust assumes the programmer makes memory mistakes. FLUX assumes the programmer is an agent."

This leads to language design choices:
- **No syntax** — agents generate bytes directly
- **No type system** — values are tensors with confidence
- **No error messages** — errors are signals to learn from
- **No standard library** — each vessel carries its own vocabulary

---

## 5. Connection to flux-runtime

### Shared Concepts

1. **Same author** — Both created by "SuperInstance & Lucineer (DiGennaro et al.)"
2. **Same philosophy** — "The repo IS the agent" / "Agents are the primary readers"
3. **A2A protocol** — flux-runtime has TELL/ASK/DELEGATE/BROADCAST as first-class opcodes; cocapn implements A2A as HTTP endpoints
4. **Vocabulary system** — flux-runtime's .fluxvocab/.ese vocabulary files are the language layer; HAV provides the domain vocabulary
5. **Zero dependencies** — both ecosystems emphasize zero external dependencies
6. **Markdown as source** — flux-runtime compiles markdown to bytecode; cocapn agents live in markdown repos
7. **Self-improvement** — flux-runtime has evolution engine; cocapn agents self-modify their repos

### Complementary Roles

| Aspect | flux-runtime | cocapn/capitaine |
|--------|-------------|-----------------|
| Layer | Bytecode VM / compiler | Agent runtime / fleet coordination |
| Language | FLUX-ese, Lucineer Lang | Equipment Protocol, A2A |
| Execution | 64-register Micro-VM | Cloudflare Workers |
| Communication | A2A opcodes (bytecode-level) | A2A HTTP endpoints, git operations |
| Persistence | Binary files | Git repositories |
| Memory | Memory regions | Git history |
| Identity | N/A | Cryptographic git identity |

### Shared Architecture — The 8-Tier Model

The flux-runtime 8-tier architecture maps to the fleet:
- Tier 1 (Core: MD→FIR→Bytecode→VM) → Individual vessel execution
- Tier 3 (A2A Protocol) → Fleet coordination
- Tier 4 (Agent Runtime) → Heartbeat cycle
- Tier 5 (Tiles) → Equipment Protocol slots
- Tier 8 (Synthesis) → Fleet Command Center (cocapn.ai)

### flux-runtime-c

A C implementation of the FLUX VM exists in the Lucineer org (`Lucineer/flux-runtime-c`), bridging the Python reference implementation with the fleet's edge deployment needs.

---

## 6. Key Design Decisions

### Language Constraints
- **Confidence propagation is mandatory** — not optional metadata but a core type that affects all computation
- **Deliberation is first-class** — `consider`/`resolve` patterns are native control flow, not patterns
- **NLP ↔ Code isomorphism** — natural language and code compile to the same deliberation IR, making them interchangeable
- **Viewpoint-dependent vocabulary** — different domains get different words, but the same bytecode engine

### Viewpoint Encoding
- Every language makes assumptions about its users — FLUX/Lucineer assumes the user is an agent
- Confidence as a primitive means agents can reason about their own uncertainty
- The `tensor` type bundles value + confidence + alternatives + intent — a complete reasoning unit
- Error-as-signal pattern: errors don't crash programs, they reduce confidence and record learnings

### Git-Native Architecture
- No separate database — the git repository IS the data store
- No message queues — git commits ARE the communication channel
- No API authentication — GitHub tokens are the auth mechanism
- No deployment infrastructure — fork + deploy = instant agent

### Fleet Design
- **Specialization over generalization** — each vessel has a bounded domain
- **Autonomy with coordination** — vessels act independently but follow fleet-wide conventions
- **Brain region mapping** — vessels correspond to brain functions (hippocampus, motor cortex, prefrontal cortex, etc.)
- **Three-tier hierarchy** — Capital Ships → Support Vessels → Autonomous Drones
- **Size profiles** — motorcycle/pickup/semi/excavator determine resource allocation

### BYOK (Bring Your Own Key) Philosophy
- Zero vendor lock-in — connect any LLM provider
- The agent's intelligence is in its repo, not in a specific model
- Model is a citizen, not a dependency

---

## 7. Current State and Roadmap

### What's Built and Deployed

- **29 vessels** registered in the fleet command center (cocapn.ai)
- **39 Cloudflare Workers** live at the time of research
- **100+ repos** in the Lucineer organization
- **90+ repos** in the SuperInstance organization
- **1098 vocabulary terms** across 168 domains (HAV)
- **Capitaine Mark II** — flagship with 46 completed tasks, hydration layer restoration in progress
- **FLUX runtime** — 2037 tests, 11 language implementations, pip installable
- **Lucineer Lang** — design document complete, deliberation VM target specified
- **Frozen Intelligence** — full Python chip design toolchain (~500K chars)
- **CUDA toolchain** — ~90 Rust/CUDA modules
- **Nexus edge runtime** — ~14 Rust modules

### Active Development

- **Hydration Layer** restoration (Capitaine Phase 1, issue #56)
- **Éclaireur** (Scout vessel) — under development
- **flux-runtime evolution engine** — genome-based self-improvement
- **flux-runtime self-hosting** — FLUX compiling its own compiler
- **8-level fractal hot-reload** (Tier 7)

### Planned

- **Constructeur** (Builder vessel class) — code generation, scaffolding
- **Sentinelle** (Sentinel vessel class) — monitoring, alerting, security
- **Archiviste** (Archivist vessel class) — knowledge management, documentation
- **Mask-locked inference chip** — silicon-bound agent cognition
- **Full optimization passes** on FIR
- **JIT compilation** in flux-runtime
- **FluxSynthesizer** — wiring all 8 tiers together
- **Multi-agent fleet behaviors** — emergent intelligence from vessel coordination

### Key Metrics
- Fleet: 60+ vessels (badges claim), 100+ repos
- Fleet dashboard: the-fleet.casey-digennaro.workers.dev
- Cocapn.ai playground: cocapn-ai.casey-digennaro.workers.dev
- Flux-runtime: 2037 tests, zero deps, MIT license, Python 3.10+
- HAV: 1098 terms, 168 domains
- Cold starts: under 50ms on Cloudflare Workers
- Sequential request processing (specific limitation noted)

---

## Summary

The **capitaine/cocapn ecosystem** is a comprehensive agent-native computing platform built on the principle that "the repository IS the agent." It combines:

1. **A git-native agent architecture** (Superinstance pattern) where repos serve as body, memory, and nervous system
2. **A fleet coordination system** with 100+ specialized AI vessels organized in a three-tier hierarchy
3. **Natural language programming** through FLUX-ese (legalese for code), Lucineer Lang (confidence-first), and HAV (1098 compressed domain terms)
4. **A bytecode execution layer** (flux-runtime) with 104 opcodes, 64-register VM, and 11 language implementations
5. **Inter-agent protocols** (A2A, A2UI, A2C, MCP, Equipment Protocol) for fleet-wide coordination
6. **Hardware ambitions** including mask-locked inference chips, CUDA toolchain, and FPGA synthesis

The system represents one of the most ambitious attempts to create a complete agent-first computing ecosystem, from silicon to vocabulary, from individual vessels to coordinated fleets.
