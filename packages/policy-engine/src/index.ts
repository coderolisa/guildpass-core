import {
  AccessDecision,
  AccessPolicy,
  RoleContext,
  Role,
  MembershipState,
} from '@guildpass/shared-types';

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function resolveEffectiveRoles(ctx: RoleContext): Role[] {
  const roles: Role[] = [];
  for (const a of ctx.assignments) {
    if (a.active) roles.push(a.role);
  }
  if (ctx.membershipState === 'active') {
    roles.push('member');
  }
  return unique(roles);
}

export function evaluate(policy: AccessPolicy, ctx: RoleContext): AccessDecision {
  const roles = resolveEffectiveRoles(ctx);
  const reasons: { code: string; message: string }[] = [];

  // Always record membership state as a reason context
  reasons.push({
    code: `MEMBERSHIP_${ctx.membershipState.toUpperCase()}`,
    message: `Membership is ${ctx.membershipState}`,
  });

  const has = (r: Role) => roles.includes(r);

  switch (policy.rule) {
    case 'PUBLIC':
      reasons.push({ code: 'RULE_PUBLIC', message: 'Resource is public' });
      return { allowed: true, code: 'ALLOW', reasons, effectiveRoles: roles, membershipState: ctx.membershipState };
    case 'MEMBERS_ONLY':
      if (ctx.membershipState !== 'active') {
        reasons.push({ code: 'NEEDS_ACTIVE', message: 'Requires active membership' });
        return { allowed: false, code: 'DENY', reasons, effectiveRoles: roles, membershipState: ctx.membershipState };
      }
      reasons.push({ code: 'HAS_ACTIVE_MEMBERSHIP', message: 'Active membership grants access' });
      return { allowed: true, code: 'ALLOW', reasons, effectiveRoles: roles, membershipState: ctx.membershipState };
    case 'ADMINS_ONLY':
      if (!has('admin')) {
        reasons.push({ code: 'NEEDS_ADMIN', message: 'Admin role required' });
        return { allowed: false, code: 'DENY', reasons, effectiveRoles: roles, membershipState: ctx.membershipState };
      }
      reasons.push({ code: 'HAS_ADMIN', message: 'Admin role grants access' });
      return { allowed: true, code: 'ALLOW', reasons, effectiveRoles: roles, membershipState: ctx.membershipState };
    case 'CONTRIBUTORS_OR_ADMINS':
      if (has('admin') || has('contributor')) {
        reasons.push({ code: 'HAS_REQUIRED_ROLE', message: 'Contributor or admin grants access' });
        return { allowed: true, code: 'ALLOW', reasons, effectiveRoles: roles, membershipState: ctx.membershipState };
      }
      reasons.push({ code: 'NEEDS_CONTRIBUTOR_OR_ADMIN', message: 'Contributor or admin required' });
      return { allowed: false, code: 'DENY', reasons, effectiveRoles: roles, membershipState: ctx.membershipState };
    default: {
      reasons.push({ code: 'RULE_UNHANDLED', message: `Unhandled policy rule: ${policy.rule}` });
      return { allowed: false, code: 'DENY', reasons, effectiveRoles: roles, membershipState: ctx.membershipState };
    }
  }
}

export function explain(policy: AccessPolicy, ctx: RoleContext): string {
  const decision = evaluate(policy, ctx);
  const status = decision.allowed ? 'ALLOWED' : 'DENIED';
  const lines = [
    `${status} for rule=${policy.rule}`,
    `roles=[${(decision.effectiveRoles || []).join(', ')}]`,
    ...decision.reasons.map((r) => `- ${r.code}: ${r.message}`),
  ];
  return lines.join('\n');
}
