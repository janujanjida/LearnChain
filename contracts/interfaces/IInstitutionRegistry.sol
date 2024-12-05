// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IInstitutionRegistry
 * @notice Interface for managing educational institutions
 * @dev Handles institution registration, verification, and authorization
 */
interface IInstitutionRegistry {
    /**
     * @dev Institution status
     */
    enum InstitutionStatus {
        PENDING,
        VERIFIED,
        SUSPENDED,
        REVOKED
    }

    /**
     * @dev Institution structure
     */
    struct Institution {
        address institutionAddress;
        string name;
        string metadataURI;
        InstitutionStatus status;
        uint256 registeredAt;
        uint256 verifiedAt;
        address verifiedBy;
        uint256 tasksCreated;
        uint256 credentialsIssued;
    }

    /**
     * @dev Emitted when an institution is registered
     */
    event InstitutionRegistered(
        address indexed institutionAddress,
        string name,
        uint256 timestamp
    );

    /**
     * @dev Emitted when an institution is verified
     */
    event InstitutionVerified(
        address indexed institutionAddress,
        address indexed verifier,
        uint256 timestamp
    );

    /**
     * @dev Emitted when an institution status changes
     */
    event InstitutionStatusChanged(
        address indexed institutionAddress,
        InstitutionStatus oldStatus,
        InstitutionStatus newStatus
    );

    /**
     * @dev Registers a new educational institution
     * @param name Name of the institution
     * @param metadataURI URI containing institution details
     */
    function registerInstitution(
        string memory name,
        string memory metadataURI
    ) external;

    /**
     * @dev Verifies an institution (admin only)
     * @param institutionAddress Address of the institution to verify
     */
    function verifyInstitution(address institutionAddress) external;

    /**
     * @dev Updates institution status
     * @param institutionAddress Address of the institution
     * @param status New status
     */
    function updateInstitutionStatus(
        address institutionAddress,
        InstitutionStatus status
    ) external;

    /**
     * @dev Retrieves institution details
     * @param institutionAddress Address of the institution
     * @return Institution structure
     */
    function getInstitution(address institutionAddress) external view returns (Institution memory);

    /**
     * @dev Checks if an institution is verified
     * @param institutionAddress Address of the institution
     * @return True if the institution is verified
     */
    function isVerified(address institutionAddress) external view returns (bool);

    /**
     * @dev Returns all verified institutions
     * @return Array of institution addresses
     */
    function getVerifiedInstitutions() external view returns (address[] memory);

    /**
     * @dev Increments task counter for an institution
     * @param institutionAddress Address of the institution
     */
    function incrementTaskCount(address institutionAddress) external;

    /**
     * @dev Increments credential counter for an institution
     * @param institutionAddress Address of the institution
     */
    function incrementCredentialCount(address institutionAddress) external;
}

