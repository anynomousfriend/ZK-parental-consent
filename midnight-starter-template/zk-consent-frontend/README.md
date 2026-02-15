# 🔐 ZK Parental Consent Gateway - Frontend

Privacy-preserving parental consent system built on Midnight Network.

## 🚀 Quick Start

### Prerequisites

- **Node.js** v23+ and npm v11+
- **Docker** and Docker Compose (for local Midnight network)
- **Midnight Docker Network** running (see instructions below)

### 1. Start Docker Testnet

```bash
cd ../midnight-local-network
docker compose up -d
```

Wait ~10 seconds for services to be healthy:
- ✅ Node (port 9944)
- ✅ Indexer (port 8088)
- ✅ Proof Server (port 6300)

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 How to Use

### Parent Dashboard

1. Click **"Parent"** tab in the header
2. Click **"Connect Lace Wallet"** (currently mocked for development)
3. Enter a unique identifier for your child (e.g., `child@example.com`)
4. Click **"Generate Hash"** to create a cryptographic hash
5. Click **"Grant Consent"** to store the hash on-chain (currently simulated)
6. **Securely share** the identifier with your child

### Child App

1. Click **"Child"** tab in the header
2. Click **"Connect Lace Wallet"** (currently mocked for development)
3. Enter the **same identifier** your parent gave you
4. Click **"Verify Consent & Login"**
5. If verified ✅, you'll see the **Cat Zone** TikTok-like feed!

---

## 🎯 Features

### ✅ Implemented
- Parent Dashboard with consent granting UI
- Child App with verification and login
- TikTok-like vertical scroll feed with cat GIFs
- Toggle between Parent/Child modes
- Hash generation utility
- Wallet service (mocked for development)
- Tailwind CSS styling
- Responsive design

### 🚧 TODO (Next Steps)
- Integrate actual Lace Wallet via dapp-connector-api
- Implement real smart contract calls (grant_consent circuit)
- Implement on-chain hash verification
- Replace simple hash with Midnight Field hash
- Add ZK proof generation for child verification
- Deploy to testnet/mainnet

---

## 🏗️ Project Structure

```
zk-consent-frontend/
├── src/
│   ├── components/
│   │   ├── ParentDashboard.tsx    # Parent consent granting UI
│   │   ├── ChildApp.tsx           # Child login and verification
│   │   └── TikTokFeed.tsx         # Cat GIF feed (post-login)
│   ├── hooks/
│   │   └── useWallet.ts           # React hook for wallet state
│   ├── lib/
│   │   ├── config.ts              # Network configuration
│   │   ├── hash.ts                # Hash generation utility
│   │   └── wallet.ts              # Wallet service (mock)
│   ├── App.tsx                    # Main app with mode toggle
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind CSS
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🔧 Configuration

### Network Settings

Edit `src/lib/config.ts` to change network endpoints:

```typescript
export const MIDNIGHT_CONFIG = {
  node: 'http://127.0.0.1:9944',
  indexer: 'http://127.0.0.1:8088/api/v1/graphql',
  proofServer: 'http://127.0.0.1:6300',
  contractAddress: '3ff5dde935e606939c45813cf7f4e95c1b6584a5c3bfd90af2c1e3f653a88121',
  networkId: 'undeployed',
};
```

---

## 🧪 Development Notes

### Current Limitations

1. **Wallet Integration**: Currently using mock wallet. Real Lace Wallet integration pending.
2. **Hash Function**: Using simple JS hash. Needs to be replaced with Midnight Field hash.
3. **Smart Contract**: Not yet integrated. Transactions are simulated.
4. **Verification**: Hash checks are simulated locally, not on-chain.

### Next Integration Steps

1. **Integrate dapp-connector-api**:
   ```typescript
   import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
   ```

2. **Connect to deployed contract**:
   - Import contract from `../zk-consent-gateway/src/managed/consent/contract/`
   - Call `grant_consent()` and `verify_minor_access()` circuits

3. **Use Midnight Field hash**:
   - Import from `@midnight-ntwrk/compact-runtime`
   - Replace `simpleHash()` function

---

## 📦 Build

```bash
npm run build
```

Output in `dist/` directory.

---

## 🐛 Troubleshooting

### Docker not running

```bash
cd ../midnight-local-network
docker compose ps
# Should show 3 services running
```

### Port conflicts

Frontend runs on port 5173 by default. Change in `vite.config.ts` if needed.

### Build errors

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🔐 Privacy & Security

- **Zero-Knowledge**: Child's identity is never revealed to platforms
- **Hash-Based**: Only cryptographic hashes stored on-chain
- **Decentralized**: No central authority controls consent
- **Parent Control**: Only parents can grant/revoke consent (when fully integrated)

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions welcome! See main project README for guidelines.
