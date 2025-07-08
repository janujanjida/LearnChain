# LearnChain API Reference

> Complete API documentation for LearnChain smart contracts

**Version**: 0.9.0  
**Last Updated**: September 2025

## TaskManager

### createTask
Creates a new learning task.

```solidity
function createTask(
    string memory metadataURI,
    RewardType rewardType,
    Difficulty difficulty,
    address verifierAddress,
    uint256 baseReward,
    uint256 maxCompletions,
    uint256 expiresAt
) external returns (uint256 taskId)
```

**Parameters:**
- `metadataURI`: IPFS/Arweave URI containing task details
- `rewardType`: 0=TOKEN, 1=NFT, 2=BOTH
- `difficulty`: 0=BEGINNER, 1=INTERMEDIATE, 2=ADVANCED, 3=EXPERT
- `verifierAddress`: Address authorized to verify completions
- `baseReward`: Base reward amount in wei
- `maxCompletions`: Maximum number of learners who can complete
- `expiresAt`: Unix timestamp when task expires

**Returns:**
- `taskId`: Unique identifier for the created task

**Events:**
```solidity
event TaskCreated(uint256 indexed taskId, address indexed creator, Difficulty difficulty, uint256 baseReward)
```

### getTask
Retrieves task information.

```solidity
function getTask(uint256 taskId) external view returns (Task memory)
```

**Returns:**
```solidity
struct Task {
    uint256 taskId;
    address creator;
    string metadataURI;
    RewardType rewardType;
    Difficulty difficulty;
    address verifierAddress;
    uint256 baseReward;
    uint256 maxCompletions;
    uint256 currentCompletions;
    TaskStatus status;
    uint256 createdAt;
    uint256 expiresAt;
}
```

## LearningProof

### submitProof
Submits proof of learning completion.

```solidity
function submitProof(
    uint256 taskId,
    bytes32 proofHash,
    bytes memory signature
) external
```

**Parameters:**
- `taskId`: ID of the completed task
- `proofHash`: Keccak256 hash of proof data
- `signature`: EIP-712 signature

**EIP-712 Signature Format:**
```javascript
const domain = {
  name: "LearnChain",
  version: "1",
  chainId: chainId,
  verifyingContract: learningProofAddress
};

const types = {
  LearningProof: [
    { name: "taskId", type: "uint256" },
    { name: "learner", type: "address" },
    { name: "proofHash", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};
```

### verifyProof
Verifies submitted proof (verifier only).

```solidity
function verifyProof(
    uint256 taskId,
    address learner,
    bool approved,
    string memory reason
) external
```

**Events:**
```solidity
event ProofVerified(uint256 indexed taskId, address indexed learner, address indexed verifier, uint256 timestamp)
event ProofRejected(uint256 indexed taskId, address indexed learner, address indexed verifier, string reason)
```

## CredentialSBT

### mintCredential
Mints a soul-bound credential token.

```solidity
function mintCredential(
    address learner,
    uint256 taskId,
    string memory metadataURI
) external returns (uint256 tokenId)
```

**Returns:**
- `tokenId`: Unique identifier for the credential

**Events:**
```solidity
event CredentialMinted(uint256 indexed tokenId, address indexed learner, uint256 indexed taskId, string metadataURI)
```

### getCredentialsByLearner
Returns all credentials owned by a learner.

```solidity
function getCredentialsByLearner(address learner) external view returns (uint256[] memory)
```

### tokenURI
Returns metadata URI for a credential.

```solidity
function tokenURI(uint256 tokenId) external view returns (string memory)
```

## RewardManager

### distributeReward
Distributes rewards for task completion.

```solidity
function distributeReward(
    uint256 taskId,
    address learner,
    Difficulty difficulty,
    RewardType rewardType
) external
```

**Events:**
```solidity
event RewardDistributed(uint256 indexed taskId, address indexed learner, uint256 amount, RewardType rewardType)
```

### claimRewards
Claims accumulated rewards.

```solidity
function claimRewards() external
```

**Events:**
```solidity
event RewardClaimed(address indexed learner, uint256 amount, uint256 timestamp)
```

### calculateReward
Calculates reward amount for a difficulty level.

```solidity
function calculateReward(Difficulty difficulty) external view returns (uint256)
```

**Reward Calculation:**
```
reward = baseAmount * multiplier / 10000

Default Multipliers:
- BEGINNER: 5000 (0.5x)
- INTERMEDIATE: 10000 (1.0x)
- ADVANCED: 15000 (1.5x)
- EXPERT: 25000 (2.5x)
```

### getPendingRewards
Returns pending rewards for an address.

```solidity
function getPendingRewards(address learner) external view returns (uint256)
```

## InstitutionRegistry

### registerInstitution
Registers a new educational institution.

```solidity
function registerInstitution(
    string memory name,
    string memory metadataURI
) external
```

**Events:**
```solidity
event InstitutionRegistered(address indexed institutionAddress, string name, uint256 timestamp)
```

### verifyInstitution
Verifies an institution (admin only).

```solidity
function verifyInstitution(address institutionAddress) external
```

**Events:**
```solidity
event InstitutionVerified(address indexed institutionAddress, address indexed verifier, uint256 timestamp)
```

### isVerified
Checks if an institution is verified.

```solidity
function isVerified(address institutionAddress) external view returns (bool)
```

## LearnChainCoordinator

### completeTaskWorkflow
Completes full workflow: verify, mint credential, distribute reward.

```solidity
function completeTaskWorkflow(
    uint256 taskId,
    address learner,
    string memory metadataURI
) external
```

**Events:**
```solidity
event WorkflowCompleted(uint256 indexed taskId, address indexed learner, uint256 credentialTokenId, uint256 rewardAmount)
```

### getLearnerStats
Returns statistics for a learner.

```solidity
function getLearnerStats(address learner) external view returns (
    uint256 completedTasks,
    uint256 credentialsEarned,
    uint256 pendingRewards
)
```

### getInstitutionStats
Returns statistics for an institution.

```solidity
function getInstitutionStats(address institution) external view returns (
    bool isVerified,
    uint256 tasksCreated,
    uint256 credentialsIssued
)
```

## Error Codes

Common revert messages:
- `"Unauthorized"`: Caller lacks required role
- `"Task not active"`: Task is paused, completed, or cancelled
- `"Task expired"`: Task deadline has passed
- `"Proof already submitted"`: Duplicate proof submission
- `"Proof not verified"`: Proof verification pending or failed
- `"Reward already distributed"`: Duplicate reward distribution
- `"No pending rewards"`: No rewards available to claim
- `"Invalid signature"`: EIP-712 signature validation failed
- `"Soul-Bound: Transfer not allowed"`: Attempted credential transfer

