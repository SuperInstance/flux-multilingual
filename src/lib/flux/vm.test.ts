import { describe, it, expect } from "vitest";
import { FluxVM, quickExec } from "./vm";
import { encodeAssembly } from "./encoder";

describe("FluxVM", () => {
  it("MOVI R0, 42; HALT → R0 contains 42", () => {
    const { bytecode } = encodeAssembly("MOVI R0, 42\nHALT");
    const vm = new FluxVM(bytecode);
    const result = vm.execute();
    expect(result.success).toBe(true);
    expect(result.halted).toBe(true);
    expect(result.registers[0]).toBe(42);
    expect(result.error).toBeNull();
  });

  it("IADD 3 + 5 = 8", () => {
    const { bytecode } = encodeAssembly(
      "MOVI R0, 3\nMOVI R1, 5\nIADD R2, R0, R1\nHALT"
    );
    const vm = new FluxVM(bytecode);
    const result = vm.execute();
    expect(result.success).toBe(true);
    expect(result.registers[2]).toBe(8);
  });

  it("IDIV 10 / 3 = 3 (integer truncation)", () => {
    const { bytecode } = encodeAssembly(
      "MOVI R0, 10\nMOVI R1, 3\nIDIV R2, R0, R1\nHALT"
    );
    const vm = new FluxVM(bytecode);
    const result = vm.execute();
    expect(result.success).toBe(true);
    expect(result.registers[2]).toBe(3);
  });

  it("division by zero halts with error", () => {
    const { bytecode } = encodeAssembly(
      "MOVI R0, 10\nMOVI R1, 0\nIDIV R2, R0, R1\nHALT"
    );
    const vm = new FluxVM(bytecode);
    const result = vm.execute();
    expect(result.success).toBe(false);
    expect(result.error).toBe("Division by zero");
    expect(result.halted).toBe(true);
  });

  it("max cycles exceeded returns error", () => {
    // Infinite loop: JMP 0 back to itself
    const { bytecode } = encodeAssembly("JMP 0");
    const vm = new FluxVM(bytecode, { maxCycles: 100 });
    const result = vm.execute();
    expect(result.success).toBe(false);
    expect(result.error).toBe("Max cycles exceeded");
  });

  it("quickExec convenience function works", () => {
    const result = quickExec("MOVI R0, 99\nHALT");
    expect(result.success).toBe(true);
    expect(result.result).toBe(99);
  });
});
