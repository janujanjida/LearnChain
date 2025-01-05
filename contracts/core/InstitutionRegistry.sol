// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IInstitutionRegistry.sol";

/**
 * @title InstitutionRegistry
 * @notice Manages educational institution registration and verification
 * @dev Implements whitelist management and institution authentication
 */
contract InstitutionRegistry is IInstitutionRegistry, AccessControl, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    mapping(address => Institution) private _institutions;
    address[] private _verifiedInstitutions;
    mapping(address => bool) private _isVerifiedInstitution;

    /**
     * @dev Constructor initializes the registry
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function registerInstitution(
        string memory name,
        string memory metadataURI
    ) external override nonReentrant {
        require(bytes(name).length > 0, "Name required");
        require(_institutions[msg.sender].registeredAt == 0, "Already registered");

        _institutions[msg.sender] = Institution({
            institutionAddress: msg.sender,
            name: name,
            metadataURI: metadataURI,
            status: InstitutionStatus.PENDING,
            registeredAt: block.timestamp,
            verifiedAt: 0,
            verifiedBy: address(0),
            tasksCreated: 0,
            credentialsIssued: 0
        });

        emit InstitutionRegistered(msg.sender, name, block.timestamp);
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function verifyInstitution(
        address institutionAddress
    ) external override onlyRole(VERIFIER_ROLE) {
        Institution storage institution = _institutions[institutionAddress];
        require(institution.registeredAt > 0, "Institution not registered");
        require(institution.status == InstitutionStatus.PENDING, "Not pending verification");

        institution.status = InstitutionStatus.VERIFIED;
        institution.verifiedAt = block.timestamp;
        institution.verifiedBy = msg.sender;

        if (!_isVerifiedInstitution[institutionAddress]) {
            _verifiedInstitutions.push(institutionAddress);
            _isVerifiedInstitution[institutionAddress] = true;
        }

        emit InstitutionVerified(institutionAddress, msg.sender, block.timestamp);
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function updateInstitutionStatus(
        address institutionAddress,
        InstitutionStatus status
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        Institution storage institution = _institutions[institutionAddress];
        require(institution.registeredAt > 0, "Institution not registered");

        InstitutionStatus oldStatus = institution.status;
        institution.status = status;

        if (status != InstitutionStatus.VERIFIED && _isVerifiedInstitution[institutionAddress]) {
            _isVerifiedInstitution[institutionAddress] = false;
        } else if (status == InstitutionStatus.VERIFIED && !_isVerifiedInstitution[institutionAddress]) {
            _verifiedInstitutions.push(institutionAddress);
            _isVerifiedInstitution[institutionAddress] = true;
        }

        emit InstitutionStatusChanged(institutionAddress, oldStatus, status);
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function getInstitution(
        address institutionAddress
    ) external view override returns (Institution memory) {
        require(_institutions[institutionAddress].registeredAt > 0, "Institution not registered");
        return _institutions[institutionAddress];
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function isVerified(address institutionAddress) external view override returns (bool) {
        return _institutions[institutionAddress].status == InstitutionStatus.VERIFIED;
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function getVerifiedInstitutions() external view override returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _verifiedInstitutions.length; i++) {
            if (_isVerifiedInstitution[_verifiedInstitutions[i]]) {
                count++;
            }
        }

        address[] memory verified = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < _verifiedInstitutions.length; i++) {
            if (_isVerifiedInstitution[_verifiedInstitutions[i]]) {
                verified[index] = _verifiedInstitutions[i];
                index++;
            }
        }

        return verified;
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function incrementTaskCount(
        address institutionAddress
    ) external override onlyRole(VERIFIER_ROLE) {
        require(_institutions[institutionAddress].registeredAt > 0, "Institution not registered");
        _institutions[institutionAddress].tasksCreated++;
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function incrementCredentialCount(
        address institutionAddress
    ) external override onlyRole(VERIFIER_ROLE) {
        require(_institutions[institutionAddress].registeredAt > 0, "Institution not registered");
        _institutions[institutionAddress].credentialsIssued++;
    }

    /**
     * @dev Updates institution metadata URI
     * @param metadataURI New metadata URI
     */
    function updateMetadataURI(string memory metadataURI) external {
        require(_institutions[msg.sender].registeredAt > 0, "Institution not registered");
        _institutions[msg.sender].metadataURI = metadataURI;
    }

    /**
     * @dev Returns total number of registered institutions
     * @return Total institution count
     */
    function getTotalInstitutions() external view returns (uint256) {
        return _verifiedInstitutions.length;
    }

    /**
     * @dev Grants verifier role to an address
     * @param account The address to grant the role
     */
    function grantVerifierRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, account);
    }
}

