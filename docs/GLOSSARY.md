# Glossary

## General Terms

**LearnChain**: Decentralized learning certification and incentive protocol built on blockchain technology.

**Proof-of-Learning (PoL)**: Cryptographic proof mechanism that validates completion of learning activities.

**Soul-Bound Token (SBT)**: Non-transferable NFT representing credentials or achievements, permanently linked to a wallet address.

**EIP-712**: Ethereum Improvement Proposal for typed structured data hashing and signing.

**IPFS**: InterPlanetary File System - distributed storage network for storing metadata and learning content.

## Smart Contract Terms

**TaskManager**: Contract managing the lifecycle of learning tasks including creation, tracking, and completion.

**LearningProof**: Contract handling proof submission and cryptographic verification of learning achievements.

**CredentialSBT**: Contract implementing soul-bound tokens for issuing non-transferable learning credentials.

**RewardManager**: Contract managing reward distribution and calculation based on task difficulty.

**InstitutionRegistry**: Contract managing registration and verification of educational institutions.

**LearnChainCoordinator**: Central orchestration contract coordinating workflows between all system contracts.

## Roles

**Admin**: Highest privilege role with full contract management capabilities.

**Task Creator**: Role allowed to create new learning tasks.

**Verifier**: Role authorized to verify submitted proofs and mark completions.

**Minter**: Role allowed to mint new credentials.

**Distributor**: Role authorized to distribute rewards to learners.

## Task Terms

**Task**: A learning activity with defined requirements, rewards, and verification criteria.

**Task Status**: Current state of a task - ACTIVE, PAUSED, COMPLETED, or CANCELLED.

**Difficulty Level**: Task complexity rating - BEGINNER, INTERMEDIATE, ADVANCED, or EXPERT.

**Base Reward**: Minimum reward amount before difficulty multiplier is applied.

**Max Completions**: Maximum number of learners who can complete a specific task.

**Verifier Address**: Ethereum address authorized to verify completions for a specific task.

## Proof Terms

**Proof Hash**: Keccak256 hash of learning achievement data submitted for verification.

**Nonce**: Unique number preventing replay attacks in signature verification.

**Deadline**: Expiration timestamp for signature validity.

**Domain Separator**: EIP-712 parameter ensuring signatures are only valid for specific contract and chain.

## Reward Terms

**LEARN Token**: Native ERC20 utility token used for rewarding learners.

**Reward Multiplier**: Factor applied to base reward based on task difficulty (in basis points).

**Basis Points**: Unit for multiplier calculation where 10000 = 100% (1.0x).

**Pending Rewards**: Accumulated but unclaimed rewards for a learner.

**Reward History**: Record of all rewards earned by a learner.

## Credential Terms

**Token ID**: Unique identifier for each minted credential SBT.

**Metadata URI**: IPFS or Arweave link containing detailed credential information.

**Issuer**: Entity or contract that minted the credential.

**Revocation**: Process of invalidating a credential, typically due to fraud.

## Institution Terms

**Institution Status**: Registration state - PENDING, VERIFIED, SUSPENDED, or REVOKED.

**Whitelist**: List of verified institutions authorized to create tasks.

**Tasks Created**: Counter tracking number of tasks published by an institution.

**Credentials Issued**: Counter tracking number of credentials minted through institution's tasks.

## Security Terms

**Reentrancy Guard**: Protection mechanism preventing recursive call attacks.

**Access Control**: System managing permissions and roles for contract functions.

**Pull Payment**: Pattern where users claim payments rather than automatically receiving them.

**Signature Verification**: Process of validating cryptographic signatures using public key cryptography.

**Multi-sig Wallet**: Wallet requiring multiple signatures to execute transactions.

## Technical Terms

**Gas**: Unit measuring computational work required for blockchain transactions.

**Wei**: Smallest denomination of Ether (1 ETH = 10^18 wei).

**ABI**: Application Binary Interface - JSON format describing contract functions.

**Event**: Blockchain log entry emitted by smart contracts for indexing and notifications.

**Modifier**: Solidity construct for reusable function validation logic.

## Integration Terms

**TheGraph**: Decentralized indexing protocol for querying blockchain data.

**Subgraph**: GraphQL API built on TheGraph for querying specific contract data.

**Wagmi**: React hooks library for Ethereum interactions.

**Viem**: TypeScript library for Ethereum with type safety.

## Workflow Terms

**Task Creation Workflow**: Process of creating, configuring, and publishing a learning task.

**Proof Submission Workflow**: Process of completing task, generating proof, and submitting for verification.

**Verification Workflow**: Process of reviewing and approving or rejecting submitted proofs.

**Reward Claiming Workflow**: Process of claiming accumulated rewards to learner's wallet.

**Credential Minting Workflow**: Process of issuing SBT credential after successful task completion.

## Network Terms

**Mainnet**: Primary Ethereum network using real ETH and tokens.

**Testnet**: Test Ethereum network (e.g., Sepolia) using test ETH for development.

**Layer 2 (L2)**: Scaling solution built on top of Ethereum (e.g., Polygon, Arbitrum).

**RPC URL**: Remote Procedure Call endpoint for connecting to blockchain networks.

## Data Terms

**On-chain**: Data stored directly on the blockchain, permanently recorded.

**Off-chain**: Data stored externally (IPFS, traditional databases) with only hash/reference on-chain.

**Oracle**: Service providing external data to smart contracts.

**Chainlink**: Decentralized oracle network for reliable off-chain data feeds.

