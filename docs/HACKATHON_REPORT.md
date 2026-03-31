# RWA Tokenization Platform - User + Hackathon Report

## 1. Executive Summary

This project enables real-world asset tokenization on Hedera Testnet:

- Each asset is minted as an ERC-721 NFT in `AssetRegistry`.
- Ownership is fractionalized into ERC-1155 shares in `FractionalToken`.
- Shares are traded in an escrow-based marketplace with royalty payouts in `Marketplace`.
- Governance, permissions, and emergency controls are managed by `Admin`.

In short: we turn illiquid assets into compliant, tradable, fractional digital ownership.

## 2. Problem Statement

Real-world assets are hard to split, hard to trade, and often inaccessible for smaller investors.

Current pain points:

- High capital barrier to entry.
- Limited liquidity.
- Weak transparency for ownership changes.
- Manual/fragmented royalty handling.

## 3. Solution Overview

Our platform solves this with an on-chain flow:

1. Admin authorizes issuers.
2. Issuer creates asset NFT with metadata URI.
3. Issuer mints fractional shares.
4. Users list and buy fractions in marketplace.
5. Royalty is automatically calculated and paid during purchases.

## 4. Architecture

### Contracts

- `Admin.sol`: owner, issuer, manager roles + pause control.
- `AssetRegistry.sol`: ERC-721 asset registration + ERC-2981 royalties.
- `FractionalToken.sol`: ERC-1155 fractional shares keyed by `assetId`.
- `Marketplace.sol`: escrow listing, partial buy, royalty payout.
- `IncomeDistributor.sol` and `HtsAdapter.sol`: optional/extended modules.

### Frontend

- React + TypeScript + Vite.
- Wallet connection via MetaMask (Hedera Testnet, chainId 296).
- Role pages: Home, Admin, Issuer, Marketplace, Dashboard (+ Assets, Transactions, Settings).

## 5. How To Run (Local Demo)

### Prerequisites

- Node.js 18+
- Foundry
- MetaMask
- Hedera Testnet HBAR in demo wallets

### Start frontend

```bash
cd frontend
npm install
npm run dev
```

### Start contracts workflow (optional for fresh deployment)

```bash
forge build
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --private-key $ADMIN_PK
```

### Important network config

- Chain ID: `296`
- RPC: `https://testnet.hashio.io/api`

## 6. User Guide (End-to-End Flow)

### A. Admin setup

1. Open `/admin`.
2. Login with admin credentials.
3. Connect the owner wallet.
4. Add issuer wallet in Issuer Management.
5. Confirm marketplace is active (not paused).

### B. Issuer onboarding and minting

1. Open `/issuer`.
2. Connect issuer wallet.
3. (Optional) upload metadata/doc to IPFS.
4. Create asset on-chain using metadata URI.
5. Verify asset owner and URI.
6. Mint ERC-1155 fractions for asset ID.
7. Verify total shares and issuer/user balance.

### C. Trading flow

1. Open `/marketplace`.
2. Connect seller wallet.
3. Approve marketplace for ERC-1155 transfers.
4. List fractions (asset ID, amount, unit price).
5. Connect buyer wallet.
6. Buy listing fractions.
7. Check updated balances and recent listings.

### D. Dashboard utilities

- `/assets`: view wallet shares by asset ID.
- `/transactions`: fetch recent listings and offers.
- `/settings`: wallet/network helpers.

## 7. Hackathon Demo Script (5-7 minutes)

### Minute 0-1: Problem + Vision

- "Asset ownership is expensive and illiquid."
- "We convert one asset into many investable fractions with transparent on-chain ownership."

### Minute 1-2: Architecture

- Show contract map quickly:
  - Admin (permissions)
  - AssetRegistry (NFT + royalty)
  - FractionalToken (shares)
  - Marketplace (escrow trading)

### Minute 2-4: Live flow

1. Admin assigns issuer.
2. Issuer creates asset and mints fractions.
3. Seller approves + lists.
4. Buyer purchases.
5. Highlight automatic royalty payout.

### Minute 4-5: Why this matters

- Lower entry barrier.
- Better liquidity.
- Transparent ownership and transfer history.
- Royalties enforced by protocol logic.

### Minute 5-7: Roadmap

- Add identity/KYC gates.
- Add legal wrappers for jurisdiction compliance.
- Add richer analytics and portfolio view.
- Integrate production-grade IPFS/document verification pipelines.

## 8. What To Tell Judges (Pitch Points)

### Innovation

- Combines ERC-721 asset registry + ERC-1155 fractional ownership + royalty-aware marketplace.
- Uses escrow model to reduce transfer/settlement risk.

### Feasibility

- Smart contracts are modular and role-governed.
- Frontend demonstrates full user flow from issuance to trading.
- Hedera testnet deployment and wallet switching are integrated.

### Business impact

- Democratizes access to premium and illiquid assets.
- Enables secondary liquidity and recurring royalty economics.
- Applicable to real estate, art, carbon credits, and commodity receipts.

## 9. Demo Checklist (Before Presenting)

- MetaMask on Hedera testnet.
- Wallets funded with test HBAR.
- Correct contract addresses loaded in UI.
- Owner wallet available for admin actions.
- Issuer wallet available for minting.
- Buyer wallet available for purchase.
- Browser tabs prepared: Admin, Issuer, Marketplace.

## 10. Known Limitations (Be Transparent)

- Full `npm run build` currently includes pre-existing TypeScript test-file issues not affecting runtime demo flow.
- Some optional modules (IncomeDistributor/HTS adapter) depend on separate deployment/config.
- IPFS flow requires Pinata JWT configuration for file/json pinning.

## 11. Suggested Q&A Answers

### Q: How do you enforce permissions?

A: `Admin` contract controls issuer/manager roles. Sensitive actions check role/owner on-chain.

### Q: How are royalties handled?

A: `Marketplace` queries `AssetRegistry.royaltyInfo(...)` and splits payment atomically on buy.

### Q: What prevents fake assets?

A: Issuer-gated minting and metadata URI standards. Next step is identity/KYC and document attestation.

### Q: Why Hedera?

A: Predictable fees, fast finality, and EVM compatibility for Solidity tooling.

## 12. One-Line Pitch

"We make real-world assets investable by turning a single verified asset into tradable, royalty-aware fractional ownership on Hedera."
