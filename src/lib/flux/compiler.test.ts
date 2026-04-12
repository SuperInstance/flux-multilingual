import { describe, it, expect } from "vitest";
import { FluxCompiler } from "./compiler";
import { VocabEntry } from "./vocabulary";

const testVocab: VocabEntry[] = [
  {
    pattern: "$a plus $b",
    assembly: "MOVI R0, $a\nMOVI R1, $b\nIADD R0, R0, R1",
    resultReg: 0,
    name: "add",
    description: "Add two numbers",
    tags: ["arithmetic"],
    level: 0,
    languageCode: "universal",
    example: "3 plus 5",
  },
  {
    pattern: "$x times $y",
    assembly: "MOVI R0, $x\nMOVI R1, $y\nIMUL R0, R0, R1",
    resultReg: 0,
    name: "multiply",
    description: "Multiply two numbers",
    tags: ["arithmetic"],
    level: 0,
    languageCode: "universal",
    example: "4 times 6",
  },
];

describe("FluxCompiler", () => {
  it("compiles a natural language expression and returns result", () => {
    const compiler = new FluxCompiler(testVocab);
    const result = compiler.compile("3 plus 5", "universal");
    expect(result.success).toBe(true);
    expect(result.matchesCount).toBe(1);
    expect(result.bytecode).not.toBeNull();
    expect(result.execution).not.toBeNull();
    expect(result.execution!.result).toBe(8);
    expect(result.hexDump).toBeTruthy();
    expect(result.disassembly).toBeTruthy();
  });

  it("returns error for unrecognized input", () => {
    const compiler = new FluxCompiler(testVocab);
    const result = compiler.compile("foobar xyz", "universal");
    expect(result.success).toBe(false);
    expect(result.error).toContain("No vocabulary pattern matched");
    expect(result.bytecode).toBeNull();
    expect(result.execution).toBeNull();
    expect(result.matchesCount).toBe(0);
  });
});
