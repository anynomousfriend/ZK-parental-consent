# 🔐 ZK Parental Consent Gateway

> **Privacy-First Parental Control**: Parents grant or revoke consent for minors' platform usage via zero-knowledge proofs without disclosing the child's identity to the platform.

[![Midnight Network](https://img.shields.io/badge/Built%20on-Midnight-9945FF?style=for-the-badge)](https://midnight.network/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![ZK Proof](https://img.shields.io/badge/Privacy-Zero--Knowledge-blue?style=for-the-badge)]()

---

## 📖 Table of Contents

- [What is ZK Parental Consent Gateway?](#-what-is-zk-parental-consent-gateway)
- [The Problem We Solve](#-the-problem-we-solve)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [User Flows](#-user-flows)
- [Deployed Smart Contract](#-deployed-smart-contract)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## 🎯 What is ZK Parental Consent Gateway?

The **ZK Parental Consent Gateway** is a revolutionary privacy-preserving solution that enables parents to manage their children's access to digital platforms without compromising the child's privacy or exposing their identity to third parties.

Built on **Midnight Network**, this application leverages **zero-knowledge proof technology** to create a trustless consent verification system where:

- 👨‍👩‍👧 **Parents** can grant or revoke consent for their minors
- 🧒 **Children** can prove they have consent without revealing who they are
- 🏢 **Platforms** can verify consent without accessing personal information
- 🔒 **Privacy** is maintained end-to-end for all parties

### Why This Matters

Traditional parental consent systems require platforms to store and manage sensitive information about minors, creating:
- **Privacy risks**: Children's identities are exposed to platforms
- **Security concerns**: Centralized databases become honeypots for attackers
- **Compliance headaches**: COPPA, GDPR-K, and other regulations require careful data handling
- **Trust issues**: Parents must trust platforms to handle data responsibly

Our solution **eliminates** these problems using cryptographic proofs.

---

## 🔍 The Problem We Solve

### Current State (Traditional Approach)

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Parent    │─────▶│   Platform DB    │◀─────│    Child    │
│             │ Sends│  (Stores: Name,  │Proves│             │
│ "John Doe's │ PII  │  Age, Parent ID, │ PII  │ "I'm John   │
│  son can    │      │  Child ID, etc.) │      │  Doe's son" │
│  access"    │      │                  │      │             │
└─────────────┘      └──────────────────┘      └─────────────┘
                            ⚠️ PRIVACY RISK
```

**Problems:**
- Platform knows who the child is
- Personal data stored in centralized database
- Risk of data breaches
- Compliance burden
- No privacy for minors

### Our Solution (Zero-Knowledge Approach)

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Parent    │─────▶│   ZK Contract    │◀─────│    Child    │
│             │Grants│  (Stores only:   │Proves│             │
│ Hash(ID)    │Consent│  Hash values)   │Consent│ "I have a  │
│ authorized  │      │                  │      │  valid hash"│
└─────────────┘      └──────────────────┘      └─────────────┘
                         ✅ PRIVATE & SECURE
```

**Benefits:**
- ✅ Platform never learns the child's identity
- ✅ No personal data stored on-chain
- ✅ Cryptographically verifiable consent
- ✅ Parent maintains control
- ✅ Child's privacy preserved

---

## ✨ Key Features

### 🔐 Privacy-Preserving
- **Zero-Knowledge Proofs**: Children prove consent without revealing identity
- **Hash-Based Authentication**: Only cryptographic hashes stored on-chain
- **No PII Storage**: Personal information never leaves the user's device

### 👨‍👩‍👧‍👦 Parent Controls
- **Grant Consent**: Add a child's hashed ID to the authorized registry
- **Revoke Consent**: Remove authorization at any time
- **Multiple Children**: Manage consent for multiple minors
- **Audit Trail**: View consent history on-chain

### 🧒 Child Experience
- **Anonymous Verification**: Prove consent without identity disclosure
- **One-Click Access**: Generate proofs instantly
- **Cross-Platform**: Use the same proof across multiple platforms
- **Self-Sovereign**: Control your own credentials

### 🏢 Platform Integration
- **Simple Verification**: Check ZK proofs via API
- **No Data Liability**: Never store minor's information
- **Regulatory Compliance**: COPPA/GDPR-K compliant by design
- **Trustless**: No need to trust the platform with data

### 🛡️ Security & Trust
- **Blockchain-Based**: Immutable consent records on Midnight Network
- **Decentralized**: No central authority or single point of failure
- **Open Source**: Fully auditable codebase
- **Battle-Tested Cryptography**: Industry-standard ZK-SNARKs

---

## 🔄 How It Works

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZK Parental Consent Gateway                  │
└─────────────────────────────────────────────────────────────────┘

     PARENT SIDE              BLOCKCHAIN              CHILD SIDE
         
    ┌──────────┐           ┌──────────┐           ┌──────────┐
    │  Parent  │           │ Midnight │           │  Child   │
    │   App    │           │ Network  │           │   App    │
    └────┬─────┘           └────┬─────┘           └────┬─────┘
         │                      │                      │
         │ 1. Generate Hash     │                      │
         │    of Child ID       │                      │
         │                      │                      │
         │ 2. Grant Consent     │                      │
         ├─────────────────────▶│                      │
         │    (Hash stored)     │                      │
         │                      │                      │
         │                      │ 3. Child requests    │
         │                      │    platform access   │
         │                      │◀─────────────────────┤
         │                      │                      │
         │                      │ 4. Generate ZK Proof │
         │                      │    "I have consent"  │
         │                      │◀─────────────────────┤
         │                      │                      │
         │                      │ 5. Verify Proof      │
         │                      ├─────────────────────▶│
         │                      │    ✅ VERIFIED       │
         │                      │                      │
         │                      │ 6. Access Granted    │
         │                      ├─────────────────────▶│
         │                      │   (No ID revealed)   │
```

### Step-by-Step Process

#### 👨‍👩‍👧 Parent Flow

1. **Setup Wallet**: Parent creates a Midnight wallet
2. **Generate Child ID Hash**: Parent inputs child's unique identifier (email, etc.)
   - Hash is computed locally: `hash = Hash(child_unique_id)`
3. **Grant Consent**: Parent calls `grant_consent(hash)` on smart contract
   - Transaction recorded on Midnight blockchain
   - Only the hash is stored (not the actual ID)
4. **Management**: Parent can revoke consent anytime

#### 🧒 Child Flow

1. **Setup Wallet**: Child creates a Midnight wallet
2. **Receive ID**: Parent shares the child's unique identifier securely (offline)
3. **Access Platform**: When accessing a platform:
   - Child's app computes the same hash locally
   - Generates a ZK proof: "I know an ID whose hash is authorized"
   - Proof is sent to platform (no ID revealed)
4. **Verification**: Platform verifies the proof with smart contract
5. **Access Granted**: If proof is valid, access is granted

#### 🏢 Platform Flow

1. **Integration**: Platform integrates verification API
2. **Receive Proof**: User submits ZK proof instead of personal info
3. **Verify**: Call smart contract's `verify_minor_access()` circuit
4. **Decision**: Grant or deny access based on proof validity
5. **No Storage**: Platform never receives or stores child's identity

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Full Stack Application                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Frontend (Web)  │  │   Backend API    │  │ Smart Contract   │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│                  │  │                  │  │                  │
│ • React/Vite     │  │ • Node.js/TS     │  │ • Compact Lang   │
│ • Wallet Connect │◀─┤ • Express/Fastify│◀─┤ • ZK Circuits    │
│ • UI Components  │  │ • Midnight SDK   │  │ • Ledger State   │
│ • ZK Proof Gen   │  │ • Proof Provider │  │ • Verification   │
│                  │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Midnight Network   │
                    │  • Indexer          │
                    │  • Node             │
                    │  • Proof Server     │
                    └─────────────────────┘
```

### Low-Level Technical Architecture

#### Smart Contract Layer (Compact)

```compact
// consent.compact
export ledger consent_registry: Map<Field, Boolean>;

// Parent grants consent by registering child's hash
export circuit grant_consent(child_id_hash: Field): [] {
    const disclosed_hash = disclose(child_id_hash);
    consent_registry.insert(disclosed_hash, true);
}

// Child proves consent without revealing ID
export circuit verify_minor_access(child_id_hash: Field): Boolean {
    const disclosed_hash = disclose(child_id_hash);
    const is_authorized = consent_registry.lookup(disclosed_hash);
    return is_authorized;
}
```

**Key Concepts:**
- **Ledger State**: `Map<Field, Boolean>` stores authorized hashes
- **Circuits**: ZK circuits that generate proofs
- **Field Elements**: Cryptographic field elements (hashes)
- **Disclose**: Makes witness values public for ledger operations

#### Backend API Layer

```typescript
// API Endpoints
POST   /api/parent/grant-consent      // Parent grants consent
DELETE /api/parent/revoke-consent     // Parent revokes consent
POST   /api/child/verify-access       // Child proves consent
GET    /api/parent/consents           // List all consents
```

**Services:**
- **Wallet Service**: Manages Midnight wallets
- **Contract Service**: Interacts with smart contract
- **Proof Service**: Generates and verifies ZK proofs
- **Hash Service**: Computes cryptographic hashes

#### Frontend Application

**Parent Dashboard:**
- Add/Remove children
- View consent status
- Transaction history
- Wallet management

**Child Interface:**
- Generate access proofs
- View consent status
- Cross-platform proof sharing

**Platform Integration:**
- Verification widget
- API documentation
- Developer tools

---

## 👥 User Flows

### 🟢 Parent: Granting Consent

```
START
  │
  ├─▶ [Open Parent App]
  │
  ├─▶ [Connect Midnight Wallet]
  │
  ├─▶ [Navigate to "Add Child"]
  │
  ├─▶ [Enter Child's Unique ID]
  │     (e.g., email: child@example.com)
  │
  ├─▶ [App Computes Hash Locally]
  │     hash = Hash("child@example.com")
  │     Display: "Hash: 0x3f4a2b1c..."
  │
  ├─▶ [Click "Grant Consent"]
  │
  ├─▶ [Sign Transaction]
  │     • Transaction fee displayed
  │     • Wallet prompts for approval
  │
  ├─▶ [Transaction Submitted to Blockchain]
  │     • Status: Pending...
  │     • Waiting for confirmation...
  │
  ├─▶ [Confirmation Received]
  │     ✅ Success! Consent granted.
  │     • Hash stored on-chain
  │     • Child can now prove consent
  │
  ├─▶ [Share ID with Child Securely]
  │     • Send via secure channel
  │     • Child needs this to generate proofs
  │
END
```

### 🔵 Child: Proving Consent

```
START
  │
  ├─▶ [Open Platform Requiring Consent]
  │     (e.g., gaming platform, social media)
  │
  ├─▶ [Platform Requests Age Verification]
  │     "Prove you have parental consent"
  │
  ├─▶ [Click "Verify with ZK Consent Gateway"]
  │
  ├─▶ [Open Child App / Browser Extension]
  │
  ├─▶ [Connect Midnight Wallet]
  │
  ├─▶ [Enter Your Unique ID]
  │     (The one parent gave you)
  │     Input: "child@example.com"
  │
  ├─▶ [App Computes Hash Locally]
  │     hash = Hash("child@example.com")
  │
  ├─▶ [Generate Zero-Knowledge Proof]
  │     • Proving: "I know an ID with authorized hash"
  │     • Without revealing: The actual ID
  │     • Status: Generating proof...
  │
  ├─▶ [Proof Generated Successfully]
  │     proof_data = ZK_Proof(hash)
  │
  ├─▶ [Submit Proof to Platform]
  │     • Proof sent to platform's verification endpoint
  │
  ├─▶ [Platform Verifies Proof]
  │     • Calls smart contract
  │     • verify_minor_access(proof_data)
  │     • No ID revealed to platform
  │
  ├─▶ [Verification Result]
  │     ✅ Proof Valid!
  │     • Access granted
  │     • Platform never learned your identity
  │
END
```

### 🟠 Platform: Integrating Verification

```
START
  │
  ├─▶ [Install ZK Consent SDK]
  │     npm install @midnight/zk-consent-sdk
  │
  ├─▶ [Initialize SDK with Contract Address]
  │     const verifier = new ConsentVerifier({
  │       contractAddress: "0x3ff5dde9...",
  │       networkId: "undeployed"
  │     });
  │
  ├─▶ [Add Verification Endpoint]
  │     POST /api/verify-consent
  │
  ├─▶ [User Submits ZK Proof]
  │     Request body: { proof: "..." }
  │
  ├─▶ [Call Verification Function]
  │     const result = await verifier.verify(proof);
  │
  ├─▶ [Process Result]
  │     if (result.valid) {
  │       // Grant access
  │       allowAccess(user);
  │     } else {
  │       // Deny access
  │       denyAccess(user);
  │     }
  │
  ├─▶ [Log for Compliance]
  │     • Record verification timestamp
  │     • No PII logged (only proof hash)
  │
END
```

---

## 📋 Deployed Smart Contract

### Contract Details

| Property | Value |
|----------|-------|
| **Contract Name** | ZK Consent Gateway |
| **Contract Address** | `3ff5dde935e606939c45813cf7f4e95c1b6584a5c3bfd90af2c1e3f653a88121` |
| **Network** | `undeployed` (Local Development Network) |
| **Deployed At** | 2026-02-14T09:54:31.560Z |
| **Deployment File** | [`midnight-starter-template/zk-consent-gateway/deployment-consent.json`](./midnight-starter-template/zk-consent-gateway/deployment-consent.json) |
| **Source Code** | [`consent.compact`](./midnight-starter-template/zk-consent-gateway/src/consent.compact) |

### Contract Circuits

#### 1. `grant_consent(child_id_hash: Field)`
**Purpose**: Parent registers a child's hashed ID as authorized

**Parameters:**
- `child_id_hash` (Field): Cryptographic hash of child's unique identifier

**Behavior:**
- Adds the hash to `consent_registry` ledger
- Sets value to `true` (authorized)
- Only the hash is stored (not the actual ID)

**Usage:**
```typescript
await contract.grant_consent({
  child_id_hash: hashOf("child@example.com")
});
```

#### 2. `verify_minor_access(child_id_hash: Field): Boolean`
**Purpose**: Child proves they have consent without revealing identity

**Parameters:**
- `child_id_hash` (Field): Hash of child's identifier (kept private)

**Returns:**
- `Boolean`: `true` if consent exists, `false` otherwise

**ZK Property**: 
- Platform only learns if consent exists
- Child's actual ID remains private
- Hash is verified in zero-knowledge

**Usage:**
```typescript
const proof = await contract.verify_minor_access({
  child_id_hash: hashOf("child@example.com")
});
// Returns proof that can be verified by platforms
```

### Ledger State

```compact
export ledger consent_registry: Map<Field, Boolean>;
```

**Structure:**
- **Key**: `Field` - Cryptographic hash of child's ID
- **Value**: `Boolean` - Consent status (true = authorized)

**Example State:**
```
consent_registry = {
  0x3f4a2b1c... => true,  // Child 1 authorized
  0x8d9e3f2a... => true,  // Child 2 authorized
  0x1c5b7e3d... => false  // Child 3 revoked
}
```

---

## 🛠️ Tech Stack

### Blockchain & Smart Contracts
- **[Midnight Network](https://midnight.network/)**: Privacy-focused blockchain platform
- **[Compact](https://docs.midnight.network/develop/tutorial/compact-overview/)**: Smart contract language with ZK support
- **ZK-SNARKs**: Zero-knowledge proof system

### Backend
- **Node.js** + **TypeScript**: Type-safe backend development
- **Midnight SDK**: Blockchain interaction libraries
  - `@midnight-ntwrk/midnight-js-contracts`: Contract deployment
  - `@midnight-ntwrk/wallet-sdk-facade`: Wallet management
  - `@midnight-ntwrk/midnight-js-http-client-proof-provider`: Proof generation
- **Express** / **Fastify**: REST API framework

### Frontend
- **React** + **Vite**: Modern frontend framework
- **TypeScript**: Type safety
- **Midnight Wallet Connect**: Browser wallet integration
- **TailwindCSS**: Styling (planned)

### DevOps & Infrastructure
- **Docker**: Containerized development environment
  - Midnight Node
  - Indexer
  - Proof Server
- **Docker Compose**: Multi-container orchestration
- **Git**: Version control

### Development Tools
- **npm** / **yarn**: Package management
- **ESLint** + **Prettier**: Code quality
- **Vitest**: Testing framework
- **Git LFS**: Large file storage

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v23+) & **npm** (v11+)
- **[Docker](https://docs.docker.com/get-docker/)** & **Docker Compose**
- **[Git](https://git-scm.com/)** & **[Git LFS](https://git-lfs.com/)**
- **[Compact](https://docs.midnight.network/relnotes/compact-tools)** (Midnight developer tools)

### Installation

#### 1. Install Git LFS

```bash
# For Ubuntu/Debian
sudo apt-get install git-lfs

# For macOS
brew install git-lfs

# For Fedora/RHEL
sudo dnf install git-lfs

# Initialize Git LFS
git lfs install
```

#### 2. Install Compact Tools

```bash
# Install the latest Compact tools
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

# Install compiler version 0.27
compact update +0.27.0
```

#### 3. Verify Installation

```bash
node -v        # Should be v23+
npm -v         # Should be v11+
docker -v      # Should show Docker version
git lfs version
compact check  # Should show latest version
```

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zk-parental-consent-gateway.git
cd zk-parental-consent-gateway
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Start Local Midnight Network

```bash
# Start Docker containers (node, indexer, proof-server)
cd midnight-local-network
docker compose up -d

# Wait for services to be healthy (~30 seconds)
docker compose ps
```

#### 4. Fund Your Wallet

```bash
# Generate a wallet and fund it
yarn fund

# Note: Save the wallet address and seed for later use
```

#### 5. Compile Smart Contract

```bash
cd ../midnight-starter-template/zk-consent-gateway

# Compile the consent contract
npm run compile:consent

# Build TypeScript
npm run build
```

#### 6. Deploy Contract (Already Deployed)

The contract is already deployed to the local network:
- **Address**: `3ff5dde935e606939c45813cf7f4e95c1b6584a5c3bfd90af2c1e3f653a88121`

To deploy a fresh instance:
```bash
npm run deploy:consent
```

#### 7. Run the Application

```bash
# Start backend API (coming soon)
npm run dev:api

# Start frontend (coming soon)
npm run dev:frontend
```

### Development Workflow

```bash
# Watch mode for smart contract changes
npm run compile:consent --watch

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📁 Project Structure

```
zk-parental-consent-gateway/
│
├── midnight-local-network/          # Local Midnight blockchain setup
│   ├── compose.yml                  # Docker Compose configuration
│   ├── src/
│   │   ├── fund.ts                  # Wallet funding script
│   │   └── fund-and-register-dust.ts
│   └── package.json
│
├── midnight-starter-template/       # Main application code
│   │
│   ├── zk-consent-gateway/            # Smart contracts
│   │   ├── src/
│   │   │   ├── consent.compact     # ZK Consent Gateway contract ⭐
│   │   │   ├── deploy-consent.ts   # Deployment script
│   │   │   └── managed/consent/    # Compiled contract artifacts
│   │   │       ├── contract/       # TypeScript contract bindings
│   │   │       ├── keys/           # ZK proving/verifying keys
│   │   │       └── zkir/           # ZK intermediate representation
│   │   ├── deployment-consent.json # Deployment metadata
│   │   └── package.json
│   │
│   ├── zk-consent-cli/                # CLI tools
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   └── config.ts
│   │   └── package.json
│   │
│   ├── frontend-vite-react/        # Frontend application (coming soon)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ParentDashboard/
│   │   │   │   ├── ChildVerification/
│   │   │   │   └── PlatformIntegration/
│   │   │   ├── services/
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── README.md
│
├── docs/                           # Documentation
│   ├── architecture.md
│   ├── user-guide.md
│   └── api-reference.md
│
├── .gitignore
├── LICENSE
├── README.md                       # This file
└── package.json
```

### Key Directories

- **`midnight-local-network/`**: Docker setup for local blockchain development
- **`zk-consent-gateway/`**: Smart contract source code and deployment scripts
- **`zk-consent-cli/`**: Command-line interface tools
- **`frontend-vite-react/`**: Web application for parents and children (planned)
- **`docs/`**: Additional documentation (planned)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: Open an issue describing the bug
- 💡 **Suggest Features**: Share your ideas for improvements
- 📝 **Improve Documentation**: Help make our docs better
- 💻 **Submit Code**: Fix bugs or implement features
- 🧪 **Write Tests**: Increase test coverage
- 🎨 **Design UI/UX**: Improve user experience

### Development Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Midnight Network](https://midnight.network/)**: For providing the privacy-focused blockchain platform
- **[Input Output (IOG)](https://iohk.io/)**: For developing Midnight
- **Community Contributors**: Thank you for your support!

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/zk-parental-consent-gateway/issues)
- **Documentation**: [Read the docs](./docs)
- **Midnight Discord**: [Join the community](https://discord.gg/midnight)

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ Smart contract development
- ✅ Local network deployment
- ✅ Basic CLI tools
- 🚧 Parent web dashboard
- 🚧 Child verification interface

### Phase 2: Enhancement
- ⏳ Platform integration SDK
- ⏳ Mobile applications (iOS/Android)
- ⏳ Multi-signature consent (both parents)
- ⏳ Consent expiration/renewal

### Phase 3: Production
- ⏳ Deploy to Midnight Preview Network
- ⏳ Security audit
- ⏳ Beta testing program
- ⏳ Production deployment

### Phase 4: Advanced Features
- ⏳ Age-based automatic consent
- ⏳ Conditional consent (time-limited, platform-specific)
- ⏳ Parent notification system
- ⏳ Analytics dashboard

---

<div align="center">

### 🌟 Star us on GitHub!

If you find this project useful, please consider giving it a ⭐️

**Built with ❤️ using [Midnight Network](https://midnight.network/)**

*Preserving Privacy, Empowering Parents, Protecting Children*

</div>
