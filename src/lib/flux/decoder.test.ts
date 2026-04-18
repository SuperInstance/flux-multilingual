import { describe, it, expect } from "vitest";
import { disassemble, bytecodeToHex, formatAssembly } from "./decoder";
import { encodeAssembly } from "./encoder";
import { Op } from "./opcodes";

describe("disassemble", () => {
  it("disassembles MOVI R0, 42 back correctly", () => {
    // MOVI R0, 42 → [0x2B, 0x00, 0x2A, 0x00]
    const bytecode = new Uint8Array([0x2b, 0x00, 0x2a, 0x00]);
    const instructions = disassemble(bytecode);
    expect(instructions).toHaveLength(1);
    expect(instructions[0].mnemonic).toBe("MOVI");
    expect(instructions[0].operands).toBe("R0, 42");
    expect(instructions[0].offset).toBe(0);
    expect(instructions[0].size).toBe(4);
  });

  it("handles all instruction formats (zero, single, double, triple, imm, jump)", () => {
    const assembly = [
      "HALT",           // 1 byte (zero-operand)
      "INC R5",         // 2 bytes (single reg)
      "MOV R0, R1",     // 3 bytes (two reg)
      "IADD R2, R3, R4", // 4 bytes (three reg)
      "MOVI R0, 100",   // 4 bytes (imm)
      "JMP 0",          // 3 bytes (jump)
    ].join("\n");
    const { bytecode } = encodeAssembly(assembly);
    const instructions = disassemble(bytecode);

    expect(instructions[0].mnemonic).toBe("HALT");
    expect(instructions[0].size).toBe(1);

    expect(instructions[1].mnemonic).toBe("INC");
    expect(instructions[1].operands).toBe("R5");
    expect(instructions[1].size).toBe(2);

    expect(instructions[2].mnemonic).toBe("MOV");
    expect(instructions[2].operands).toBe("R0, R1");
    expect(instructions[2].size).toBe(3);

    expect(instructions[3].mnemonic).toBe("IADD");
    expect(instructions[3].operands).toBe("R2, R3, R4");
    expect(instructions[3].size).toBe(4);

    expect(instructions[4].mnemonic).toBe("MOVI");
    expect(instructions[4].operands).toBe("R0, 100");
    expect(instructions[4].size).toBe(4);

    expect(instructions[5].mnemonic).toBe("JMP");
    expect(instructions[5].operands).toBe("0");
    expect(instructions[5].size).toBe(3);
  });

  it("bytecodeToHex formats correctly", () => {
    const bytecode = new Uint8Array([0x00, 0x2b, 0x08, 0xff]);
    expect(bytecodeToHex(bytecode)).toBe("00 2b 08 ff");
  });

  it("round-trip: encode then disassemble gives same mnemonics", () => {
    const assembly = "MOVI R0, 10\nMOVI R1, 20\nIADD R0, R0, R1\nHALT";
    const { bytecode } = encodeAssembly(assembly);
    const instructions = disassemble(bytecode);

    const mnemonics = instructions.map((i) => `${i.mnemonic} ${i.operands}`.trim());
    expect(mnemonics[0]).toBe("MOVI R0, 10");
    expect(mnemonics[1]).toBe("MOVI R1, 20");
    expect(mnemonics[2]).toBe("IADD R0, R0, R1");
    expect(mnemonics[3]).toBe("HALT");
  });

  it("formatAssembly produces readable output", () => {
    const bytecode = new Uint8Array([0x2b, 0x00, 0x2a, 0x00, 0xff]);
    const instructions = disassemble(bytecode);
    const formatted = formatAssembly(instructions);
    expect(formatted).toContain("MOVI");
    expect(formatted).toContain("R0, 42");
    expect(formatted).toContain("HALT");
  });
});
