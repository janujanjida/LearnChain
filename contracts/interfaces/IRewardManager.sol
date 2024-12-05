// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ITaskManager.sol";

/**
 * @title IRewardManager
 * @notice Interface for managing rewards distribution
 * @dev Handles both ERC20 token and NFT rewards
 */
interface IRewardManager {
    /**
     * @dev Reward calculation parameters
     */
    struct RewardConfig {
        uint256 baseAmount;
        uint256 beginnerMultiplier;
        uint256 intermediateMultiplier;
        uint256 advancedMultiplier;
        uint256 expertMultiplier;
        bool enabled;
    }

    /**
     * @dev Reward record structure
     */
    struct RewardRecord {
        uint256 taskId;
        address learner;
        uint256 amount;
        ITaskManager.RewardType rewardType;
        uint256 claimedAt;
        bool claimed;
    }

    /**
     * @dev Emitted when rewards are distributed
     */
    event RewardDistributed(
        uint256 indexed taskId,
        address indexed learner,
        uint256 amount,
        ITaskManager.RewardType rewardType
    );

    /**
     * @dev Emitted when rewards are claimed
     */
    event RewardClaimed(
        address indexed learner,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @dev Emitted when reward configuration is updated
     */
    event RewardConfigUpdated(
        uint256 baseAmount,
        uint256 beginnerMultiplier,
        uint256 intermediateMultiplier,
        uint256 advancedMultiplier,
        uint256 expertMultiplier
    );

    /**
     * @dev Distributes rewards to a learner
     * @param taskId The ID of the completed task
     * @param learner The address of the learner
     * @param difficulty The difficulty level of the task
     * @param rewardType The type of reward to distribute
     */
    function distributeReward(
        uint256 taskId,
        address learner,
        ITaskManager.Difficulty difficulty,
        ITaskManager.RewardType rewardType
    ) external;

    /**
     * @dev Claims accumulated rewards
     */
    function claimRewards() external;

    /**
     * @dev Calculates reward amount based on difficulty
     * @param difficulty The difficulty level
     * @return The calculated reward amount
     */
    function calculateReward(ITaskManager.Difficulty difficulty) external view returns (uint256);

    /**
     * @dev Returns pending rewards for an address
     * @param learner The address of the learner
     * @return The amount of pending rewards
     */
    function getPendingRewards(address learner) external view returns (uint256);

    /**
     * @dev Returns reward history for a learner
     * @param learner The address of the learner
     * @return Array of reward records
     */
    function getRewardHistory(address learner) external view returns (RewardRecord[] memory);

    /**
     * @dev Updates reward configuration
     * @param baseAmount New base reward amount
     * @param beginnerMultiplier Multiplier for beginner tasks (in basis points)
     * @param intermediateMultiplier Multiplier for intermediate tasks
     * @param advancedMultiplier Multiplier for advanced tasks
     * @param expertMultiplier Multiplier for expert tasks
     */
    function updateRewardConfig(
        uint256 baseAmount,
        uint256 beginnerMultiplier,
        uint256 intermediateMultiplier,
        uint256 advancedMultiplier,
        uint256 expertMultiplier
    ) external;

    /**
     * @dev Returns current reward configuration
     * @return RewardConfig structure
     */
    function getRewardConfig() external view returns (RewardConfig memory);
}

