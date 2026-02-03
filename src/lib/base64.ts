export type Base64NormalizeOptions = {
  urlSafe?: boolean;
  ignoreWhitespace?: boolean;
  stripDataUrlPrefix?: boolean;
};

type DataUrlParts = {
  mime: string;
  base64: string;
};

export function parseDataUrl(input: string): DataUrlParts | null {
  const trimmed = input.trim();
  if (!trimmed.toLowerCase().startsWith("data:")) return null;

  const commaIndex = trimmed.indexOf(",");
  if (commaIndex === -1) return null;

  const meta = trimmed.slice(5, commaIndex);
  const data = trimmed.slice(commaIndex + 1);

  const metaParts = meta.split(";");
  const mime = (metaParts[0] || "text/plain").trim() || "text/plain";
  const isBase64 = metaParts.some((p) => p.trim().toLowerCase() === "base64");
  if (!isBase64) return null;

  return { mime, base64: data };
}

function addBase64Padding(base64: string) {
  const mod = base64.length % 4;
  if (mod === 0) return base64;
  return base64 + "=".repeat(4 - mod);
}

export function normalizeBase64(
  input: string,
  {
    urlSafe = true,
    ignoreWhitespace = true,
    stripDataUrlPrefix = true,
  }: Base64NormalizeOptions = {},
) {
  let value = input.trim();

  if (stripDataUrlPrefix) {
    const parsed = parseDataUrl(value);
    if (parsed) value = parsed.base64;
  }

  if (ignoreWhitespace) value = value.replace(/\s+/g, "");

  if (urlSafe) {
    value = value.replace(/-/g, "+").replace(/_/g, "/");
  }

  return addBase64Padding(value);
}

export function encodeBase64Text(
  text: string,
  { urlSafe = false, stripPadding = false }: { urlSafe?: boolean; stripPadding?: boolean } = {},
) {
  const bytes = new TextEncoder().encode(text);

  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  let base64 = btoa(binary);
  if (urlSafe) base64 = base64.replace(/\+/g, "-").replace(/\//g, "_");
  if (stripPadding) base64 = base64.replace(/=+$/g, "");

  return base64;
}

export function decodeBase64ToBytes(base64Input: string, options?: Base64NormalizeOptions) {
  const base64 = normalizeBase64(base64Input, options);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function decodeBase64ToText(base64Input: string, options?: Base64NormalizeOptions) {
  const bytes = decodeBase64ToBytes(base64Input, options);
  return new TextDecoder().decode(bytes);
}

export function estimateBase64BytesLength(base64Input: string, options?: Base64NormalizeOptions) {
  const normalized = normalizeBase64(base64Input, options);
  const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
}

function startsWithBytes(bytes: Uint8Array, signature: number[]) {
  if (bytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i += 1) {
    if (bytes[i] !== signature[i]) return false;
  }
  return true;
}

export function guessImageMimeFromBase64(base64Input: string) {
  let bytes: Uint8Array;
  try {
    const normalized = normalizeBase64(base64Input, {
      ignoreWhitespace: true,
      urlSafe: true,
      stripDataUrlPrefix: true,
    });
    const head = normalized.slice(0, 180);
    const binary = atob(addBase64Padding(head));
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  } catch {
    return undefined;
  }

  if (startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (startsWithBytes(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWithBytes(bytes, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (startsWithBytes(bytes, [0x42, 0x4d])) return "image/bmp";
  if (startsWithBytes(bytes, [0x00, 0x00, 0x01, 0x00])) return "image/x-icon";

  // WebP: "RIFF....WEBP"
  if (
    startsWithBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  // SVG: decode a short prefix and look for <svg
  try {
    const prefixText = new TextDecoder().decode(bytes);
    if (/<svg[\s>]/i.test(prefixText)) return "image/svg+xml";
  } catch {
    // ignore
  }

  return undefined;
}

