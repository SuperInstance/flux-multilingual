import { describe, it, expect } from "vitest";
import { TilingEngine, Tile } from "./tiling";
import { VocabEntry } from "./vocabulary";

const baseEntries: VocabEntry[] = [
  {
    pattern: "$a plus $b",
    assembly: "MOVI R0, $a\nMOVI R1, $b\nIADD R0, R0, R1",
    resultReg: 0,
    name: "add",
    description: "Add two numbers",
    tags: ["arithmetic"],
    level: 0,
    languageCode: "universal",
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
  },
];

const composedTile: Tile = {
  ...baseEntries[0],
  name: "sum-of-products",
  pattern: "sum of $a and $b",
  assembly: "MOVI R0, $a\nMOVI R1, $b\nIADD R0, R0, R1",
  resultReg: 0,
  description: "Sum two values",
  tags: ["composed"],
  level: 1,
  languageCode: "universal",
  depends: ["add"],
};

describe("TilingEngine", () => {
  it("compose resolves dependency chain", () => {
    const engine = new TilingEngine(baseEntries);
    engine.registerTile(composedTile);

    const composition = engine.compose("sum-of-products");
    expect(composition).toHaveLength(2);
    // Dependencies come first, then the tile itself
    expect(composition[0].name).toBe("add");
    expect(composition[0].level).toBe(0);
    expect(composition[1].name).toBe("sum-of-products");
    expect(composition[1].level).toBe(1);
    expect(composition[1].depends).toEqual(["add"]);
    expect(composition[1].resolvedLevels).toEqual([0]);
  });

  it("compose returns empty for unknown tile", () => {
    const engine = new TilingEngine(baseEntries);
    expect(engine.compose("nonexistent")).toHaveLength(0);
  });

  it("matchHighestTile returns highest-level match", () => {
    const engine = new TilingEngine(baseEntries);
    engine.registerTile(composedTile);

    // "3 plus 5" matches both "add" (level 0) and possibly composed tiles
    // But since "sum-of-products" has pattern "sum of $a and $b", it won't match "3 plus 5"
    const addMatch = engine.matchHighestTile("3 plus 5", "universal");
    expect(addMatch).not.toBeNull();
    expect(addMatch!.name).toBe("add");

    // "sum of 3 and 5" should match the level 1 tile
    const composedMatch = engine.matchHighestTile("sum of 3 and 5", "universal");
    expect(composedMatch).not.toBeNull();
    expect(composedMatch!.name).toBe("sum-of-products");
    expect(composedMatch!.level).toBe(1);
  });

  it("getMaxLevel returns highest tile level", () => {
    const engine = new TilingEngine(baseEntries);
    expect(engine.getMaxLevel()).toBe(0);

    engine.registerTile(composedTile);
    expect(engine.getMaxLevel()).toBe(1);
  });

  it("getTilesByLevel filters correctly", () => {
    const engine = new TilingEngine(baseEntries);
    expect(engine.getTilesByLevel(0)).toHaveLength(2);

    engine.registerTile(composedTile);
    expect(engine.getTilesByLevel(1)).toHaveLength(1);
    expect(engine.getTilesByLevel(1)[0].name).toBe("sum-of-products");
  });
});
