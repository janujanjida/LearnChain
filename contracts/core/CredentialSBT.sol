// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../interfaces/ICredentialSBT.sol";

/**
 * @title CredentialSBT
 * @notice Soul-Bound Token implementation for learning credentials
 * @dev Based on ERC-4973 standard - non-transferable tokens
 */
contract CredentialSBT is ICredentialSBT, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string public name;
    string public symbol;
    string private _baseTokenURI;

    uint256 private _tokenIdCounter;
    mapping(uint256 => Credential) private _credentials;
    mapping(address => uint256[]) private _learnerCredentials;
    mapping(uint256 => mapping(address => bool)) private _taskCredentialMinted;

    /**
     * @dev Constructor initializes the SBT collection
     * @param tokenName Name of the SBT collection
     * @param tokenSymbol Symbol of the SBT collection
     * @param baseTokenURI Base URI for token metadata
     */
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        string memory baseTokenURI
    ) {
        name = tokenName;
        symbol = tokenSymbol;
        _baseTokenURI = baseTokenURI;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @inheritdoc ICredentialSBT
     */
    function mintCredential(
        address learner,
        uint256 taskId,
        string memory metadataURI
    ) external override onlyRole(MINTER_ROLE) nonReentrant returns (uint256 tokenId) {
        require(learner != address(0), "Invalid learner address");
        require(!_taskCredentialMinted[taskId][learner], "Credential already minted for this task");

        tokenId = _tokenIdCounter++;

        _credentials[tokenId] = Credential({
            tokenId: tokenId,
            taskId: taskId,
            learner: learner,
            metadataURI: metadataURI,
            issuedAt: block.timestamp,
            issuer: msg.sender,
            revoked: false
        });

        _learnerCredentials[learner].push(tokenId);
        _taskCredentialMinted[taskId][learner] = true;

        emit CredentialMinted(tokenId, learner, taskId, metadataURI);

        return tokenId;
    }

    /**
     * @inheritdoc ICredentialSBT
     */
    function revokeCredential(
        uint256 tokenId,
        string memory reason
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        Credential storage credential = _credentials[tokenId];
        require(credential.issuedAt > 0, "Credential does not exist");
        require(!credential.revoked, "Credential already revoked");

        credential.revoked = true;

        emit CredentialRevoked(tokenId, credential.learner, reason);
    }

    /**
     * @inheritdoc ICredentialSBT
     */
    function getCredential(
        uint256 tokenId
    ) external view override returns (Credential memory) {
        require(_credentials[tokenId].issuedAt > 0, "Credential does not exist");
        return _credentials[tokenId];
    }

    /**
     * @inheritdoc ICredentialSBT
     */
    function getCredentialsByLearner(
        address learner
    ) external view override returns (uint256[] memory) {
        return _learnerCredentials[learner];
    }

    /**
     * @inheritdoc ICredentialSBT
     */
    function isValidCredential(uint256 tokenId) external view override returns (bool) {
        Credential memory credential = _credentials[tokenId];
        return credential.issuedAt > 0 && !credential.revoked;
    }

    /**
     * @inheritdoc ICredentialSBT
     */
    function tokenURI(uint256 tokenId) external view override returns (string memory) {
        require(_credentials[tokenId].issuedAt > 0, "Credential does not exist");

        Credential memory credential = _credentials[tokenId];

        if (bytes(credential.metadataURI).length > 0) {
            return credential.metadataURI;
        }

        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }

    /**
     * @dev Returns the total number of credentials minted
     * @return Total credential count
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Checks if a credential has been minted for a task by a learner
     * @param taskId The ID of the task
     * @param learner The address of the learner
     * @return True if credential exists
     */
    function hasCredential(uint256 taskId, address learner) external view returns (bool) {
        return _taskCredentialMinted[taskId][learner];
    }

    /**
     * @dev Updates the base token URI
     * @param baseTokenURI New base URI
     */
    function setBaseTokenURI(string memory baseTokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseTokenURI;
    }

    /**
     * @dev Grants minter role to an address
     * @param account The address to grant the role
     */
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }

    /**
     * @dev Override to prevent token transfers (Soul-Bound)
     */
    function safeTransferFrom(address, address, uint256) external pure {
        revert("Soul-Bound: Transfer not allowed");
    }

    /**
     * @dev Override to prevent token transfers (Soul-Bound)
     */
    function transferFrom(address, address, uint256) external pure {
        revert("Soul-Bound: Transfer not allowed");
    }
}

