import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "../embeddings";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 10);
  });

  it("returns -1 for opposite vectors", () => {
    const a = [1, 0, 0];
    const b = [-1, 0, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 10);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0, 10);
  });

  it("is scale-invariant", () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const bScaled = [8, 10, 12];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(a, bScaled), 10);
  });

  it("handles normalized embedding-like vectors", () => {
    // Simulate 384-dim normalized vectors
    const a = new Array(384).fill(0).map((_, i) => Math.sin(i));
    const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const aNorm = a.map((v) => v / normA);

    const b = new Array(384).fill(0).map((_, i) => Math.cos(i));
    const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    const bNorm = b.map((v) => v / normB);

    const sim = cosineSimilarity(aNorm, bNorm);
    expect(sim).toBeGreaterThanOrEqual(-1);
    expect(sim).toBeLessThanOrEqual(1);
  });

  it("returns NaN for zero vectors", () => {
    const zero = [0, 0, 0];
    const v = [1, 2, 3];
    expect(cosineSimilarity(zero, v)).toBeNaN();
  });
});
