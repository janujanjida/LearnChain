// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICredentialSBT
 * @notice Interface for Soul-Bound Token learning credentials
 * @dev Based on ERC-4973 standard - non-transferable tokens
 */
interface ICredentialSBT {
    /**
     * @dev Credential metadata structure
     */
    struct Credential {
        uint256 tokenId;
        uint256 taskId;
        address learner;
        string metadataURI;
        uint256 issuedAt;
        address issuer;
        bool revoked;
    }

    /**
     * @dev Emitted when a credential is minted
     */
    event CredentialMinted(
        uint256 indexed tokenId,
        address indexed learner,
        uint256 indexed taskId,
        string metadataURI
    );

    /**
     * @dev Emitted when a credential is revoked
     */
    event CredentialRevoked(
        uint256 indexed tokenId,
        address indexed learner,
        string reason
    );

    /**
     * @dev Mints a new learning credential
     * @param learner The address receiving the credential
     * @param taskId The ID of the completed task
     * @param metadataURI URI containing credential metadata
     * @return tokenId The ID of the minted credential
     */
    function mintCredential(
        address learner,
        uint256 taskId,
        string memory metadataURI
    ) external returns (uint256 tokenId);

    /**
     * @dev Revokes a credential
     * @param tokenId The ID of the credential to revoke
     * @param reason Reason for revocation
     */
    function revokeCredential(uint256 tokenId, string memory reason) external;

    /**
     * @dev Retrieves credential details
     * @param tokenId The ID of the credential
     * @return Credential structure containing all credential details
     */
    function getCredential(uint256 tokenId) external view returns (Credential memory);

    /**
     * @dev Returns all credentials owned by an address
     * @param learner The address of the learner
     * @return Array of token IDs
     */
    function getCredentialsByLearner(address learner) external view returns (uint256[] memory);

    /**
     * @dev Checks if a credential exists and is valid
     * @param tokenId The ID of the credential
     * @return True if the credential exists and is not revoked
     */
    function isValidCredential(uint256 tokenId) external view returns (bool);

    /**
     * @dev Returns the token URI for metadata
     * @param tokenId The ID of the credential
     * @return The metadata URI
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

