# Integration Guide

## Quick Start

### Install Dependencies

```bash
npm install ethers wagmi viem
```

### Connect to LearnChain

```javascript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(RPC_URL);
const taskManager = new ethers.Contract(
  TASK_MANAGER_ADDRESS,
  TaskManagerABI,
  provider
);
```

## Creating Tasks

### Example: Create a Learning Task

```javascript
async function createTask() {
  const metadataURI = "ipfs://QmTaskMetadata...";
  const rewardType = 0; // TOKEN
  const difficulty = 1; // INTERMEDIATE
  const verifierAddress = "0x...";
  const baseReward = ethers.parseEther("100");
  const maxCompletions = 100;
  const expiresAt = Math.floor(Date.now() / 1000) + (86400 * 30);

  const tx = await taskManager.createTask(
    metadataURI,
    rewardType,
    difficulty,
    verifierAddress,
    baseReward,
    maxCompletions,
    expiresAt
  );

  const receipt = await tx.wait();
  console.log("Task created:", receipt);
}
```

## Submitting Proofs

### Generate EIP-712 Signature

```javascript
async function submitLearningProof(taskId, proofData) {
  const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proofData));
  const nonce = await learningProof.getNonce(learner.address);
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  const domain = {
    name: "LearnChain",
    version: "1",
    chainId: await provider.getNetwork().then(n => n.chainId),
    verifyingContract: LEARNING_PROOF_ADDRESS
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

  const value = {
    taskId,
    learner: learner.address,
    proofHash,
    nonce,
    deadline
  };

  const signature = await learner.signTypedData(domain, types, value);

  const tx = await learningProof.submitProof(taskId, proofHash, signature);
  await tx.wait();
}
```

## Claiming Rewards

```javascript
async function claimRewards() {
  const pending = await rewardManager.getPendingRewards(learner.address);
  console.log("Pending rewards:", ethers.formatEther(pending));

  const tx = await rewardManager.claimRewards();
  await tx.wait();
  console.log("Rewards claimed!");
}
```

## React Integration

### Custom Hook for Tasks

```javascript
import { useContract, useContractRead } from 'wagmi';

export function useTasks() {
  const { data: totalTasks } = useContractRead({
    address: TASK_MANAGER_ADDRESS,
    abi: TaskManagerABI,
    functionName: 'getTotalTasks'
  });

  const { data: tasks } = useContractRead({
    address: TASK_MANAGER_ADDRESS,
    abi: TaskManagerABI,
    functionName: 'getTask',
    args: [0] // task ID
  });

  return { totalTasks, tasks };
}
```

### Component Example

```jsx
import { useAccount } from 'wagmi';
import { useTasks } from './hooks/useTasks';

export function TaskList() {
  const { address } = useAccount();
  const { tasks, totalTasks } = useTasks();

  return (
    <div>
      <h2>Total Tasks: {totalTasks?.toString()}</h2>
      {/* Render tasks */}
    </div>
  );
}
```

## TheGraph Integration

### Subgraph Queries

```graphql
query GetLearnerStats($learner: Bytes!) {
  learner(id: $learner) {
    id
    completedTasks
    credentialsEarned
    totalRewards
  }
  
  credentials(where: { learner: $learner }) {
    id
    taskId
    metadataURI
    issuedAt
  }
}
```

### Using with Apollo Client

```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: SUBGRAPH_URL,
  cache: new InMemoryCache()
});

async function fetchLearnerStats(learnerAddress) {
  const { data } = await client.query({
    query: gql`
      query {
        learner(id: "${learnerAddress.toLowerCase()}") {
          completedTasks
          credentialsEarned
        }
      }
    `
  });
  return data;
}
```

## IPFS Integration

### Upload Task Metadata

```javascript
import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001' });

async function uploadTaskMetadata(taskData) {
  const metadata = JSON.stringify({
    title: taskData.title,
    description: taskData.description,
    requirements: taskData.requirements,
    resources: taskData.resources
  });

  const result = await ipfs.add(metadata);
  return `ipfs://${result.path}`;
}
```

### Fetch Metadata

```javascript
async function fetchTaskMetadata(uri) {
  const cid = uri.replace('ipfs://', '');
  const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
  return await response.json();
}
```

## Event Listening

### Listen for Task Creation

```javascript
taskManager.on("TaskCreated", (taskId, creator, difficulty, baseReward) => {
  console.log("New task created:", {
    taskId: taskId.toString(),
    creator,
    difficulty,
    baseReward: ethers.formatEther(baseReward)
  });
});
```

### Listen for Proof Verification

```javascript
learningProof.on("ProofVerified", (taskId, learner, verifier, timestamp) => {
  console.log("Proof verified:", {
    taskId: taskId.toString(),
    learner,
    verifier
  });
});
```

## Mobile Integration

### React Native Example

```javascript
import WalletConnectProvider from "@walletconnect/react-native-dapp";

function App() {
  return (
    <WalletConnectProvider>
      <LearnChainApp />
    </WalletConnectProvider>
  );
}
```

## Testing Integration

### Local Development

```javascript
import { ethers } from 'hardhat';

describe("Integration Test", function() {
  it("Should complete full workflow", async function() {
    // Deploy contracts
    // Create task
    // Submit proof
    // Verify proof
    // Claim rewards
  });
});
```

## Error Handling

```javascript
async function safeExecute(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error("Insufficient gas");
    } else if (error.message.includes('revert')) {
      console.error("Transaction reverted:", error.reason);
    }
    throw error;
  }
}
```

## Best Practices

1. Always validate contract addresses
2. Handle transaction failures gracefully
3. Show transaction progress to users
4. Cache data when possible
5. Use event subscriptions for real-time updates
6. Implement retry logic for failed transactions
7. Show gas estimates before transactions

