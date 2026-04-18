import { describe, it, expect } from "vitest";
import {
  getLanguageByCode,
  searchLanguages,
  ALL_LANGUAGES,
} from "./index";

describe("getLanguageByCode", () => {
  it("returns correct language for known code", () => {
    const lang = getLanguageByCode("zho");
    expect(lang).toBeDefined();
    expect(lang!.code).toBe("zho");
    expect(lang!.name).toBe("Chinese");
  });

  it("returns undefined for unknown code", () => {
    const lang = getLanguageByCode("zzz999");
    expect(lang).toBeUndefined();
  });

  it("ALL_LANGUAGES is a non-empty array", () => {
    expect(ALL_LANGUAGES.length).toBeGreaterThan(0);
    expect(Array.isArray(ALL_LANGUAGES)).toBe(true);
  });
});

describe("searchLanguages", () => {
  it("finds matches by name", () => {
    const results = searchLanguages("Chinese");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((l) => l.code === "zho")).toBe(true);
  });

  it("finds matches by code", () => {
    const results = searchLanguages("jpn");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((l) => l.code === "jpn")).toBe(true);
  });

  it("returns empty for no matches", () => {
    const results = searchLanguages("zzznonexistent999");
    expect(results).toHaveLength(0);
  });

  it("search is case-insensitive", () => {
    const results = searchLanguages("JAPANESE");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((l) => l.code === "jpn")).toBe(true);
  });
});
