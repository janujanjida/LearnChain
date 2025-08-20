# Quick Start Guide

## 5-Minute Setup

### 1. Clone and Install

```bash
git clone https://github.com/janujanjida/LearnChain.git
cd LearnChain
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

### 5. Deploy to Testnet

```bash
npm run deploy:sepolia
```

## Creating Your First Task

```javascript
const task = await taskManager.createTask(
  "ipfs://your-metadata-uri",
  0, // TOKEN reward
  1, // INTERMEDIATE difficulty
  verifierAddress,
  ethers.parseEther("100"), // 100 LEARN tokens
  100, // max 100 completions
  Math.floor(Date.now() / 1000) + 30*24*60*60 // expires in 30 days
);
```

## Submitting a Proof

```javascript
// Generate proof
const proofHash = ethers.keccak256(ethers.toUtf8Bytes("your-proof-data"));

// Sign with EIP-712
const signature = await learner.signTypedData(domain, types, value);

// Submit
await learningProof.submitProof(taskId, proofHash, signature);
```

## Claiming Rewards

```javascript
// Check pending rewards
const pending = await rewardManager.getPendingRewards(learnerAddress);

// Claim
await rewardManager.claimRewards();
```

## Next Steps

- Read full [Documentation](./API.md)
- Check [Examples](../examples/)
- Join [Community](https://discord.gg/learnchain)
- Review [Security](./SECURITY.md) best practices

## Common Issues

**Transaction failed**: Check gas limits and network status

**Signature invalid**: Verify domain separator and typed data structure

**Access denied**: Ensure proper roles are granted

## Support

Need help? 
- 📖 [Full Documentation](./API.md)
- 💬 [Discord Community](https://discord.gg/learnchain)
- 🐛 [Report Issues](https://github.com/janujanjida/LearnChain/issues)

