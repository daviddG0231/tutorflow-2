// ============================================================
// lib/pallycon.ts — PallyCon DRM Token Generation
//
// Generates encrypted license tokens for PallyCon DRM.
// The token is sent to the PallyCon license server by the
// video player to obtain decryption keys.
//
// Token format: base64(AES-256-CBC(JSON policy payload))
// Uses PALLYCON_SITE_ID and PALLYCON_SITE_KEY from env.
//
// TODO: For full DRM (Widevine/PlayReady encrypted streams),
// videos need to be packaged as DASH/HLS via PallyCon's
// content packaging pipeline. This token generation works
// with both packaged content and as an access control layer
// for the MVP player-side protection approach.
// ============================================================

import crypto from "crypto";

interface TokenParams {
  userId: string;
  contentId: string; // unique ID for the video content
  siteId?: string;
}

/**
 * Generate a PallyCon DRM license token.
 *
 * The token encodes a JSON policy (content ID, expiry, security rules)
 * encrypted with AES-256-CBC using the site key. The player sends this
 * token to PallyCon's license server to get the decryption license.
 */
export function generatePallyConToken(params: TokenParams): string {
  const siteId = params.siteId || process.env.PALLYCON_SITE_ID!;
  const siteKey = process.env.PALLYCON_SITE_KEY!;

  const now = new Date();
  // PallyCon expects timestamp in format: YYYYMMDDTHHmmssZ
  const timestamp =
    now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "T")
      .slice(0, 15) + "Z";

  const policy = {
    policy_version: 2,
    site_id: siteId,
    content_id: params.contentId,
    token_type: "license",
    license_rule: {
      playback_policy: {
        persistent: false,
        // Token expires in 24 hours
        expire_date:
          new Date(now.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .replace(/[-:]/g, "")
            .slice(0, 15) + "Z",
      },
      security_policy: [
        {
          track_type: "ALL",
          widevine: {
            security_level: 1,
          },
          playready: {
            security_level: 150,
          },
        },
      ],
    },
    timestamp,
  };

  // Encrypt with AES-256-CBC using site key (first 32 bytes)
  const key = Buffer.from(siteKey, "utf8").subarray(0, 32);
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(policy), "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}
