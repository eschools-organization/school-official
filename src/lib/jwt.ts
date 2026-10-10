export interface TokenPayload {
  user_ID: string;
  role: string;
  exp: number;
  [key: string]: any;
}

const SECRET_KEY = process.env.JWT_SECRET || "reposchool-v3-secret-key-invalidated-2026!";

async function getCryptoKey() {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function signJWT(
  payload: { user_ID: string; role: string; [key: string]: any },
  expiresInSeconds = 365 * 24 * 60 * 60 * 10
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload: TokenPayload = { ...payload, exp };


  const base64UrlHeader = base64UrlEncode(JSON.stringify(header));
  const base64UrlPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const dataToSign = `${base64UrlHeader}.${base64UrlPayload}`;
  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(dataToSign));

  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const base64UrlSignature = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${dataToSign}.${base64UrlSignature}`;
}

export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [base64UrlHeader, base64UrlPayload, base64UrlSignature] = parts;
    const dataToSign = `${base64UrlHeader}.${base64UrlPayload}`;

    const key = await getCryptoKey();

    let base64Sig = base64UrlSignature.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Sig.length % 4) {
      base64Sig += "=";
    }
    const binarySig = atob(base64Sig);
    const sigBuffer = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBuffer[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      new TextEncoder().encode(dataToSign)
    );

    if (!isValid) return null;

    const payloadStr = base64UrlDecode(base64UrlPayload);
    const payload: TokenPayload = JSON.parse(payloadStr);

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}
