import { describe, it, expect } from "vitest";
import {
  matchVocabulary,
  expandAssembly,
  matchAllVocabulary,
  VocabEntry,
} from "./vocabulary";

const testEntries: VocabEntry[] = [
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
  {
    pattern: "show $val",
    assembly: "MOVI R0, $val\nPRINT R0",
    resultReg: 0,
    name: "print",
    description: "Print a value",
    tags: ["io"],
    level: 0,
    languageCode: "universal",
    example: "show 42",
  },
];

describe("matchVocabulary", () => {
  it("matches simple pattern like '3 plus 5'", () => {
    const match = matchVocabulary("3 plus 5", testEntries);
    expect(match).not.toBeNull();
    expect(match!.entry.name).toBe("add");
    expect(match!.captures).toEqual({ a: "3", b: "5" });
  });

  it("returns null when no pattern matches", () => {
    const match = matchVocabulary("unknown command", testEntries);
    expect(match).toBeNull();
  });

  it("matches pattern regardless of entry order", () => {
    const match = matchVocabulary("4 times 6", testEntries);
    expect(match).not.toBeNull();
    expect(match!.entry.name).toBe("multiply");
  });
});

describe("expandAssembly", () => {
  it("substitutes $var templates", () => {
    const result = expandAssembly("MOVI R0, $a", { a: "42" });
    expect(result).toBe("MOVI R0, 42");
  });

  it("substitutes ${var} brace templates", () => {
    const result = expandAssembly("MOVI R0, ${x}", { x: "99" });
    expect(result).toBe("MOVI R0, 99");
  });

  it("substitutes multiple variables", () => {
    const result = expandAssembly("MOVI R0, $a\nMOVI R1, $b", { a: "3", b: "5" });
    expect(result).toBe("MOVI R0, 3\nMOVI R1, 5");
  });
});

describe("matchAllVocabulary", () => {
  it("handles multi-line input", () => {
    const text = "3 plus 5\n4 times 6\nshow 100";
    const matches = matchAllVocabulary(text, testEntries);
    expect(matches).toHaveLength(3);
    expect(matches[0].entry.name).toBe("add");
    expect(matches[1].entry.name).toBe("multiply");
    expect(matches[2].entry.name).toBe("print");
  });

  it("skips comments and blank lines", () => {
    const text = "-- comment\n3 plus 5\n\n// another comment\n4 times 6";
    const matches = matchAllVocabulary(text, testEntries);
    expect(matches).toHaveLength(2);
  });

  it("returns empty array for no matches", () => {
    const matches = matchAllVocabulary("nothing matches here", testEntries);
    expect(matches).toHaveLength(0);
  });
});
