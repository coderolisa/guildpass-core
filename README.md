# GuildPass Core Monorepo (MVP)

GuildPass provides wallet-based membership and token-gated community infrastructure.
This monorepo contains a runnable MVP backend and protocol foundation. It is intentionally not feature-complete, but is real, demoable, and extendable.

## Structure

- apps/access-api – Fastify API (TypeScript, Prisma, PostgreSQL, OpenAPI)
- packages/contracts – TS helpers for on-chain contract addresses/ABI
- packages/shared-types – Shared types/enums for roles, membership, decisions
- packages/policy-engine – Simple, explainable access policy engine
- packages/sdk-lite – Minimal HTTP client for the API (optional)
- contracts – Foundry Solidity project (Membership NFT + tests + deploy)

## Quick Start

1. Requirements: Node 18+, npm, Docker (for Postgres/Redis), Foundry (for contracts)
2. Bootstrap services:
   - `docker compose up -d`
3. Install deps (workspace):
   - `npm install`
4. Generate Prisma client and migrate:
   - `npm run -w access-api prisma:migrate`
5. Seed DB:
   - `npm run seed`
6. Start API:
   - `npm run dev`
7. OpenAPI docs:
   - http://localhost:3000/docs

## Contracts

The MembershipNFT is a simple ERC-721 with expiry and suspension semantics, and admin-controlled mint/renew. It emits events suitable for off-chain indexing.

- Build: `npm run contracts:build`
- Test: `npm run contracts:test`
- Deploy (example script): `npm run contracts:deploy`

After deploying, set `MEMBERSHIP_NFT_ADDRESS` and `CHAIN_ID` in `.env`.

## API Endpoints (MVP)

- GET /v1/memberships/:wallet – Membership status summary by wallet
- GET /v1/members/:wallet – Member profile (with membership/roles)
- POST /v1/access/check – Access decision for { wallet, communityId, resource }
- GET /v1/communities/:communityId/members – Admin member listing (simple)

Responses include allowed/denied plus human-readable and machine-readable reasons.

## Data Model

Prisma schema includes: communities, wallets, members, memberships, roles, access policies, profiles, badges (placeholder).

## Policy Engine

Simple rules: PUBLIC, MEMBERS_ONLY, ADMINS_ONLY, CONTRIBUTORS_OR_ADMINS.
Role resolution combines:
- membership state (adds member role when active),
- backend role assignments,
- room for future manual override rules (TODO).

## Deferred Areas (Intentionally Not Implemented)

- Advanced governance permissions
- Constitutional rule engine
- Complex moderation workflows
- Appeals/reinstatement
- Rich reward distribution
- Advanced streak logic
- Contribution scoring engine
- Full event attendance ingestion
- Multi-chain support
- Advanced indexing pipeline
- Complete external integrations

Clear interfaces and TODOs are left where appropriate.

## Development Notes

- Business logic sits in services and the policy engine, not route handlers.
- Contracts and API are aligned via shared types and simple event ABI.
- The code aims to be small and understandable; extending should not require rewrites.

## Testing

- Policy engine unit tests: `npm run -w @guildpass/policy-engine test`
- Add additional tests per package/app as needed.

## Environment

See `.env.example` for required variables.
