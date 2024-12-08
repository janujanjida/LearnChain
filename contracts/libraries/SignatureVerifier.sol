// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title SignatureVerifier
 * @notice Library for EIP-712 signature verification
 * @dev Provides utilities for verifying learning proof signatures
 */
library SignatureVerifier {
    using ECDSA for bytes32;

    /**
     * @dev Type hash for learning proof
     */
    bytes32 public constant PROOF_TYPEHASH =
        keccak256(
            "LearningProof(uint256 taskId,address learner,bytes32 proofHash,uint256 nonce,uint256 deadline)"
        );

    /**
     * @dev Verifies a learning proof signature
     * @param taskId The ID of the task
     * @param learner The address of the learner
     * @param proofHash Hash of the proof data
     * @param nonce Unique nonce for replay protection
     * @param deadline Expiration timestamp for the signature
     * @param signature The signature to verify
     * @param domainSeparator The EIP-712 domain separator
     * @return signer The address that signed the message
     */
    function verifyProofSignature(
        uint256 taskId,
        address learner,
        bytes32 proofHash,
        uint256 nonce,
        uint256 deadline,
        bytes memory signature,
        bytes32 domainSeparator
    ) internal pure returns (address signer) {
        require(block.timestamp <= deadline, "Signature expired");

        bytes32 structHash = keccak256(
            abi.encode(PROOF_TYPEHASH, taskId, learner, proofHash, nonce, deadline)
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        signer = digest.recover(signature);
        require(signer != address(0), "Invalid signature");
        require(signer == learner, "Signer mismatch");

        return signer;
    }

    /**
     * @dev Recovers the signer address from a message hash and signature
     * @param messageHash The hash of the message
     * @param signature The signature bytes
     * @return The address that signed the message
     */
    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) internal pure returns (address) {
        return messageHash.recover(signature);
    }

    /**
     * @dev Splits signature into r, s, and v components
     * @param signature The signature to split
     * @return r The r component
     * @return s The s component
     * @return v The v component
     */
    function splitSignature(
        bytes memory signature
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(signature.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        return (r, s, v);
    }
}

