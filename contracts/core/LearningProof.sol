// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "../interfaces/ILearningProof.sol";
import "../interfaces/ITaskManager.sol";
import "../libraries/SignatureVerifier.sol";

/**
 * @title LearningProof
 * @notice Handles learning proof submission and verification
 * @dev Implements EIP-712 signature verification for learning achievements
 */
contract LearningProof is ILearningProof, AccessControl, ReentrancyGuard, EIP712 {
    using SignatureVerifier for bytes32;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    ITaskManager public taskManager;

    mapping(uint256 => mapping(address => Proof)) private _proofs;
    mapping(address => uint256) private _nonces;

    /**
     * @dev Constructor initializes EIP-712 domain
     * @param taskManagerAddress Address of the TaskManager contract
     */
    constructor(
        address taskManagerAddress
    ) EIP712("LearnChain", "1") {
        require(taskManagerAddress != address(0), "Invalid TaskManager address");

        taskManager = ITaskManager(taskManagerAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @inheritdoc ILearningProof
     */
    function submitProof(
        uint256 taskId,
        bytes32 proofHash,
        bytes memory signature
    ) external override nonReentrant {
        ITaskManager.Task memory task = taskManager.getTask(taskId);
        require(task.status == ITaskManager.TaskStatus.ACTIVE, "Task not active");
        require(block.timestamp <= task.expiresAt, "Task expired");
        require(!taskManager.hasCompleted(taskId, msg.sender), "Task already completed");
        require(_proofs[taskId][msg.sender].submittedAt == 0, "Proof already submitted");

        uint256 nonce = _nonces[msg.sender]++;
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 domainSeparator = _domainSeparatorV4();

        address signer = SignatureVerifier.verifyProofSignature(
            taskId,
            msg.sender,
            proofHash,
            nonce,
            deadline,
            signature,
            domainSeparator
        );

        require(signer == msg.sender, "Invalid signature");

        _proofs[taskId][msg.sender] = Proof({
            taskId: taskId,
            learner: msg.sender,
            proofHash: proofHash,
            submittedAt: block.timestamp,
            verified: false,
            verifiedBy: address(0),
            verifiedAt: 0
        });

        emit ProofSubmitted(taskId, msg.sender, proofHash, block.timestamp);
    }

    /**
     * @inheritdoc ILearningProof
     */
    function verifyProof(
        uint256 taskId,
        address learner,
        bool approved,
        string memory reason
    ) external override onlyRole(VERIFIER_ROLE) nonReentrant {
        Proof storage proof = _proofs[taskId][learner];
        require(proof.submittedAt > 0, "Proof not submitted");
        require(!proof.verified, "Proof already verified");

        ITaskManager.Task memory task = taskManager.getTask(taskId);
        require(
            task.verifierAddress == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized verifier"
        );

        if (approved) {
            proof.verified = true;
            proof.verifiedBy = msg.sender;
            proof.verifiedAt = block.timestamp;

            emit ProofVerified(taskId, learner, msg.sender, block.timestamp);
        } else {
            delete _proofs[taskId][learner];
            emit ProofRejected(taskId, learner, msg.sender, reason);
        }
    }

    /**
     * @inheritdoc ILearningProof
     */
    function getProof(
        uint256 taskId,
        address learner
    ) external view override returns (Proof memory) {
        return _proofs[taskId][learner];
    }

    /**
     * @inheritdoc ILearningProof
     */
    function isProofVerified(
        uint256 taskId,
        address learner
    ) external view override returns (bool) {
        return _proofs[taskId][learner].verified;
    }

    /**
     * @inheritdoc ILearningProof
     */
    function getDomainSeparator() external view override returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @dev Returns the current nonce for an address
     * @param account The address to query
     * @return The current nonce
     */
    function getNonce(address account) external view returns (uint256) {
        return _nonces[account];
    }

    /**
     * @dev Updates the TaskManager address
     * @param newTaskManager The new TaskManager address
     */
    function setTaskManager(address newTaskManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTaskManager != address(0), "Invalid address");
        taskManager = ITaskManager(newTaskManager);
    }

    /**
     * @dev Grants verifier role to an address
     * @param account The address to grant the role
     */
    function grantVerifierRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, account);
    }
}

