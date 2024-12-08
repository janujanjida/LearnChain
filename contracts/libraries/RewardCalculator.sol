// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ITaskManager.sol";

/**
 * @title RewardCalculator
 * @notice Library for calculating rewards based on task difficulty
 * @dev Provides utility functions for reward computation
 */
library RewardCalculator {
    /**
     * @dev Basis points constant (100% = 10000)
     */
    uint256 public constant BASIS_POINTS = 10000;

    /**
     * @dev Default multipliers in basis points
     */
    uint256 public constant DEFAULT_BEGINNER_MULTIPLIER = 5000; // 0.5x
    uint256 public constant DEFAULT_INTERMEDIATE_MULTIPLIER = 10000; // 1.0x
    uint256 public constant DEFAULT_ADVANCED_MULTIPLIER = 15000; // 1.5x
    uint256 public constant DEFAULT_EXPERT_MULTIPLIER = 25000; // 2.5x

    /**
     * @dev Calculates reward amount based on base amount and difficulty
     * @param baseAmount The base reward amount
     * @param difficulty The difficulty level
     * @param multipliers Array of multipliers [beginner, intermediate, advanced, expert]
     * @return The calculated reward amount
     */
    function calculateReward(
        uint256 baseAmount,
        ITaskManager.Difficulty difficulty,
        uint256[4] memory multipliers
    ) internal pure returns (uint256) {
        require(baseAmount > 0, "Base amount must be positive");

        uint256 multiplier;

        if (difficulty == ITaskManager.Difficulty.BEGINNER) {
            multiplier = multipliers[0];
        } else if (difficulty == ITaskManager.Difficulty.INTERMEDIATE) {
            multiplier = multipliers[1];
        } else if (difficulty == ITaskManager.Difficulty.ADVANCED) {
            multiplier = multipliers[2];
        } else if (difficulty == ITaskManager.Difficulty.EXPERT) {
            multiplier = multipliers[3];
        } else {
            revert("Invalid difficulty level");
        }

        return (baseAmount * multiplier) / BASIS_POINTS;
    }

    /**
     * @dev Calculates reward with default multipliers
     * @param baseAmount The base reward amount
     * @param difficulty The difficulty level
     * @return The calculated reward amount
     */
    function calculateRewardWithDefaults(
        uint256 baseAmount,
        ITaskManager.Difficulty difficulty
    ) internal pure returns (uint256) {
        uint256[4] memory defaultMultipliers = [
            DEFAULT_BEGINNER_MULTIPLIER,
            DEFAULT_INTERMEDIATE_MULTIPLIER,
            DEFAULT_ADVANCED_MULTIPLIER,
            DEFAULT_EXPERT_MULTIPLIER
        ];

        return calculateReward(baseAmount, difficulty, defaultMultipliers);
    }

    /**
     * @dev Validates multiplier values
     * @param multipliers Array of multipliers to validate
     * @return True if all multipliers are valid
     */
    function validateMultipliers(
        uint256[4] memory multipliers
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < 4; i++) {
            if (multipliers[i] == 0 || multipliers[i] > 100 * BASIS_POINTS) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Calculates total rewards for multiple completions
     * @param baseAmount The base reward amount
     * @param difficulty The difficulty level
     * @param completionCount Number of completions
     * @param multipliers Array of multipliers
     * @return The total calculated reward amount
     */
    function calculateBatchReward(
        uint256 baseAmount,
        ITaskManager.Difficulty difficulty,
        uint256 completionCount,
        uint256[4] memory multipliers
    ) internal pure returns (uint256) {
        require(completionCount > 0, "Completion count must be positive");

        uint256 singleReward = calculateReward(baseAmount, difficulty, multipliers);
        return singleReward * completionCount;
    }
}

