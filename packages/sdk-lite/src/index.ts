import type { AccessCheckInput, AccessDecision } from '@guildpass/shared-types';

export class GuildPassClient {
  constructor(private baseUrl: string) {}

  async getMemberships(wallet: string) {
    const res = await fetch(`${this.baseUrl}/v1/memberships/${wallet}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getProfile(wallet: string) {
    const res = await fetch(`${this.baseUrl}/v1/members/${wallet}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async accessCheck(input: AccessCheckInput): Promise<AccessDecision> {
    const res = await fetch(`${this.baseUrl}/v1/access/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}
