# Troubleshooting Guide

## Common Issues

### Installation Issues

#### npm install fails
**Problem**: Dependencies installation fails

**Solutions**:
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json
- Use specific Node.js version: `nvm use 18`
- Try with yarn: `yarn install`

#### Hardhat compilation errors
**Problem**: Contracts fail to compile

**Solutions**:
- Clear cache: `npx hardhat clean`
- Check Solidity version compatibility
- Verify OpenZeppelin version matches
- Update dependencies: `npm update`

### Deployment Issues

#### Insufficient funds
**Problem**: "insufficient funds for gas"

**Solutions**:
- Check wallet balance
- Get testnet ETH from faucets
- Reduce gas limit
- Use different network with lower fees

#### Transaction timeout
**Problem**: Transaction pending too long

**Solutions**:
- Increase gas price
- Check network congestion
- Wait and retry
- Use different RPC endpoint

#### Contract verification fails
**Problem**: Etherscan verification unsuccessful

**Solutions**:
- Verify constructor arguments match
- Check compiler settings
- Wait a few minutes after deployment
- Use exact Solidity version

### Testing Issues

#### Tests timeout
**Problem**: Tests fail with timeout error

**Solutions**:
- Increase mocha timeout in hardhat.config.js
- Check for infinite loops
- Reduce test complexity
- Run tests individually

#### Test failures
**Problem**: Specific tests fail

**Solutions**:
- Check block timestamp dependencies
- Reset local node state
- Verify test setup/teardown
- Check assertion expectations

### Runtime Issues

#### Invalid signature
**Problem**: EIP-712 signature verification fails

**Solutions**:
- Verify domain separator
- Check typed data structure
- Confirm signer address
- Validate deadline hasn't expired

#### Access denied
**Problem**: "Unauthorized" or access control errors

**Solutions**:
- Verify correct role granted
- Check caller address
- Confirm role bytes32 hash
- Review access control logs

#### Task expired
**Problem**: Cannot complete expired task

**Solutions**:
- Check task expiration timestamp
- Create new task with later expiration
- Contact task creator for extension

### Smart Contract Issues

#### Proof already submitted
**Problem**: Cannot resubmit proof

**Solutions**:
- Each learner can only submit once per task
- Use different wallet address
- Wait for verification of current proof

#### Reward already distributed
**Problem**: Cannot claim reward again

**Solutions**:
- Check reward history
- Verify claim wasn't already processed
- Check pending rewards balance

#### Transfer not allowed
**Problem**: Cannot transfer SBT credential

**Solutions**:
- SBTs are non-transferable by design
- This is intentional security feature
- Credentials are soul-bound to wallet

### Network Issues

#### Cannot connect to network
**Problem**: RPC connection failures

**Solutions**:
- Check network configuration
- Verify RPC URL is correct
- Try alternative RPC provider
- Check firewall settings

#### Wrong network
**Problem**: Wallet on different chain

**Solutions**:
- Switch network in wallet
- Verify chainId in configuration
- Check network parameter in scripts

### Wallet Issues

#### Wallet not detected
**Problem**: Cannot connect wallet

**Solutions**:
- Install wallet extension
- Unlock wallet
- Refresh page
- Try different browser

#### Signature rejected
**Problem**: User rejected signature

**Solutions**:
- User must approve signature
- Check message content
- Verify requesting domain
- Review transaction details

## Error Messages

### "Task not found"
- Task ID doesn't exist
- Check task ID is correct
- Verify on correct network

### "Task not active"
- Task is paused or cancelled
- Check task status
- Contact task creator

### "Max completions reached"
- Task completion limit hit
- Find similar alternative task
- Wait for new tasks

### "Proof not verified"
- Proof pending verification
- Wait for verifier approval
- Check proof submission

### "No pending rewards"
- All rewards already claimed
- Complete more tasks
- Check reward history

### "Invalid verifier address"
- Verifier not authorized
- Contact admin for role grant
- Verify verifier registration

## Performance Issues

### High gas costs
**Solutions**:
- Use L2 networks (Polygon, Arbitrum)
- Batch transactions
- Wait for lower network congestion
- Optimize contract calls

### Slow transaction confirmation
**Solutions**:
- Increase gas price
- Use faster RPC endpoint
- Check network status
- Consider L2 solutions

## Getting Help

### Debug Steps
1. Check error message details
2. Review transaction on block explorer
3. Verify configuration settings
4. Check network status
5. Review contract events

### Support Resources
- 📖 Documentation: docs.learnchain.io
- 💬 Discord: Community support channel
- 🐛 GitHub Issues: Report bugs
- 📧 Email: support@learnchain.io

### Reporting Bugs
Include:
- Error message
- Steps to reproduce
- Environment details (OS, Node version, etc.)
- Transaction hash if applicable
- Expected vs actual behavior

## Advanced Troubleshooting

### Enable Debug Mode
```javascript
// In hardhat.config.js
networks: {
  hardhat: {
    loggingEnabled: true
  }
}
```

### Check Contract State
```bash
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("TaskManager", "0x...")
> await contract.getTotalTasks()
```

### Monitor Events
```javascript
contract.on("TaskCreated", (taskId, creator, difficulty, baseReward) => {
  console.log("New task:", taskId.toString());
});
```

### Gas Profiling
```bash
REPORT_GAS=true npx hardhat test
```

## Prevention Tips

1. **Test thoroughly** before mainnet deployment
2. **Use testnets** for experimentation
3. **Keep backups** of private keys
4. **Monitor gas prices** before transactions
5. **Verify contracts** after deployment
6. **Check permissions** before operations
7. **Review logs** regularly
8. **Stay updated** on protocol changes

