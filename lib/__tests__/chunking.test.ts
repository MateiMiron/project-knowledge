import { describe, it, expect } from "vitest";
import { chunkText } from "../chunking";

describe("chunkText", () => {
  it("returns a single chunk for short text", () => {
    const result = chunkText("Hello world");
    expect(result).toEqual([{ text: "Hello world", index: 0 }]);
  });

  it("trims whitespace", () => {
    const result = chunkText("  Hello world  ");
    expect(result).toEqual([{ text: "Hello world", index: 0 }]);
  });

  it("collapses triple+ newlines to double", () => {
    const result = chunkText("Hello\n\n\n\nworld");
    expect(result).toEqual([{ text: "Hello\n\nworld", index: 0 }]);
  });

  it("returns single chunk when text is exactly 800 chars", () => {
    const text = "a".repeat(800);
    const result = chunkText(text);
    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(0);
  });

  it("splits long text into multiple chunks with correct indices", () => {
    // Create text with multiple paragraphs that exceed 800 chars
    const paragraphs = Array.from({ length: 10 }, (_, i) =>
      `Paragraph ${i + 1}: ${"lorem ipsum dolor sit amet ".repeat(6).trim()}`
    );
    const text = paragraphs.join("\n\n");

    const result = chunkText(text);
    expect(result.length).toBeGreaterThan(1);

    // Indices should be sequential starting at 0
    result.forEach((chunk, i) => {
      expect(chunk.index).toBe(i);
    });
  });

  it("includes overlap between chunks", () => {
    const paragraphs = Array.from({ length: 10 }, (_, i) =>
      `Paragraph ${i + 1}: ${"lorem ipsum dolor sit amet ".repeat(6).trim()}`
    );
    const text = paragraphs.join("\n\n");

    const result = chunkText(text);
    if (result.length >= 2) {
      // The end of chunk 0 should overlap with the beginning of chunk 1
      const lastWordsOfFirst = result[0].text.split(/\s+/).slice(-5).join(" ");
      expect(result[1].text).toContain(lastWordsOfFirst);
    }
  });

  it("handles empty string", () => {
    const result = chunkText("");
    expect(result).toEqual([{ text: "", index: 0 }]);
  });

  it("handles text with no paragraph breaks", () => {
    const text = "a".repeat(1600);
    const result = chunkText(text);
    // No paragraph breaks means it stays as one chunk (won't split mid-paragraph)
    expect(result).toHaveLength(1);
  });
});
