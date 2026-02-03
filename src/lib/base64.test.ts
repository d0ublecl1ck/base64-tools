import { describe, expect, it } from "vitest";

import {
  decodeBase64ToBytes,
  decodeBase64ToText,
  encodeBase64Text,
  estimateBase64BytesLength,
  guessImageMimeFromBase64,
  normalizeBase64,
  parseDataUrl,
} from "./base64";

describe("parseDataUrl", () => {
  it("returns null for non data URL", () => {
    expect(parseDataUrl("hello")).toBeNull();
  });

  it("parses mime and base64 payload", () => {
    const result = parseDataUrl("data:image/png;base64,iVBORw0KGgo=");
    expect(result).toEqual({ mime: "image/png", base64: "iVBORw0KGgo=" });
  });

  it("returns null for non-base64 data URL", () => {
    expect(parseDataUrl("data:text/plain,hello")).toBeNull();
  });
});

describe("normalizeBase64", () => {
  it("normalizes url-safe base64 and adds padding", () => {
    expect(normalizeBase64("SGVsbG8", { urlSafe: true })).toBe("SGVsbG8=");
    expect(normalizeBase64("SGVsbG8_", { urlSafe: true })).toBe("SGVsbG8/");
  });

  it("removes whitespace by default", () => {
    expect(normalizeBase64("a G V s b G 8 =")).toBe("aGVsbG8=");
  });

  it("strips data url prefix by default", () => {
    expect(normalizeBase64("data:text/plain;base64,aGVsbG8=")).toBe("aGVsbG8=");
  });
});

describe("text encode/decode", () => {
  it("encodes text into base64", () => {
    expect(encodeBase64Text("hello")).toBe("aGVsbG8=");
  });

  it("decodes base64 to utf-8 text", () => {
    expect(decodeBase64ToText("aGVsbG8=")).toBe("hello");
  });

  it("decodes base64 to bytes", () => {
    const bytes = decodeBase64ToBytes("aGVsbG8=");
    expect(Array.from(bytes)).toEqual([104, 101, 108, 108, 111]);
  });

  it("estimates decoded byte length", () => {
    expect(estimateBase64BytesLength("aGVsbG8=")).toBe(5);
    expect(estimateBase64BytesLength("aGVsbG8")).toBe(5);
  });
});

describe("guessImageMimeFromBase64", () => {
  it("detects png", () => {
    const base64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString(
      "base64",
    );
    expect(guessImageMimeFromBase64(base64)).toBe("image/png");
  });

  it("detects jpeg", () => {
    const base64 = Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x11]).toString("base64");
    expect(guessImageMimeFromBase64(base64)).toBe("image/jpeg");
  });

  it("detects webp", () => {
    const bytes = Buffer.from("RIFF1234WEBP", "ascii");
    const base64 = bytes.toString("base64");
    expect(guessImageMimeFromBase64(base64)).toBe("image/webp");
  });

  it("detects svg", () => {
    const base64 = Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>", "utf8").toString(
      "base64",
    );
    expect(guessImageMimeFromBase64(base64)).toBe("image/svg+xml");
  });
});

