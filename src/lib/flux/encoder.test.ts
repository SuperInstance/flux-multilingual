import { describe, it, expect } from "vitest";
import { encodeAssembly, quickEncode } from "./encoder";
import { Op } from "./opcodes";

describe("encodeAssembly", () => {
  it("encodes MOVI R0, 42 correctly", () => {
    const { bytecode, instructions, labels } = encodeAssembly("MOVI R0, 42");
    // MOVI = 0x2B, R0=0, 42 & 0xff = 42, (42 >> 8) & 0xff = 0
    expect(Array.from(bytecode)).toEqual([0x2b, 0, 42, 0]);
    expect(instructions).toHaveLength(1);
    expect(instructions[0].mnemonic).toBe("MOVI");
    expect(instructions[0].operands).toEqual([0, 42]);
    expect(instructions[0].size).toBe(4);
  });

  it("encodes IADD R0, R0, R1 correctly", () => {
    const { bytecode, instructions } = encodeAssembly("IADD R0, R0, R1");
    // IADD = 0x08, R0=0, R0=0, R1=1
    expect(Array.from(bytecode)).toEqual([0x08, 0, 0, 1]);
    expect(instructions).toHaveLength(1);
    expect(instructions[0].mnemonic).toBe("IADD");
    expect(instructions[0].operands).toEqual([0, 0, 1]);
    expect(instructions[0].size).toBe(4);
  });

  it("encodes HALT (zero-operand instruction)", () => {
    const { bytecode, instructions } = encodeAssembly("HALT");
    // HALT = 0xFF
    expect(Array.from(bytecode)).toEqual([0xff]);
    expect(instructions).toHaveLength(1);
    expect(instructions[0].mnemonic).toBe("HALT");
    expect(instructions[0].operands).toEqual([]);
    expect(instructions[0].size).toBe(1);
  });

  it("handles labels and forward jumps", () => {
    const assembly = `JMP end\nMOVI R0, 42\nend:\nHALT`;
    const { bytecode, labels } = encodeAssembly(assembly);
    // Label 'end' maps to instruction index 2 (HALT is the 3rd instruction)
    expect(labels.get("end")).toBe(2);
    // Verify JMP encodes the label address
    expect(bytecode[0]).toBe(Op.JMP);
    const addr = bytecode[1] | (bytecode[2] << 8);
    expect(addr).toBe(2);
  });

  it("handles comments and blank lines", () => {
    const assembly = `-- This is a comment\n// Another comment\n\nMOVI R0, 1\nHALT`;
    const { bytecode, instructions } = encodeAssembly(assembly);
    expect(instructions).toHaveLength(2);
    expect(instructions[0].mnemonic).toBe("MOVI");
    expect(instructions[1].mnemonic).toBe("HALT");
  });

  it("quickEncode returns bytecode Uint8Array", () => {
    const bc = quickEncode("MOVI R0, 99");
    expect(bc).toBeInstanceOf(Uint8Array);
    expect(bc[0]).toBe(Op.MOVI);
    expect(bc[1]).toBe(0);
    expect(bc[2]).toBe(99);
  });
});
