# LearnChain - Decentralized Learning Incentive and Certification System

## Overview

LearnChain is a blockchain-based Proof-of-Learning (PoL) protocol that provides learning certification and incentive mechanisms. It allows learners to obtain non-transferable learning credentials (Soul-Bound Tokens) after completing tasks and implements reward distribution through smart contracts.

## Vision

Build a verifiable, trustless, cross-institutional learning achievement certification system that revolutionizes how educational credentials are issued, verified, and shared.

## Key Features

- **Task Management System**: Educators and institutions can create learning tasks with customizable parameters
- **Proof-of-Learning Verification**: Cryptographic verification of learning achievements using EIP-712 signatures
- **Soul-Bound Tokens (SBT)**: Non-transferable learning credentials based on ERC-4973 standard
- **Multi-Asset Reward System**: Support for ERC20 tokens and NFT badge rewards
- **Institution Registry**: Whitelist management for educational institutions with verification APIs
- **Zero-Knowledge Proofs**: Optional zk-SNARK integration for privacy-preserving verification

## Architecture

```
[Students / Educators]
   │
   ├─→ TaskManager.sol → Task creation and management
   ├─→ LearningProof.sol → Learning achievement verification
   ├─→ RewardManager.sol → Reward distribution (points/tokens)
   ├─→ CredentialSBT.sol → Mint learning credentials
   ├─→ InstitutionRegistry.sol → Institution verification
   └─→ Subgraph + Dashboard → Data visualization layer
```

## Tech Stack

- **Smart Contracts**: Solidity + Hardhat + OpenZeppelin
- **Zero-Knowledge**: zk-SNARKs / Circom (optional)
- **Indexing**: TheGraph Subgraph
- **Frontend**: Next.js + wagmi + viem
- **Verification**: Chainlink Oracle / REST API
- **Storage**: IPFS / Arweave
- **Analytics**: Dune + Subgraph Dashboard

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Hardhat
- Git

### Quick Installation

```bash
git clone https://github.com/janujanjida/LearnChain.git
cd LearnChain
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## Core Contracts

- **TaskManager.sol**: Task publishing and management
- **LearningProof.sol**: Verification and signature validation (EIP-712 / zk-SNARK)
- **RewardManager.sol**: Multi-asset reward distribution
- **CredentialSBT.sol**: Learning credentials (ERC-4973)
- **InstitutionRegistry.sol**: Educational institution authentication

## Security Features

1. **Identity Uniqueness**: SBT non-transferable, wallet-bound identity
2. **Zero-Knowledge Verification**: Prevent achievement forgery
3. **Reward Anti-Duplication**: Nonce-based duplicate prevention
4. **Institution Authentication**: Whitelist + multi-sig verification
5. **Contract Security**: Pull payment pattern, event auditing, Slither audits

## Roadmap

- [x] Phase 1: Project initialization and basic infrastructure
- [x] Phase 2: Core contract development
- [x] Phase 3: Testing and security audits
- [ ] Phase 4: Frontend development
- [ ] Phase 5: Mainnet deployment

## Contract Addresses

### Testnet (Sepolia)
- LearnToken: TBD
- TaskManager: TBD
- LearningProof: TBD
- CredentialSBT: TBD
- RewardManager: TBD
- InstitutionRegistry: TBD

### Mainnet
- Coming soon

## Use Cases

- Online education platforms
- Professional training and certification
- University credit systems
- DAO education ecosystems
- Skill verification for employment

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## Performance

- **Gas Optimized**: Efficient contract design minimizing transaction costs
- **Scalable**: Supports multiple L2 solutions for high throughput
- **Secure**: Comprehensive security measures and access controls

## Community

- **Discord**: Join our developer community
- **Twitter**: Follow @LearnChain for updates
- **Forum**: Discuss ideas and get support

## Acknowledgments

Built with:
- Hardhat
- OpenZeppelin Contracts
- Ethers.js
- TheGraph

Special thanks to all contributors and the Web3 education community.

## License

MIT License - see LICENSE file for details

## Contact

For questions and support, please open an issue on GitHub or reach us at:
- Email: support@learnchain.io
- Discord: [Community Server]
- Twitter: @LearnChain

