// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITaskManager
 * @notice Interface for managing learning tasks
 * @dev Defines the structure and methods for task creation, management, and completion
 */
interface ITaskManager {
    /**
     * @dev Task difficulty levels
     */
    enum Difficulty {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }

    /**
     * @dev Task status
     */
    enum TaskStatus {
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    /**
     * @dev Reward type for task completion
     */
    enum RewardType {
        TOKEN,
        NFT,
        BOTH
    }

    /**
     * @dev Task structure
     */
    struct Task {
        uint256 taskId;
        address creator;
        string metadataURI;
        RewardType rewardType;
        Difficulty difficulty;
        address verifierAddress;
        uint256 baseReward;
        uint256 maxCompletions;
        uint256 currentCompletions;
        TaskStatus status;
        uint256 createdAt;
        uint256 expiresAt;
    }

    /**
     * @dev Emitted when a new task is created
     */
    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        Difficulty difficulty,
        uint256 baseReward
    );

    /**
     * @dev Emitted when a task is updated
     */
    event TaskUpdated(uint256 indexed taskId, TaskStatus status);

    /**
     * @dev Emitted when a task is completed by a learner
     */
    event TaskCompleted(
        uint256 indexed taskId,
        address indexed learner,
        uint256 timestamp
    );

    /**
     * @dev Creates a new learning task
     * @param metadataURI URI containing task details and requirements
     * @param rewardType Type of reward (TOKEN, NFT, or BOTH)
     * @param difficulty Difficulty level of the task
     * @param verifierAddress Address authorized to verify task completion
     * @param baseReward Base reward amount for completing the task
     * @param maxCompletions Maximum number of learners who can complete this task
     * @param expiresAt Timestamp when the task expires
     * @return taskId The ID of the newly created task
     */
    function createTask(
        string memory metadataURI,
        RewardType rewardType,
        Difficulty difficulty,
        address verifierAddress,
        uint256 baseReward,
        uint256 maxCompletions,
        uint256 expiresAt
    ) external returns (uint256 taskId);

    /**
     * @dev Updates the status of a task
     * @param taskId The ID of the task to update
     * @param status The new status
     */
    function updateTaskStatus(uint256 taskId, TaskStatus status) external;

    /**
     * @dev Retrieves task details
     * @param taskId The ID of the task
     * @return Task structure containing all task details
     */
    function getTask(uint256 taskId) external view returns (Task memory);

    /**
     * @dev Checks if a learner has completed a specific task
     * @param taskId The ID of the task
     * @param learner The address of the learner
     * @return True if the task has been completed by the learner
     */
    function hasCompleted(uint256 taskId, address learner) external view returns (bool);

    /**
     * @dev Returns the total number of tasks created
     * @return Total task count
     */
    function getTotalTasks() external view returns (uint256);
}

