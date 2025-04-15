# Deployment Guide

## Prerequisites

- Node.js >= 18.x
- Network RPC endpoint
- Deployer wallet with sufficient funds
- API keys for contract verification

## Environment Setup

Create `.env` file:

```bash
# Private Keys (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
ARBISCAN_API_KEY=your_arbiscan_key

# Contract Addresses (after deployment)
LEARN_TOKEN_ADDRESS=
TASK_MANAGER_ADDRESS=
LEARNING_PROOF_ADDRESS=
CREDENTIAL_SBT_ADDRESS=
REWARD_MANAGER_ADDRESS=
INSTITUTION_REGISTRY_ADDRESS=
```

## Testnet Deployment

### 1. Sepolia Testnet

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts
npx hardhat run scripts/verify.js --network sepolia
```

### 2. Test Deployment

```bash
# Create test task
node scripts/create-task.js

# Register test institution
node scripts/register-institution.js "Test University" "ipfs://..."

# Query tasks
node scripts/query-tasks.js
```

## Mainnet Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Gas optimization verified
- [ ] Multisig wallet prepared
- [ ] Deployment plan reviewed
- [ ] Emergency procedures documented

### Deployment Steps

1. **Deploy Contracts**

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

2. **Verify Contracts**

```bash
npx hardhat run scripts/verify.js --network mainnet
```

3. **Setup Roles**

```bash
npx hardhat run scripts/setup-roles.js --network mainnet
```

4. **Transfer Ownership**

Transfer admin roles to multisig wallet.

5. **Fund RewardManager**

Transfer LEARN tokens to RewardManager for rewards.

### Post-Deployment

1. **Verify on Etherscan**
   - Check contract code verification
   - Verify all contract links
   - Test read/write functions

2. **Monitor Contracts**
   - Setup event monitoring
   - Configure alerts
   - Track gas usage

3. **Update Frontend**
   - Update contract addresses
   - Deploy frontend
   - Test all interactions

## Multi-Chain Deployment

### Polygon

```bash
npx hardhat run scripts/deploy.js --network polygon
npx hardhat run scripts/verify.js --network polygon
```

### Arbitrum

```bash
npx hardhat run scripts/deploy.js --network arbitrum
npx hardhat run scripts/verify.js --network arbitrum
```

## Gas Estimation

Typical gas costs (approximate):

| Contract | Deployment Gas | USD (50 gwei) |
|----------|---------------|---------------|
| LearnToken | 1,500,000 | $150 |
| TaskManager | 2,000,000 | $200 |
| LearningProof | 1,800,000 | $180 |
| CredentialSBT | 2,200,000 | $220 |
| RewardManager | 2,000,000 | $200 |
| InstitutionRegistry | 1,500,000 | $150 |
| **Total** | **~11,000,000** | **~$1,100** |

## Upgrade Strategy

Current contracts are non-upgradeable. For upgrades:

1. Deploy new versions
2. Migrate data if necessary
3. Update frontend references
4. Maintain old contracts for historical data

## Backup and Recovery

### Contract State Backup

```bash
# Backup contract state
node scripts/backup-state.js

# Export events
node scripts/export-events.js
```

### Recovery Procedures

1. Pause contracts if emergency
2. Assess situation
3. Deploy fixed version
4. Migrate critical data
5. Resume operations

## Monitoring

### Key Metrics

- Transaction success rate
- Gas usage trends
- Active users
- Tasks created/completed
- Rewards distributed
- Credentials minted

### Alerting

Setup alerts for:
- Failed transactions
- High gas usage
- Unusual activity patterns
- Role changes
- Large token transfers

## Security Considerations

### Access Control

- Use multisig for admin operations
- Implement timelock for critical changes
- Regular access audits
- Principle of least privilege

### Emergency Procedures

1. **Pause Mechanism**
   ```bash
   # Pause contract
   npx hardhat run scripts/pause.js --network mainnet
   ```

2. **Emergency Contacts**
   - Security team: security@learnchain.io
   - On-call engineer: +1-XXX-XXX-XXXX

3. **Response Plan**
   - Assess severity
   - Pause if necessary
   - Communicate with users
   - Implement fix
   - Resume operations

## Rollback Procedures

If deployment fails:

1. Document the issue
2. Roll back frontend to previous version
3. Analyze logs
4. Fix issues
5. Test thoroughly
6. Retry deployment

## Maintenance

### Regular Tasks

- Monitor contract health
- Review event logs
- Update documentation
- Check for upgrades to dependencies
- Review access permissions

### Quarterly Tasks

- Security review
- Gas optimization check
- Performance analysis
- User feedback review
- Feature planning

## Cost Management

### Optimization Tips

- Use L2 solutions (Polygon, Arbitrum)
- Batch operations when possible
- Optimize contract code
- Use efficient data structures

### Budget Planning

- Deployment costs
- Verification costs
- Ongoing gas costs
- Maintenance costs
- Security audit costs

## Documentation

After deployment, update:

- [ ] Contract addresses in documentation
- [ ] Frontend configuration
- [ ] API documentation
- [ ] User guides
- [ ] Developer documentation

## Support

For deployment assistance:
- Email: devops@learnchain.io
- Discord: [Development Channel]
- Documentation: docs.learnchain.io

