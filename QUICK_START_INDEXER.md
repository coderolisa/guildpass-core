# Quick Start: Testing the Indexer Locally

This guide walks you through setting up and testing the MembershipNFT event indexer on your local machine.

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- pnpm or npm

## Step 1: Start Local Infrastructure

### Start PostgreSQL

```bash
# Start PostgreSQL and Redis
docker compose up -d

# Verify PostgreSQL is running
docker ps | grep postgres
```

## Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guildpass"
# RPC_URL="http://127.0.0.1:8545"
# CHAIN_ID=31337
# INDEXER_START_BLOCK=0
# INDEXER_BATCH_SIZE=1000
```

## Step 3: Install Dependencies

```bash
# Install all dependencies
npm install

# Generate Prisma client
npm run -w access-api prisma:generate

# Run database migrations
npm run -w access-api prisma:migrate
```

## Step 4: Start Local Blockchain

Open a new terminal and start Anvil (comes with Foundry):

```bash
# Start local Ethereum node
anvil

# You should see:
# Listening on 127.0.0.1:8545
```

Keep this terminal open.

## Step 5: Deploy the MembershipNFT Contract

Open another terminal:

```bash
# Deploy the contract
forge script contracts/script/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

# The output will show the deployed contract address
# Copy the contract address
```

**Important:** Copy the deployed contract address from the output. It will look like:
```
## Setting up 1 EVM.
...
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
...
```

## Step 6: Update Environment with Contract Address

```bash
# Edit .env and set the contract address
# MEMBERSHIP_NFT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

## Step 7: Mint Test Memberships

Using cast (comes with Foundry), let's mint some test memberships:

```bash
# Set variables for convenience
CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"  # Your deployed address
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"  # Anvil test key
RPC_URL="http://127.0.0.1:8545"

# Get the deployer address (this is the owner)
OWNER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Owner: $OWNER_ADDRESS"

# Set yourself as admin (owner can call this)
cast send $CONTRACT_ADDRESS \
  "setAdmin(address,bool)" \
  $OWNER_ADDRESS \
  true \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# Mint a membership for Alice (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
cast send $CONTRACT_ADDRESS \
  "mint(address,string,uint256)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  "community-dev" \
  2592000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# Mint a membership for Bob (0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
cast send $CONTRACT_ADDRESS \
  "mint(address,string,uint256)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  "community-dev" \
  2592000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# Mint a membership for Carol in a different community
cast send $CONTRACT_ADDRESS \
  "mint(address,string,uint256)" \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
  "community-prod" \
  1296000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

echo "✅ Minted 3 test memberships!"
```

## Step 8: Verify Events on Blockchain

Check that events were emitted:

```bash
# Query MembershipMinted events
cast logs \
  --from-block 0 \
  --address $CONTRACT_ADDRESS \
  --rpc-url $RPC_URL

# You should see several MembershipMinted events
```

## Step 9: Run the Indexer

Now run the indexer to sync the events into the database:

```bash
# Run the indexer
npm run indexer

# Expected output:
# {"level":"info","msg":"Starting MembershipNFT indexer",...}
# {"level":"info","msg":"Processing block range","fromBlock":0,"toBlock":X}
# {"level":"info","msg":"Fetched events","minted":3,"renewed":0,"suspended":0}
# {"level":"info","msg":"MembershipMinted processed","tokenId":1,...}
# {"level":"info","msg":"MembershipMinted processed","tokenId":2,...}
# {"level":"info","msg":"MembershipMinted processed","tokenId":3,...}
# {"level":"info","msg":"Checkpoint saved","blockNumber":X}
# {"level":"info","msg":"Indexer run completed successfully"}
```

## Step 10: Verify Database State

Check that the data was indexed correctly:

```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/guildpass

# Check wallets
SELECT * FROM "Wallet";

# Check communities
SELECT * FROM "Community";

# Check members
SELECT * FROM "Member";

# Check memberships
SELECT * FROM "Membership";

# Check indexer checkpoint
SELECT * FROM "IndexerCheckpoint";

# Exit psql
\q
```

Expected results:
- 3 Wallet records (Alice, Bob, Carol)
- 2 Community records (community-dev, community-prod)
- 3 Member records (one per wallet-community pair)
- 3 Membership records (tokenId 1, 2, 3, all active)
- 1 IndexerCheckpoint record

## Step 11: Test MembershipRenewed Event

Let's renew Alice's membership and re-run the indexer:

```bash
# Renew tokenId 1 (Alice) by 30 more days
cast send $CONTRACT_ADDRESS \
  "renew(uint256,uint256)" \
  1 \
  2592000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# Run indexer again
npm run indexer

# Check the database
psql postgresql://postgres:postgres@localhost:5432/guildpass -c \
  "SELECT \"tokenId\", state, \"expiresAt\", \"renewedAt\" FROM \"Membership\" WHERE \"tokenId\" = 1;"
```

You should see the updated `expiresAt` and `renewedAt` timestamps.

## Step 12: Test MembershipSuspended Event

Let's suspend Bob's membership:

```bash
# Suspend tokenId 2 (Bob)
cast send $CONTRACT_ADDRESS \
  "setSuspended(uint256,bool)" \
  2 \
  true \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# Run indexer again
npm run indexer

# Check the database
psql postgresql://postgres:postgres@localhost:5432/guildpass -c \
  "SELECT \"tokenId\", state FROM \"Membership\" WHERE \"tokenId\" = 2;"
```

The state should be `suspended`.

Now unsuspend:

```bash
# Unsuspend tokenId 2 (Bob)
cast send $CONTRACT_ADDRESS \
  "setSuspended(uint256,bool)" \
  2 \
  false \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# Run indexer again
npm run indexer

# Check the database
psql postgresql://postgres:postgres@localhost:5432/guildpass -c \
  "SELECT \"tokenId\", state FROM \"Membership\" WHERE \"tokenId\" = 2;"
```

The state should be back to `active`.

## Step 13: Test Idempotency

Run the indexer multiple times to verify it doesn't create duplicates:

```bash
# Run indexer 3 times
npm run indexer
npm run indexer
npm run indexer

# Check that we still have exactly 3 memberships
psql postgresql://postgres:postgres@localhost:5432/guildpass -c \
  "SELECT COUNT(*) FROM \"Membership\";"
```

Should still show 3 memberships.

## Step 14: Test Access API Integration

Start the API server and test access checks:

```bash
# Start the API
npm run dev

# In another terminal, test the API
# Check Alice's memberships (should show community-dev as active)
curl http://localhost:3000/v1/memberships/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Check Bob's memberships (should show community-dev as active)
curl http://localhost:3000/v1/memberships/0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# Check access for Alice
curl -X POST http://localhost:3000/v1/access/check \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "communityId": "community-dev",
    "resource": "chat"
  }'
```

## Troubleshooting

### Issue: "RPC_URL is required"
**Solution:** Make sure `.env` file has `RPC_URL` set.

### Issue: "MEMBERSHIP_NFT_ADDRESS is required"
**Solution:** Make sure `.env` file has the deployed contract address.

### Issue: "Already synced to latest block"
**Solution:** This is normal if you've already run the indexer and there are no new blocks.

### Issue: Database connection error
**Solution:** Make sure PostgreSQL is running: `docker ps | grep postgres`

### Issue: No events found
**Solution:** 
1. Check that contract is deployed: `cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL`
2. Check that events exist: `cast logs --from-block 0 --address $CONTRACT_ADDRESS --rpc-url $RPC_URL`
3. Verify `MEMBERSHIP_NFT_ADDRESS` in `.env` matches deployed address

### Issue: Anvil stopped working
**Solution:** Restart Anvil and redeploy the contract.

## Cleanup

```bash
# Stop the API
Ctrl+C in the terminal running the API

# Stop Anvil
Ctrl+C in the terminal running Anvil

# Stop PostgreSQL
docker compose down

# Clear database (optional)
docker compose down -v
```

## Next Steps

- Read `docs/INDEXER.md` for detailed architecture and advanced usage
- Deploy to testnet (Goerli, Sepolia) for more realistic testing
- Set up cron job for periodic indexing
- Add monitoring and alerting

## Summary

You've successfully:
- ✅ Deployed MembershipNFT contract locally
- ✅ Minted test memberships
- ✅ Indexed events into the database
- ✅ Tested renewal and suspension
- ✅ Verified idempotency
- ✅ Tested API integration

The indexer is working correctly and ready for production deployment!
