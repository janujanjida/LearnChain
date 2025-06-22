# Frequently Asked Questions

## General Questions

### What is LearnChain?
LearnChain is a decentralized learning certification system built on blockchain technology. It allows learners to earn verifiable, non-transferable credentials (Soul-Bound Tokens) for completing educational tasks.

### How does it work?
1. Educational institutions create learning tasks
2. Learners complete tasks and submit proofs
3. Authorized verifiers approve completions
4. Learners receive credentials and rewards

### What blockchain networks are supported?
Currently supporting:
- Ethereum (Mainnet and Sepolia testnet)
- Polygon
- Arbitrum

### What are Soul-Bound Tokens (SBTs)?
SBTs are non-transferable NFTs that represent achievements or credentials. They cannot be sold or transferred, making them ideal for educational credentials.

## For Learners

### How do I start learning?
1. Connect your wallet
2. Browse available tasks
3. Select a task and complete requirements
4. Submit your proof of completion
5. Receive your credential after verification

### What rewards can I earn?
- LEARN tokens (ERC20)
- Soul-Bound Token credentials
- NFT badges (coming soon)

### How do I claim my rewards?
Use the `claimRewards()` function or through the web interface to claim accumulated rewards.

### Can I transfer my credentials?
No, credentials are Soul-Bound Tokens and cannot be transferred. They are permanently linked to your wallet address.

### What happens if I lose access to my wallet?
Unfortunately, since credentials are non-transferable, you cannot recover them if you lose wallet access. Always backup your private keys securely.

## For Institutions

### How do I register as an institution?
1. Call `registerInstitution()` with your details
2. Wait for admin verification
3. Once verified, you can create tasks

### How do I create tasks?
Use the `createTask()` function with:
- Metadata URI (IPFS/Arweave)
- Difficulty level
- Reward amount
- Maximum completions
- Expiration date

### Can I revoke credentials?
Yes, admins can revoke credentials if fraud is detected using the `revokeCredential()` function.

### How much does it cost to create tasks?
Only gas fees for transactions. No platform fees currently.

## Technical Questions

### What wallet do I need?
Any Ethereum-compatible wallet:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Hardware wallets (Ledger, Trezor)

### What are gas fees?
Gas fees are transaction costs paid to blockchain validators. Costs vary by network congestion.

### How is proof verified?
Proofs use EIP-712 signatures for cryptographic verification, ensuring authenticity without revealing learning data.

### Is my data stored on-chain?
Only proof hashes and essential metadata are on-chain. Full learning content is stored off-chain (IPFS/Arweave).

### Can contracts be upgraded?
Current contracts are non-upgradeable for security. New versions would require migration.

## Rewards & Tokens

### What is LEARN token?
LEARN is the native ERC20 utility token used for rewarding learners.

### Where can I trade LEARN tokens?
Token trading information will be announced after mainnet launch.

### How are rewards calculated?
Rewards = Base Amount × Difficulty Multiplier

Default multipliers:
- Beginner: 0.5x
- Intermediate: 1.0x
- Advanced: 1.5x
- Expert: 2.5x

### When can I claim rewards?
Anytime after rewards are distributed. No time limit.

## Security

### Are smart contracts audited?
Security audits are planned before mainnet deployment.

### How do I report a bug?
Email: security@learnchain.io
Do not publicly disclose security issues.

### What if a contract is compromised?
Emergency pause mechanism allows admins to halt operations if needed.

## Troubleshooting

### Transaction failed
Common causes:
- Insufficient gas
- Deadline expired
- Already completed task
- Missing permissions

### Credential not appearing
Wait for transaction confirmation. Check block explorer with transaction hash.

### Cannot connect wallet
- Ensure wallet is unlocked
- Check you're on correct network
- Try different browser/wallet

### High gas fees
- Use L2 solutions (Polygon, Arbitrum)
- Wait for lower network congestion
- Batch multiple operations

## Future Features

### What's coming next?
- Mobile app
- Multiple language support
- Cross-chain credentials
- AI-powered assessment
- DAO governance

### Can I contribute?
Yes! See CONTRIBUTING.md for guidelines.

### How can I get support?
- Discord: [Join our server]
- Email: support@learnchain.io
- Documentation: docs.learnchain.io
- GitHub Issues: Report bugs

## Legal

### Terms of Service
See Terms of Service document.

### Privacy Policy
No personal data is stored on-chain. See Privacy Policy for details.

### License
MIT License - see LICENSE file.

