// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILearningProof
 * @notice Interface for verifying learning achievements
 * @dev Implements proof submission and verification with EIP-712 signatures
 */
interface ILearningProof {
    /**
     * @dev Proof structure containing learning achievement data
     */
    struct Proof {
        uint256 taskId;
        address learner;
        bytes32 proofHash;
        uint256 submittedAt;
        bool verified;
        address verifiedBy;
        uint256 verifiedAt;
    }

    /**
     * @dev Emitted when a proof is submitted
     */
    event ProofSubmitted(
        uint256 indexed taskId,
        address indexed learner,
        bytes32 proofHash,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a proof is verified
     */
    event ProofVerified(
        uint256 indexed taskId,
        address indexed learner,
        address indexed verifier,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a proof is rejected
     */
    event ProofRejected(
        uint256 indexed taskId,
        address indexed learner,
        address indexed verifier,
        string reason
    );

    /**
     * @dev Submits a learning proof for verification
     * @param taskId The ID of the completed task
     * @param proofHash Hash of the proof data
     * @param signature EIP-712 signature for verification
     */
    function submitProof(
        uint256 taskId,
        bytes32 proofHash,
        bytes memory signature
    ) external;

    /**
     * @dev Verifies a submitted proof
     * @param taskId The ID of the task
     * @param learner The address of the learner
     * @param approved Whether the proof is approved
     * @param reason Reason for rejection (if applicable)
     */
    function verifyProof(
        uint256 taskId,
        address learner,
        bool approved,
        string memory reason
    ) external;

    /**
     * @dev Retrieves proof details
     * @param taskId The ID of the task
     * @param learner The address of the learner
     * @return Proof structure containing all proof details
     */
    function getProof(uint256 taskId, address learner) external view returns (Proof memory);

    /**
     * @dev Checks if a proof has been verified
     * @param taskId The ID of the task
     * @param learner The address of the learner
     * @return True if the proof has been verified
     */
    function isProofVerified(uint256 taskId, address learner) external view returns (bool);

    /**
     * @dev Returns the domain separator for EIP-712
     * @return The domain separator hash
     */
    function getDomainSeparator() external view returns (bytes32);
}

