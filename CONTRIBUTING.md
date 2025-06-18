# Contributing to LearnChain

Thank you for your interest in contributing to LearnChain! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Enhancements

1. Check if the enhancement has been suggested
2. Create an issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions considered
   - Impact on existing functionality

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Run tests and linting
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js >= 18.x (we recommend 18.17.0)
- npm >= 9.x or yarn >= 1.22.x
- Git >= 2.x
- A code editor (VS Code recommended)

### Installation

```bash
git clone https://github.com/janujanjida/LearnChain.git
cd LearnChain
npm install
```

### Running Tests

```bash
npm test
```

### Code Coverage

```bash
npm run coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Coding Standards

### Solidity

- Follow Solidity style guide
- Use OpenZeppelin contracts when possible
- Add NatSpec comments for all public functions
- Include security considerations

Example:
```solidity
/**
 * @notice Creates a new learning task
 * @dev Requires TASK_CREATOR_ROLE
 * @param metadataURI IPFS URI containing task details
 * @return taskId Unique identifier for the created task
 */
function createTask(string memory metadataURI) external returns (uint256 taskId) {
    // Implementation
}
```

### JavaScript

- Use ES6+ features
- Follow Airbnb style guide
- Add JSDoc comments for functions
- Use meaningful variable names

### Testing

- Write tests for all new features
- Maintain >90% code coverage
- Include edge cases
- Test both happy and error paths

Example:
```javascript
describe("TaskManager", function () {
  it("Should create a task with valid parameters", async function () {
    // Test implementation
  });

  it("Should fail when creating task without required role", async function () {
    // Test implementation
  });
});
```

## Commit Messages

Follow conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions or changes
- `refactor:` Code refactoring
- `style:` Formatting changes
- `chore:` Maintenance tasks
- `ci:` CI/CD changes

Examples:
```
feat: add reward multiplier configuration
fix: prevent duplicate credential minting
docs: update API documentation
test: add TaskManager edge case tests
```

## Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Email security@learnchain.io with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

- Never commit private keys or secrets
- Use environment variables for sensitive data
- Follow smart contract security best practices
- Run security analysis tools

## Documentation

### Code Documentation

- Add inline comments for complex logic
- Write clear function documentation
- Update README when adding features
- Create examples for new functionality

### API Documentation

- Document all public contract functions
- Include parameter descriptions
- Add usage examples
- Note any prerequisites or limitations

## Review Process

### For Maintainers

1. Check CI/CD passes
2. Review code quality
3. Test functionality locally
4. Check documentation updates
5. Verify security implications
6. Request changes if needed
7. Approve and merge

### For Contributors

- Be responsive to feedback
- Make requested changes promptly
- Keep PRs focused and small
- Update based on review comments

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to testnet
5. Verify functionality
6. Deploy to mainnet
7. Publish release notes

## Community

### Getting Help

- Discord: [Join our server]
- Twitter: [@LearnChain]
- Email: support@learnchain.io

### Discussions

Use GitHub Discussions for:
- Questions
- Feature ideas
- General discussions
- Show and tell

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website
- Annual reports

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Development Best Practices](https://consensys.github.io/smart-contract-best-practices/)

## Questions?

Feel free to reach out if you have any questions. We're here to help!

Thank you for contributing to LearnChain! 🎓

