import { createHmac } from 'node:crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/**
 * Verifies Telegram Mini App initData and extracts the user.
 *
 * Algorithm (from Telegram docs):
 *  1. Parse initData as URLSearchParams
 *  2. Extract `hash`; build data-check-string from remaining params sorted alphabetically
 *  3. secret_key = HMAC-SHA256("WebAppData", botToken)
 *  4. Compare HMAC-SHA256(secret_key, data-check-string) with the provided hash
 */
export function verifyTelegramWebAppData(
  initData: string,
  botToken: string,
): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return null;
    }

    // Build data-check-string: all params except hash, sorted alphabetically, joined by \n
    const entries: string[] = [];
    params.forEach((value, key) => {
      if (key !== 'hash') {
        entries.push(`${key}=${value}`);
      }
    });
    entries.sort();
    const dataCheckString = entries.join('\n');

    // secret_key = HMAC-SHA256(botToken, "WebAppData")
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();

    // computed hash = HMAC-SHA256(dataCheckString, secret_key)
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      return null;
    }

    // Parse user JSON from the `user` field
    const userRaw = params.get('user');
    if (!userRaw) {
      return null;
    }

    const user: TelegramUser = JSON.parse(userRaw);
    return user;
  } catch {
    return null;
  }
}
