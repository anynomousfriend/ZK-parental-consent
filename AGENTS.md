# 🤖 AGENTS.md - AI Development Context

This file contains essential context for AI agents working on the ZK Parental Consent Gateway project.

---

## 📋 Project Overview

**Project Name**: ZK Parental Consent Gateway  
**Purpose**: Privacy-preserving parental consent system using zero-knowledge proofs  
**Platform**: Midnight Network (Privacy-focused blockchain)  
**Tech Stack**: React + TypeScript (Frontend), Compact (Smart Contracts), Docker (Local Network)

---

## 🏗️ Architecture

### **System Components**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZK PARENTAL CONSENT GATEWAY                  │
└─────────────────────────────────────────────────────────────────┘

1. FRONTEND (midnight-starter-template/zk-consent-frontend/)
   ├── React + TypeScript + Vite
   ├── Tailwind CSS for styling
   ├── Parent Dashboard - Grant consent for children
   ├── Child App - Verify consent and access content
   └── TikTok-like Feed - Vertical scrolling cat GIFs

2. SMART CONTRACT (midnight-starter-template/zk-consent-gateway/)
   ├── Language: Compact (Midnight's ZK language)
   ├── File: src/consent.compact
   ├── Circuits:
   │   ├── grant_consent(child_id_hash: Field)
   │   ├── revoke_consent(child_id_hash: Field)
   │   └── verify_minor_access(child_id_hash: Field) → Boolean
   └── Ledger: consent_registry: Map<Field, Boolean>

3. LOCAL NETWORK (midnight-local-network/)
   ├── Docker Compose setup
   ├── Services:
   │   ├── Node (port 9944)
   │   ├── Indexer (port 8088)
   │   └── Proof Server (port 6300)
   └── Funding scripts for local wallets

4. CONTRACT SERVICE (src/lib/contract.ts)
   ├── Abstraction layer between frontend and blockchain
   ├── Currently: Simulated with in-memory storage
   └── Future: Real blockchain integration
```

---

## 🔑 Key Concepts

### **How It Works**

1. **Parent Flow:**
   - Parent enters unique identifier for child (e.g., `child@example.com`)
   - System generates cryptographic hash of identifier
   - Parent calls `grant_consent(hash)` circuit
   - Hash stored on blockchain (NOT the actual identifier)
   - Parent shares identifier with child securely

2. **Child Flow:**
   - Child enters the SAME identifier
   - System generates the SAME hash
   - Child calls `verify_minor_access(hash)` circuit
   - If hash exists in blockchain → Access granted
   - If not found → Access denied

3. **Privacy Guarantee:**
   - Only cryptographic hashes stored on-chain
   - Original identifiers never leave user's browser
   - Platform sees only "valid" or "invalid" proof
   - Child's identity remains private

---

## 📂 Project Structure

```
zk-parental-consent-gateway/
├── README.md                           # Main project documentation
├── AGENTS.md                          # This file - AI agent context
├── midnight-local-network/            # Docker testnet setup
│   ├── compose.yml                    # Docker services configuration
│   ├── src/fund.ts                    # Wallet funding script
│   └── README.md                      # Local network setup guide
│
├── midnight-starter-template/
│   ├── GETTING_STARTED.md            # Quick start guide
│   │
│   ├── zk-consent-gateway/           # Smart contract backend
│   │   ├── src/
│   │   │   ├── consent.compact       # ✅ Smart contract source
│   │   │   ├── deploy-consent.ts     # ✅ Deployment script
│   │   │   └── managed/consent/      # ✅ Compiled contract artifacts
│   │   │       ├── contract/         # Generated TypeScript bindings
│   │   │       ├── keys/             # Prover/verifier keys
│   │   │       └── zkir/             # ZK intermediate representation
│   │   ├── deployment-consent.json   # Deployed contract info
│   │   └── package.json
│   │
│   └── zk-consent-frontend/          # React frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── ParentDashboard.tsx  # ✅ Parent UI
│       │   │   ├── ChildApp.tsx         # ✅ Child UI
│       │   │   └── TikTokFeed.tsx       # ✅ Cat GIF feed
│       │   ├── lib/
│       │   │   ├── config.ts            # ✅ Network configuration
│       │   │   ├── hash.ts              # ✅ Hash generation
│       │   │   ├── wallet.ts            # ✅ Wallet service (mock)
│       │   │   └── contract.ts          # ✅ Contract service
│       │   ├── hooks/
│       │   │   └── useWallet.ts         # ✅ React wallet hook
│       │   ├── App.tsx                  # ✅ Main app with toggle
│       │   └── main.tsx                 # Entry point
│       ├── INTEGRATION_STATUS.md     # Current integration status
│       ├── README.md                 # Frontend documentation
│       └── package.json
```

---

## ✅ Completed Tasks

### **Phase 1: Project Setup (Complete)**
- [x] Vite + React + TypeScript project structure
- [x] Midnight SDK dependencies installed
- [x] Tailwind CSS configured
- [x] Docker local network setup

### **Phase 2: Smart Contract (Complete)**
- [x] `consent.compact` written with 3 circuits
- [x] Contract compiled successfully
- [x] Added `revoke_consent` circuit
- [x] Generated contract artifacts (keys, zkir, TypeScript bindings)

### **Phase 3: Frontend UI (Complete)**
- [x] Parent Dashboard component
- [x] Child App component
- [x] TikTok-like vertical scroll feed with 5 cat GIFs
- [x] Mode toggle between Parent/Child
- [x] Responsive design with Tailwind

### **Phase 4: Core Logic (Complete)**
- [x] Hash generation utility (`src/lib/hash.ts`)
- [x] Wallet service with mock connection (`src/lib/wallet.ts`)
- [x] React hooks for wallet state

### **Phase 5: Contract Integration (Complete)**
- [x] Contract service layer (`src/lib/contract.ts`)
- [x] Parent Dashboard → `grant_consent` integration
- [x] Child App → `verify_minor_access` integration
- [x] End-to-end flow working (simulated)

### **Phase 6: Documentation (Complete)**
- [x] Frontend README
- [x] Getting Started guide
- [x] Integration status document

---

## 🚧 Remaining Tasks (In Progress)

### **Phase 7: Real Blockchain Integration**
Status: **In Progress**

#### **Task 1: Install Blockchain Provider Dependencies**
```bash
cd midnight-starter-template/zk-consent-frontend
npm install @midnight-ntwrk/midnight-js-contracts \
            @midnight-ntwrk/midnight-js-http-client-proof-provider \
            @midnight-ntwrk/midnight-js-indexer-public-data-provider \
            @midnight-ntwrk/midnight-js-level-private-state-provider \
            @midnight-ntwrk/midnight-js-node-zk-config-provider
```

#### **Task 2: Copy Contract Artifacts to Frontend**
```bash
cd midnight-starter-template/zk-consent-frontend
mkdir -p src/contract-artifacts
cp -r ../zk-consent-gateway/src/managed/consent src/contract-artifacts/
```

#### **Task 3: Update Contract Service with Real Contract Calls**
File: `src/lib/contract.ts`

Replace simulated functions with:
```typescript
import { Contract, ledger } from './contract-artifacts/consent/contract';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

// Initialize providers (see deploy-consent.ts for reference)
const providers = {
  privateStateProvider: levelPrivateStateProvider(...),
  publicDataProvider: indexerPublicDataProvider(...),
  zkConfigProvider: new NodeZkConfigProvider(...),
  proofProvider: httpClientProofProvider(...),
  walletProvider: walletAndMidnightProvider,
  midnightProvider: walletAndMidnightProvider,
};

// Load deployed contract
const contractInstance = await loadContract(providers, contractAddress);

// Call actual circuits
async grantConsent(childIdHash: bigint) {
  const result = await contractInstance.circuits.grant_consent(
    context, 
    childIdHash
  );
  const txHash = await submitTransaction(result);
  return { success: true, txHash };
}
```

#### **Task 4: Integrate Real Lace Wallet**
File: `src/lib/wallet.ts`

Replace mock wallet with actual dapp-connector-api:
```typescript
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

async connect() {
  // Request wallet from browser extension
  const api: InitialAPI = await window.midnight.enable();
  
  // Get wallet state
  const state = await api.state();
  
  // Verify network
  if (state.networkId !== MIDNIGHT_CONFIG.networkId) {
    throw new Error('Wrong network!');
  }
  
  this.state = {
    isConnected: true,
    address: state.walletState.address,
    balance: BigInt(state.walletState.balance),
    networkId: state.networkId,
  };
}
```

#### **Task 5: Replace Simple Hash with Midnight Field Hash**
File: `src/lib/hash.ts`

```typescript
// TODO: Use actual Midnight Field hash
import { /* Field hash function */ } from '@midnight-ntwrk/compact-runtime';

export function hashIdentifier(identifier: string): bigint {
  const normalized = identifier.trim().toLowerCase();
  // Use Midnight's Field-compatible hash
  return midnightFieldHash(normalized);
}
```

#### **Task 6: Deploy Contract to Local Network**
```bash
cd midnight-starter-template/zk-consent-gateway

# Ensure Docker is running
docker ps  # Should show node, indexer, proof-server

# Deploy contract (will prompt for seed or generate new)
npm run deploy:consent

# Note the contract address from output
# Update frontend config with new address if different
```

#### **Task 7: Fund Test Wallets**
```bash
cd midnight-local-network

# Fund parent's wallet
yarn fund "<parent-wallet-mnemonic>"

# Fund child's wallet (different wallet!)
yarn fund "<child-wallet-mnemonic>"
```

#### **Task 8: End-to-End Testing with Real Blockchain**
- [ ] Parent grants consent with real Lace Wallet
- [ ] Transaction confirmed on local blockchain
- [ ] Hash visible in contract state via indexer
- [ ] Child verifies with real Lace Wallet (different wallet)
- [ ] ZK proof generated successfully
- [ ] Access granted to TikTok feed
- [ ] Test revoke_consent functionality

#### **Task 9: Production Readiness**
- [ ] Add transaction retry logic
- [ ] Implement proper error recovery
- [ ] Add loading states during proof generation
- [ ] Add transaction history view
- [ ] Implement consent management (list/revoke)
- [ ] Add analytics/logging
- [ ] Security audit of hash function
- [ ] Gas optimization testing

---

## 🔧 Development Commands

### **Start Docker Testnet**
```bash
cd midnight-local-network
docker compose up -d
docker ps  # Verify all services running
```

### **Run Frontend**
```bash
cd midnight-starter-template/zk-consent-frontend
npm run dev
# Opens at http://localhost:5173 or 5174
```

### **Build Frontend**
```bash
npm run build
# Output in dist/ directory
```

### **Compile Smart Contract**
```bash
cd midnight-starter-template/zk-consent-gateway
npm run compile:consent
# Generates artifacts in src/managed/consent/
```

### **Deploy Smart Contract**
```bash
npm run deploy:consent
# Writes deployment-consent.json
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Docker services not starting**
**Solution:**
```bash
cd midnight-local-network
docker compose down
docker compose up -d
docker logs indexer  # Check for errors
```

### **Issue 2: Frontend build errors**
**Solution:**
```bash
cd midnight-starter-template/zk-consent-frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Issue 3: Contract compilation fails**
**Solution:**
- Ensure Docker is running (proof server needed)
- Check Compact syntax in consent.compact
- Verify compact CLI is installed: `compact --version`

### **Issue 4: Wallet connection fails**
**Solution:**
- Currently using mock wallet (expected)
- For real wallet: Install Lace Wallet browser extension
- Configure Lace to connect to "Undeployed" network
- Point to localhost:9944

### **Issue 5: Hash mismatch between parent and child**
**Solution:**
- Ensure EXACT same identifier used (case-sensitive)
- Check for extra spaces or characters
- Verify same hash function used on both sides

---

## 📊 Current State

### **What's Working** ✅
- Frontend UI fully functional
- Parent can grant consent
- Child can verify consent
- TikTok feed access control
- Hash generation and matching
- Mode switching
- Error handling
- Transaction feedback

### **What's Simulated** 🔄
- Wallet connection (mocked)
- Contract calls (in-memory storage)
- Transaction hashes (randomly generated)
- Hash function (simple JS hash, not Midnight Field hash)

### **What's Next** 🚀
- Real Lace Wallet integration
- Actual blockchain contract calls
- ZK proof generation
- On-chain state verification
- Testnet/mainnet deployment

---

## 🎯 Testing Strategy

### **Current Testing (Simulated)**
1. Parent enters `test@example.com` → Grants consent
2. Child enters `test@example.com` → Access granted ✅
3. Child enters `wrong@example.com` → Access denied ❌

### **Future Testing (Real Blockchain)**
1. Deploy contract to local network
2. Fund two separate Lace Wallets
3. Parent (Wallet A) grants consent for hash
4. Verify hash exists in contract via indexer query
5. Child (Wallet B) generates ZK proof with same hash
6. Submit proof to verify_minor_access circuit
7. Verify proof returns true
8. Grant access to feed

---

## 🔐 Security Considerations

### **Current Implementation**
- Hash generation happens client-side (good ✅)
- Original identifiers never leave browser (good ✅)
- No authentication on grant_consent (limitation ⚠️)
  - In simulation, anyone can grant consent
  - Real implementation: Wallet signature provides auth
- Simple hash function (temporary ⚠️)
  - Replace with Midnight Field hash for production

### **Production Checklist**
- [ ] Use cryptographically secure hash (Midnight Field hash)
- [ ] Validate wallet signatures on all transactions
- [ ] Implement rate limiting on contract calls
- [ ] Add replay attack protection
- [ ] Audit smart contract logic
- [ ] Test with adversarial inputs
- [ ] Implement consent expiration (optional feature)

---

## 📚 Key Resources

### **Documentation**
- [Midnight Network Docs](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/develop/tutorial/compact-overview/)
- [Lace Wallet Guide](https://www.lace.io/)

### **Code Examples**
- `midnight-local-network/src/fund.ts` - Wallet funding example
- `midnight-starter-template/zk-consent-gateway/src/deploy-consent.ts` - Full deployment flow
- `midnight-starter-template/zk-consent-frontend/src/lib/contract.ts` - Contract service pattern

### **Project Files**
- `midnight-starter-template/GETTING_STARTED.md` - Quick start
- `midnight-starter-template/zk-consent-frontend/README.md` - Frontend guide
- `midnight-starter-template/zk-consent-frontend/INTEGRATION_STATUS.md` - Integration status

---

## 💡 Tips for AI Agents

### **When Making Changes**
1. Always check if Docker is running before contract operations
2. Rebuild frontend after modifying components: `npm run build`
3. Test both parent and child flows after changes
4. Verify hash matching works (same input → same hash)
5. Check browser console for errors

### **File Organization**
- Smart contract logic: `zk-consent-gateway/src/consent.compact`
- Frontend components: `zk-consent-frontend/src/components/`
- Business logic: `zk-consent-frontend/src/lib/`
- Configuration: `zk-consent-frontend/src/lib/config.ts`

### **Common Patterns**
- All async operations use try/catch
- Loading states managed with useState
- Error messages shown to user
- Success includes transaction hash
- Components are self-contained

### **Code Style**
- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind for styling (no custom CSS)
- Clear comments for TODO items
- Explicit error handling

---

## 🎨 Design Decisions

### **Why Simulation First?**
- Real blockchain integration is complex (providers, wallets, proofs)
- Simulation proves the UI/UX works perfectly
- Same interface as real implementation
- Faster iteration during development
- Easy testing without blockchain setup

### **Why Two Separate Apps in One?**
- Demonstrates both use cases clearly
- Easy mode switching for demo purposes
- Shared code (hash, config) reduces duplication
- Real deployment could split these

### **Why TikTok-like Feed?**
- Engaging demo of access control
- Shows real-world application
- Fun and memorable
- Easy to understand value proposition

---

## 📞 Contact & Support

- **Project**: ZK Parental Consent Gateway
- **Platform**: Midnight Network
- **Status**: MVP Complete, Blockchain Integration In Progress
- **License**: MIT

---

**Last Updated**: 2026-02-14  
**Version**: 1.0.0  
**AI Agent**: This file is specifically designed for AI development assistance
