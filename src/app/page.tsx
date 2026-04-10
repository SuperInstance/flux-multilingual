"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ALL_LANGUAGES,
  REGION_LABELS,
  REGION_COLORS,
  searchLanguages,
  type LanguageDefinition,
} from "@/lib/languages/index";
import { type VocabEntry, matchAllVocabulary } from "@/lib/flux/vocabulary";
import { encodeAssembly, type EncodedInstruction } from "@/lib/flux/encoder";
import { bytecodeToHex, disassemble, formatAssembly } from "@/lib/flux/decoder";
import { FluxVM, type ExecutionResult } from "@/lib/flux/vm";

// ============================================================
// Types
// ============================================================

interface CompileOutput {
  sourceText: string;
  vocabMatches: { entry: VocabEntry; captures: Record<string, string>; assembly: string }[];
  fullAssembly: string;
  bytecode: Uint8Array;
  hexDump: string;
  disasm: string;
  instructions: EncodedInstruction[];
  execution: ExecutionResult | null;
  error: string | null;
}

// ============================================================
// Compiler (runs in browser)
// ============================================================

function compile(text: string, lang: LanguageDefinition): CompileOutput {
  const vocabEntries: VocabEntry[] = lang.vocabulary.map((v, i) => ({
    pattern: v.pattern,
    assembly: v.assembly,
    resultReg: 0,
    name: v.name,
    description: v.description,
    tags: v.tags,
    level: 0,
    languageCode: lang.code,
  }));

  const matches = matchAllVocabulary(text, vocabEntries);

  if (matches.length === 0) {
    return {
      sourceText: text,
      vocabMatches: [],
      fullAssembly: "",
      bytecode: new Uint8Array(0),
      hexDump: "",
      disasm: "",
      instructions: [],
      execution: null,
      error: "No vocabulary matched. Try a different phrase or check examples below.",
    };
  }

  const fullAssembly = matches.map((m) => m.expandedAssembly).join("\n") + "\nHALT";

  let encoded;
  try {
    encoded = encodeAssembly(fullAssembly);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : "Assembly failed";
    return {
      sourceText: text,
      vocabMatches: matches.map((m) => ({ entry: m.entry, captures: m.captures, assembly: m.expandedAssembly })),
      fullAssembly,
      bytecode: new Uint8Array(0),
      hexDump: "",
      disasm: "",
      instructions: [],
      execution: null,
      error: errMsg,
    };
  }

  const vm = new FluxVM(encoded.bytecode);
  const execution = vm.execute();
  const disasmInstructions = disassemble(encoded.bytecode);

  return {
    sourceText: text,
    vocabMatches: matches.map((m) => ({ entry: m.entry, captures: m.captures, assembly: m.expandedAssembly })),
    fullAssembly,
    bytecode: encoded.bytecode,
    hexDump: bytecodeToHex(encoded.bytecode),
    disasm: formatAssembly(disasmInstructions),
    instructions: encoded.instructions,
    execution,
    error: execution.error,
  };
}

// ============================================================
// Components
// ============================================================

function RegionBadge({ region }: { region: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold"
      style={{ backgroundColor: REGION_COLORS[region] + "30", color: REGION_COLORS[region] }}
    >
      {region === "east-asian" ? "East Asian" : region === "african" ? "African" : region === "indian" ? "Indian" : region === "americas" ? "Americas" : region === "constructed" ? "Constructed" : "European"}
    </span>
  );
}

function LanguageCard({
  lang,
  selected,
  onClick,
}: {
  lang: LanguageDefinition;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
        selected
          ? "bg-gray-800 border-blue-500 ring-2 ring-blue-500/30"
          : "bg-gray-900 border-gray-700 hover:border-gray-500 hover:bg-gray-800"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-semibold text-sm">{lang.name}</span>
        <RegionBadge region={lang.region} />
      </div>
      <div className="text-gray-400 text-xs mb-1" dir="auto">{lang.nativeName}</div>
      <div className="text-gray-500 text-xs">{lang.paradigm}</div>
    </button>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState<LanguageDefinition | null>(null);
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState<CompileOutput | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>("all");

  const filteredLanguages = useMemo(() => {
    let langs = search ? searchLanguages(search) : ALL_LANGUAGES;
    if (activeRegion !== "all") langs = langs.filter((l) => l.region === activeRegion);
    return langs;
  }, [search, activeRegion]);

  const handleSelectLanguage = useCallback((lang: LanguageDefinition) => {
    setSelectedLang(lang);
    setInputText(lang.sampleProgram);
    setOutput(null);
  }, []);

  const handleCompile = useCallback(() => {
    if (!selectedLang || !inputText.trim()) return;
    const result = compile(inputText, selectedLang);
    setOutput(result);
  }, [selectedLang, inputText]);

  const totalLanguages = ALL_LANGUAGES.length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                FLUX Multilingual NL Programming
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Different languages, different shells, same bytecode DNA
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{totalLanguages}</div>
              <div className="text-gray-500 text-xs">languages compiled to FLUX VM</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {Object.entries(REGION_LABELS).map(([region, label]) => (
            <button
              key={region}
              onClick={() => setActiveRegion(activeRegion === region ? "all" : region)}
              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                activeRegion === region
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
              }`}
            >
              <div className="font-bold text-sm">{ALL_LANGUAGES.filter((l) => l.region === region).length}</div>
              <div className="truncate">{label.split("(")[0].trim()}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search languages by name, script, paradigm, or family..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Language list */}
          <div className="lg:col-span-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 space-y-1 scrollbar-thin">
            {filteredLanguages.map((lang) => (
              <LanguageCard
                key={lang.code}
                lang={lang}
                selected={selectedLang?.code === lang.code}
                onClick={() => handleSelectLanguage(lang)}
              />
            ))}
            {filteredLanguages.length === 0 && (
              <div className="text-gray-500 text-center py-8">No languages found</div>
            )}
          </div>

          {/* Right: Compiler + Output */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedLang ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🦀</div>
                <h2 className="text-xl font-bold text-gray-300 mb-2">Select a Language</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Choose any language from the list to see how its grammatical constraints
                  enable a unique programming paradigm. Every language compiles to the same
                  FLUX bytecode VM — the hermit crab architecture.
                </p>
              </div>
            ) : (
              <>
                {/* Language info */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-lg font-bold text-white">{selectedLang.name}</h2>
                    <span className="text-gray-400" dir="auto">{selectedLang.nativeName}</span>
                    <RegionBadge region={selectedLang.region} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Script:</span>{" "}
                      <span className="text-gray-300">{selectedLang.script}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Family:</span>{" "}
                      <span className="text-gray-300">{selectedLang.family}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500">Paradigm:</span>{" "}
                      <span className="text-blue-300 font-medium">{selectedLang.paradigm}</span>
                    </div>
                    <div className="md:col-span-2 text-gray-400 text-xs leading-relaxed">
                      {selectedLang.paradigmDesc.slice(0, 300)}...
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 text-xs">Key Constraint:</span>{" "}
                      <span className="text-yellow-300 text-xs font-medium">{selectedLang.grammaticalConstraint}</span>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Natural Language Input ({selectedLang.nativeName})
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                    dir="auto"
                    placeholder={`Type in ${selectedLang.name}...`}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-gray-600 text-xs">
                      {selectedLang.sampleTranslation}
                    </span>
                    <button
                      onClick={handleCompile}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                    >
                      Compile & Run
                    </button>
                  </div>
                </div>

                {/* Vocabulary examples */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    Available Vocabulary ({selectedLang.vocabulary.length} patterns)
                  </h3>
                  <div className="space-y-1">
                    {selectedLang.vocabulary.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setInputText(v.example)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors cursor-pointer group"
                      >
                        <code className="text-blue-300 text-sm font-mono flex-1" dir="auto">{v.example}</code>
                        <span className="text-gray-600 text-xs group-hover:text-gray-400">{v.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output */}
                {output && (
                  <div className="space-y-4">
                    {/* Error */}
                    {output.error && !output.execution?.success && (
                      <div className="bg-red-950/50 border border-red-800 rounded-xl p-4">
                        <div className="text-red-400 font-semibold text-sm">Error</div>
                        <div className="text-red-300 text-sm mt-1">{output.error}</div>
                      </div>
                    )}

                    {/* Result */}
                    {output.execution?.success && (
                      <div className="bg-green-950/50 border border-green-800 rounded-xl p-4">
                        <div className="text-green-400 font-semibold text-sm">Result</div>
                        <div className="text-green-200 text-2xl font-mono font-bold mt-1">
                          R0 = {output.execution.result}
                        </div>
                        <div className="text-green-600 text-xs mt-1">
                          {output.execution.cycles} cycles executed
                        </div>
                      </div>
                    )}

                    {/* Vocab matches */}
                    {output.vocabMatches.length > 0 && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Vocabulary Matches</h3>
                        {output.vocabMatches.map((m, i) => (
                          <div key={i} className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-semibold">
                                {m.entry.name}
                              </span>
                              <code className="text-gray-300 text-xs font-mono" dir="auto">
                                {m.entry.pattern}
                              </code>
                            </div>
                            <pre className="bg-gray-950 rounded-lg p-2 text-xs font-mono text-green-400 overflow-x-auto">
                              {m.assembly}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Assembly */}
                    {output.fullAssembly && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Generated Assembly</h3>
                        <pre className="bg-gray-950 rounded-lg p-3 text-xs font-mono text-yellow-300 overflow-x-auto whitespace-pre">
                          {output.fullAssembly}
                        </pre>
                      </div>
                    )}

                    {/* Bytecode hex dump */}
                    {output.hexDump && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Bytecode (hex)</h3>
                        <pre className="bg-gray-950 rounded-lg p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
                          {output.hexDump}
                        </pre>
                      </div>
                    )}

                    {/* Disassembly */}
                    {output.disasm && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Disassembly</h3>
                        <pre className="bg-gray-950 rounded-lg p-3 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre">
                          {output.disasm}
                        </pre>
                      </div>
                    )}

                    {/* Register state */}
                    {output.execution && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Register State (non-zero)</h3>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
                          {output.execution.registers.map((val, i) =>
                            val !== 0 ? (
                              <div key={i} className="bg-gray-950 rounded px-2 py-1 text-center">
                                <div className="text-gray-500 text-xs">R{i}</div>
                                <div className="text-orange-300 font-mono text-sm font-bold">{val}</div>
                              </div>
                            ) : null
                          )}
                        </div>
                        {output.execution.registers.every((v) => v === 0) && (
                          <div className="text-gray-600 text-xs">All registers zero</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-xs">
            Based on{" "}
            <a href="https://github.com/SuperInstance/flux-runtime" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              FLUX Runtime
            </a>{" "}
            by Casey Digennaro — Fluid Language Universal eXecution
          </p>
          <p className="text-gray-700 text-xs mt-1">
            Same bytecode, different shells, same crab.
          </p>
        </div>
      </footer>
    </div>
  );
}
