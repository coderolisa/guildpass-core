import { evaluate, resolveEffectiveRoles } from '../src';
import type { AccessPolicy, RoleContext } from '@guildpass/shared-types';

describe('policy engine', () => {
  const ctx: RoleContext = {
    assignments: [{ role: 'admin', source: 'manual', active: true }],
    membershipState: 'active',
  };
  test('PUBLIC allows anyone', () => {
    const policy: AccessPolicy = { id: '1', communityId: 'c1', resource: 'home', rule: 'PUBLIC' };
    const d = evaluate(policy, ctx);
    expect(d.allowed).toBe(true);
  });
  test('ADMINS_ONLY denies non-admin', () => {
    const policy: AccessPolicy = { id: '1', communityId: 'c1', resource: 'admin', rule: 'ADMINS_ONLY' };
    const d = evaluate(policy, { ...ctx, assignments: [] });
    expect(d.allowed).toBe(false);
  });
  test('resolveEffectiveRoles adds member when active', () => {
    const roles = resolveEffectiveRoles(ctx);
    expect(roles).toContain('member');
    expect(roles).toContain('admin');
  });
});
