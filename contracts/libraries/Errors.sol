// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Errors
 * @notice Library containing all custom error definitions
 * @dev Provides gas-efficient custom errors for the LearnChain protocol
 */
library Errors {
    // Access Control Errors
    error Unauthorized();
    error InsufficientPermissions();
    error InvalidRole();

    // Task Manager Errors
    error TaskNotFound();
    error TaskNotActive();
    error TaskExpired();
    error TaskAlreadyCompleted();
    error MaxCompletionsReached();
    error InvalidTaskParameters();
    error InvalidMetadataURI();
    error InvalidVerifierAddress();
    error InvalidRewardAmount();

    // Learning Proof Errors
    error ProofNotFound();
    error ProofAlreadySubmitted();
    error ProofAlreadyVerified();
    error InvalidProofHash();
    error InvalidSignature();
    error SignatureExpired();
    error InvalidNonce();

    // Credential SBT Errors
    error CredentialNotFound();
    error CredentialAlreadyExists();
    error CredentialRevoked();
    error TransferNotAllowed();
    error InvalidTokenId();

    // Reward Manager Errors
    error RewardAlreadyDistributed();
    error NoRewardsPending();
    error InsufficientRewardBalance();
    error RewardsDisabled();
    error InvalidMultiplier();

    // Institution Registry Errors
    error InstitutionNotFound();
    error InstitutionAlreadyRegistered();
    error InstitutionNotVerified();
    error InvalidInstitutionStatus();
    error InvalidInstitutionName();

    // General Errors
    error ZeroAddress();
    error InvalidAmount();
    error InvalidTimestamp();
    error ArrayLengthMismatch();
    error OperationFailed();
}

