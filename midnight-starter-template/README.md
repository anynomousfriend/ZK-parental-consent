# Midnight ZK Consent Gateway

A privacy-preserving parental consent application built on the Midnight Network. This full-stack DApp demonstrates:
- **Zero-Knowledge Proofs**: Proving consent without revealing the child's identity.
- **DApp Connector API v4**: Connecting to Lace wallet for on-chain interactions.
- **Hybrid Architecture**: Browser-based verification combined with a local backend for heavy proof generation.

## 📦 Prerequisites

- **Node.js** (v18+)
- **Docker** (Desktop or Engine, running)
- **Lace Wallet** (Browser Extension)
  - Network set to: **Undeployed**
  - Developer Mode enabled

## 🚀 Quick Start (End-to-End)

Follow these steps to run the full stack locally.

### 1️⃣ Start Midnight Network (Docker)

Start the local blockchain nodes, indexer, and proof server.

```bash
cd midnight-local-network
docker compose up -d
```
> Verify that `node`, `indexer`, and `proof-server` containers are running (`docker ps`).

---

### 2️⃣ Setup Backend & Deploy Contract

The `zk-consent-gateway` serves two purposes:
1.  Deploys the smart contract.
2.  Runs a backend API bridge to handle ZK proof generation for the frontend.

**Open Terminal A:**

```bash
cd midnight-starter-template/zk-consent-gateway

# 1. Install dependencies
npm install

# 2. Compile the contract
npm run compile:consent

# 3. Deploy the contract (run once)
# Follow the prompts. You can generate a new seed or use an existing one.
npm run deploy:consent

# 4. Start the Backend Server (Keep this running!)
npm run start:server
```
> The server will listen on port `3001` and handle "Grant Consent" requests from the frontend.

---

### 3️⃣ Setup Frontend

The React application where parents grant consent and children verify it.

**Open Terminal B:**

```bash
cd midnight-starter-template/zk-consent-frontend

# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```
> The app will open at [http://localhost:5173](http://localhost:5173).

---

## 🎮 Usage Guide

### Parent Flow (Granting Consent)
1.  Open [http://localhost:5173](http://localhost:5173) and switch to **Parent Mode**.
2.  Click **"Connect Lace Wallet"** (ensure Lace is on "Undeployed" network).
3.  Enter a child identifier (e.g., `simba@lionking.com`).
4.  Click **"Generate Secure Hash"**.
5.  Click **"Confirm & Grant Consent"**.
    - This sends the request to your local backend (`Terminal A`), which generates the ZK proof and submits the transaction.
    - Wait for the "Consent granted successfully!" message.

### Child Flow (Verifying Access)
1.  Switch the toggle to **Child Mode**.
2.  Click **"Connect Wallet"** (you can use the same wallet or a different one).
3.  Enter the **same identifier** (`simba@lionking.com`).
4.  Click **"Verify Consent & Login"**.
    - The app queries the Midnight Indexer to check if the hash exists on-chain.
    - **Success!** You will see the "Access Granted" screen with the TikTok feed.

---

## 🛠️ Troubleshooting

- **"Wallet not found"**: Ensure the Lace extension is installed and you are connected to the "Undeployed" network.
- **Backend Error**: Check `Terminal A` for logs. Ensure `deploy-consent.json` exists (created after deployment).
- **Docker Connection Refused**: Ensure Docker containers are healthy. The indexer must be reachable at `http://localhost:8088`.
