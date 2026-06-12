## Description

<!-- A clear and concise summary of the changes in this PR. -->

## Linked Issue

Closes # <!-- Issue number this PR resolves -->

## Type of Change

- [ ] 🐛 Bug fix (API or policy engine)
- [ ] ✨ New feature / endpoint
- [ ] 📝 Documentation / OpenAPI spec update
- [ ] 🔧 Chore / refactor / dependency update
- [ ] 🧪 Tests only
- [ ] ⛓️ Smart contract change (requires extra review)

## Changes Made

<!-- List the files/packages changed and why. -->

-
-

## Test Evidence

<!-- Paste test output, curl responses, or OpenAPI screenshots. -->

```
npm run test output:
```

## Smart Contract Checklist (complete if ⛓️ checked above)

- [ ] All new functions have NatSpec documentation
- [ ] All state-changing functions emit events
- [ ] `forge test` passes with no failures
- [ ] `forge fmt` applied
- [ ] No deployment to a live network included in this PR

## General Checklist

- [ ] I have read [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] This PR is linked to an open issue
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes — all tests green
- [ ] Prisma schema changes include a migration file
- [ ] New API endpoints are documented in OpenAPI (via Fastify schema)
- [ ] No secrets, keys, or wallet addresses introduced
- [ ] `.env.example` updated if new env variables were added
- [ ] Documentation updated if new behaviour was introduced

## Screenshots / Recordings

<!-- Add screenshots of new API responses, OpenAPI UI, or relevant test output. -->

## Additional Notes

<!-- Anything else reviewers should know. -->
