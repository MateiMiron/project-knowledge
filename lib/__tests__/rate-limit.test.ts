import { describe, it, expect, vi, beforeEach } from "vitest";

// Re-import fresh module for each test to reset the in-memory store
let checkRateLimit: typeof import("../rate-limit").checkRateLimit;
let getRemainingQueries: typeof import("../rate-limit").getRemainingQueries;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("../rate-limit");
  checkRateLimit = mod.checkRateLimit;
  getRemainingQueries = mod.getRemainingQueries;
});

describe("checkRateLimit", () => {
  it("allows first request and returns 9 remaining", () => {
    const result = checkRateLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("tracks count across multiple calls", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("user-2");
    }
    const result = checkRateLimit("user-2");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // 10 - 6
  });

  it("blocks after 10 requests", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-3");
    }
    const result = checkRateLimit("user-3");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("isolates different identifiers", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-A");
    }
    const result = checkRateLimit("user-B");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("resets after expiry", () => {
    vi.useFakeTimers();
    checkRateLimit("user-4");
    // Advance past 24 hours
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);
    const result = checkRateLimit("user-4");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    vi.useRealTimers();
  });
});

describe("getRemainingQueries", () => {
  it("returns 10 for unknown identifier", () => {
    expect(getRemainingQueries("unknown")).toBe(10);
  });

  it("returns correct remaining after some usage", () => {
    checkRateLimit("user-5");
    checkRateLimit("user-5");
    checkRateLimit("user-5");
    expect(getRemainingQueries("user-5")).toBe(7);
  });

  it("returns 0 when fully exhausted", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-6");
    }
    expect(getRemainingQueries("user-6")).toBe(0);
  });

  it("returns 10 after expiry", () => {
    vi.useFakeTimers();
    checkRateLimit("user-7");
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);
    expect(getRemainingQueries("user-7")).toBe(10);
    vi.useRealTimers();
  });
});
