# LearnChain Architecture

## System Overview

LearnChain implements a decentralized learning certification system with the following core components:

## Core Contracts

### 1. TaskManager
**Purpose**: Manages learning task lifecycle

**Key Features**:
- Task creation and management
- Task status tracking (Active, Paused, Completed, Cancelled)
- Difficulty levels (Beginner, Intermediate, Advanced, Expert)
- Completion tracking and verification
- Role-based access control for task creators

**Key Functions**:
```solidity
function createTask(...) external returns (uint256 taskId)
function updateTaskStatus(uint256 taskId, TaskStatus status) external
function markTaskCompleted(uint256 taskId, address learner) external
function getTask(uint256 taskId) external view returns (Task memory)
```

### 2. LearningProof
**Purpose**: Verifies learning achievements using cryptographic proofs

**Key Features**:
- EIP-712 signature verification
- Proof submission and validation
- Nonce-based replay protection
- Verifier authorization

**Key Functions**:
```solidity
function submitProof(uint256 taskId, bytes32 proofHash, bytes memory signature) external
function verifyProof(uint256 taskId, address learner, bool approved, string memory reason) external
function isProofVerified(uint256 taskId, address learner) external view returns (bool)
```

### 3. CredentialSBT
**Purpose**: Issues non-transferable learning credentials

**Key Features**:
- ERC-4973 Soul-Bound Token implementation
- Non-transferable credentials
- Revocation capability
- Metadata URI support

**Key Functions**:
```solidity
function mintCredential(address learner, uint256 taskId, string memory metadataURI) external returns (uint256)
function revokeCredential(uint256 tokenId, string memory reason) external
function getCredentialsByLearner(address learner) external view returns (uint256[] memory)
```

### 4. RewardManager
**Purpose**: Distributes rewards for completed tasks

**Key Features**:
- Configurable reward multipliers based on difficulty
- ERC20 token distribution
- Reward claiming mechanism
- Reward history tracking

**Key Functions**:
```solidity
function distributeReward(uint256 taskId, address learner, Difficulty difficulty, RewardType rewardType) external
function claimRewards() external
function calculateReward(Difficulty difficulty) external view returns (uint256)
```

### 5. InstitutionRegistry
**Purpose**: Manages educational institution verification

**Key Features**:
- Institution registration
- Verification workflow
- Status management (Pending, Verified, Suspended, Revoked)
- Task and credential tracking

**Key Functions**:
```solidity
function registerInstitution(string memory name, string memory metadataURI) external
function verifyInstitution(address institutionAddress) external
function isVerified(address institutionAddress) external view returns (bool)
```

### 6. LearnChainCoordinator
**Purpose**: Orchestrates workflows between contracts

**Key Features**:
- Complete task workflow automation
- Statistics aggregation
- Cross-contract coordination

**Key Functions**:
```solidity
function completeTaskWorkflow(uint256 taskId, address learner, string memory metadataURI) external
function getLearnerStats(address learner) external view returns (...)
function getInstitutionStats(address institution) external view returns (...)
```

## Data Flow

### Learning Workflow

1. **Task Creation**
   - Institution registers via `InstitutionRegistry`
   - Institution gets verified by admin
   - Institution creates task via `TaskManager`

2. **Learning and Proof Submission**
   - Learner completes learning task
   - Learner generates proof of completion
   - Learner submits proof via `LearningProof` with EIP-712 signature

3. **Verification**
   - Authorized verifier reviews proof
   - Verifier approves or rejects via `LearningProof.verifyProof()`
   - Task marked as completed in `TaskManager`

4. **Reward and Credential Issuance**
   - `RewardManager` calculates and distributes rewards
   - `CredentialSBT` mints soul-bound credential
   - Learner can claim accumulated rewards

## Security Measures

### 1. Access Control
- Role-based permissions (Admin, Verifier, Creator, Minter, Distributor)
- OpenZeppelin AccessControl implementation
- Multi-signature support for critical operations

### 2. Reentrancy Protection
- ReentrancyGuard on state-changing functions
- Pull payment pattern for reward claims

### 3. Signature Verification
- EIP-712 typed structured data hashing
- Nonce-based replay protection
- Deadline enforcement

### 4. Soul-Bound Tokens
- Transfer prevention for credentials
- Immutable ownership
- Revocation capability for fraud prevention

### 5. Input Validation
- Parameter validation on all public functions
- Zero address checks
- Overflow/underflow protection (Solidity 0.8+)

## Integration Points

### IPFS/Arweave
- Task metadata storage
- Credential metadata storage
- Proof data storage

### Chainlink Oracle (Future)
- Off-chain proof verification
- External data integration
- Automated task verification

### TheGraph
- Event indexing
- Query optimization
- Real-time data aggregation

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│        wagmi + viem + RainbowKit        │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│         Smart Contracts Layer           │
│  ┌───────────────────────────────────┐  │
│  │    LearnChainCoordinator          │  │
│  └───────────┬───────────────────────┘  │
│              ↓                           │
│  ┌──────────────────────────────────┐   │
│  │  TaskManager  │  LearningProof   │   │
│  │  CredentialSBT│  RewardManager   │   │
│  │  InstitutionRegistry             │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│         Blockchain Networks             │
│  Ethereum │ Polygon │ Arbitrum │ ...    │
└─────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│         Storage & Indexing              │
│    IPFS/Arweave  │  TheGraph Subgraph   │
└─────────────────────────────────────────┘
```

## Gas Optimization

- Efficient storage patterns
- Batch operations support
- Event-driven architecture
- Minimal on-chain data storage

## Upgradeability Considerations

Current contracts are non-upgradeable for security. Future versions may implement:
- Transparent proxy pattern
- UUPS proxy pattern
- Diamond pattern for modularity

## Monitoring and Analytics

- Event emission for all state changes
- TheGraph subgraph for data aggregation
- Dune Analytics dashboards
- Real-time monitoring of contract interactions

