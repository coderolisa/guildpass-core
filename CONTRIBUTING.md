# Contributing to GuildPass Core

Thank you for your interest in contributing to GuildPass Core! This is the backend and smart-contract foundation for the GuildPass protocol, and is listed on [GrantFox](https://contribute.grantfox.xyz) for open contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Finding Issues via GrantFox](#finding-issues-via-grantfox)
- [Development Setup](#development-setup)
- [Branching & Commits](#branching--commits)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Smart Contract Contributions](#smart-contract-contributions)
- [Review Process](#review-process)
- [Communication](#communication)

---

## Code of Conduct

By participating you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Ways to Contribute

- Fix bugs in the Fastify API or Prisma data layer
- Add or improve unit/integration tests
- Extend or improve the policy engine
- Write or improve Solidity contracts and their Foundry tests
- Improve OpenAPI documentation
- Add new API endpoints with tests
- Improve TypeScript types in shared packages

---

## Finding Issues via GrantFox

1. Visit the [GrantFox contributor app](https://contribute.grantfox.xyz) and find the **Adamantine-Guild / guildpass-core** project.
2. Browse issues tagged `good first issue` or `help wanted`.
3. Apply for an issue on GrantFox, or comment `I'd like to work on this` on the GitHub issue.
4. Wait for a maintainer to assign it before starting — this avoids duplicate effort.

Direct GitHub filters:
- [`good first issue`](https://github.com/Adamantine-Guild/guildpass-core/issues?q=label%3A%22good+first+issue%22)
- [`help wanted`](https://github.com/Adamantine-Guild/guildpass-core/issues?q=label%3A%22help+wanted%22)

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Docker (for PostgreSQL and Redis)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for Solidity work)

### Steps

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/guildpass-core.git
cd guildpass-core

# 2. Start required services
docker compose up -d

# 3. Install all workspace dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your database and Redis URLs

# 5. Run Prisma migrations
npm run -w access-api prisma:migrate

# 6. Seed with sample data
npm run seed

# 7. Start the API
npm run dev
# API: http://localhost:3000
# OpenAPI docs: http://localhost:3000/docs
```

### Workspace structure

| Path | Purpose |
|---|---|
| `apps/access-api` | Fastify REST API (main server) |
| `packages/contracts` | On-chain contract ABIs and addresses |
| `packages/shared-types` | Shared TypeScript types |
| `packages/policy-engine` | Access policy logic |
| `packages/sdk-lite` | Minimal HTTP client |
| `contracts/` | Solidity (Foundry) |

---

## Branching & Commits

- Branch off `main`: `git checkout -b feat/short-description` or `fix/short-description`
- Use conventional commits:
  - `feat: add /v1/communities/:id/roles endpoint`
  - `fix: correct policy engine CONTRIBUTORS_OR_ADMINS resolution`
  - `test: add policy-engine unit tests for edge cases`
  - `chore: update Prisma to 5.x`
  - `contracts: add MembershipNFT renewal event`
- Keep commits focused and atomic.

---

## Submitting a Pull Request

1. Push your branch to your fork.
2. Open a PR against `Adamantine-Guild/guildpass-core` on the `main` branch.
3. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely.
4. Ensure these pass before submitting:

```bash
npm run typecheck    # Must pass
npm run lint         # Fix reported issues
npm run test         # All tests must pass
```

### PR Quality Expectations

- All new API endpoints must have at least one integration test.
- Business logic must live in services, not route handlers.
- Prisma schema changes must include a migration file.
- TypeScript `any` is not acceptable without a clear comment explaining why.

---

## Smart Contract Contributions

When modifying Solidity contracts:

```bash
# Build
npm run contracts:build

# Test — all forge tests must pass
npm run contracts:test

# Format Solidity
forge fmt
```

- All new contract functions must have NatSpec documentation.
- All state-changing functions must emit events.
- New contracts must have corresponding Foundry unit tests.
- Do not deploy to any real network without explicit maintainer approval.

---

## Review Process

- A maintainer will review your PR within **5 business days**.
- Address requested changes promptly.
- Once approved and CI passes, a maintainer merges.
- Smart contract changes require additional review and will take longer.

---

## Communication

- GitHub Issues: preferred for all task discussion
- Contact: maintainers@guildpass.xyz
- [GrantFox maintainer app](https://maintainer.grantfox.xyz) for campaign coordination
