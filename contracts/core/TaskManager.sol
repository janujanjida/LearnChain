// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/ITaskManager.sol";

/**
 * @title TaskManager
 * @notice Manages learning tasks creation, updates, and tracking
 * @dev Implements task lifecycle management with role-based access control
 */
contract TaskManager is ITaskManager, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant TASK_CREATOR_ROLE = keccak256("TASK_CREATOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    uint256 private _taskIdCounter;
    mapping(uint256 => Task) private _tasks;
    mapping(uint256 => mapping(address => bool)) private _taskCompletions;
    mapping(address => uint256[]) private _creatorTasks;
    mapping(address => uint256[]) private _learnerCompletedTasks;

    /**
     * @dev Constructor sets up initial roles
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TASK_CREATOR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @inheritdoc ITaskManager
     */
    function createTask(
        string memory metadataURI,
        RewardType rewardType,
        Difficulty difficulty,
        address verifierAddress,
        uint256 baseReward,
        uint256 maxCompletions,
        uint256 expiresAt
    ) external override onlyRole(TASK_CREATOR_ROLE) whenNotPaused returns (uint256 taskId) {
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        require(verifierAddress != address(0), "Invalid verifier address");
        require(baseReward > 0, "Base reward must be positive");
        require(maxCompletions > 0, "Max completions must be positive");
        require(expiresAt > block.timestamp, "Expiration must be in future");

        taskId = _taskIdCounter++;

        _tasks[taskId] = Task({
            taskId: taskId,
            creator: msg.sender,
            metadataURI: metadataURI,
            rewardType: rewardType,
            difficulty: difficulty,
            verifierAddress: verifierAddress,
            baseReward: baseReward,
            maxCompletions: maxCompletions,
            currentCompletions: 0,
            status: TaskStatus.ACTIVE,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });

        _creatorTasks[msg.sender].push(taskId);

        emit TaskCreated(taskId, msg.sender, difficulty, baseReward);

        return taskId;
    }

    /**
     * @inheritdoc ITaskManager
     */
    function updateTaskStatus(
        uint256 taskId,
        TaskStatus status
    ) external override {
        Task storage task = _tasks[taskId];
        require(task.creator == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Unauthorized");
        require(task.createdAt > 0, "Task does not exist");

        TaskStatus oldStatus = task.status;
        task.status = status;

        emit TaskUpdated(taskId, status);
    }

    /**
     * @dev Marks a task as completed by a learner (internal)
     * @param taskId The ID of the task
     * @param learner The address of the learner
     */
    function _markTaskCompleted(uint256 taskId, address learner) internal {
        require(!_taskCompletions[taskId][learner], "Task already completed");

        Task storage task = _tasks[taskId];
        require(task.status == TaskStatus.ACTIVE, "Task not active");
        require(task.currentCompletions < task.maxCompletions, "Max completions reached");
        require(block.timestamp <= task.expiresAt, "Task expired");

        _taskCompletions[taskId][learner] = true;
        task.currentCompletions++;
        _learnerCompletedTasks[learner].push(taskId);

        emit TaskCompleted(taskId, learner, block.timestamp);
    }

    /**
     * @dev Allows verifier role to mark task as completed
     * @param taskId The ID of the task
     * @param learner The address of the learner
     */
    function markTaskCompleted(
        uint256 taskId,
        address learner
    ) external onlyRole(VERIFIER_ROLE) {
        _markTaskCompleted(taskId, learner);
    }

    /**
     * @inheritdoc ITaskManager
     */
    function getTask(uint256 taskId) external view override returns (Task memory) {
        require(_tasks[taskId].createdAt > 0, "Task does not exist");
        return _tasks[taskId];
    }

    /**
     * @inheritdoc ITaskManager
     */
    function hasCompleted(
        uint256 taskId,
        address learner
    ) external view override returns (bool) {
        return _taskCompletions[taskId][learner];
    }

    /**
     * @inheritdoc ITaskManager
     */
    function getTotalTasks() external view override returns (uint256) {
        return _taskIdCounter;
    }

    /**
     * @dev Returns tasks created by a specific address
     * @param creator The address of the creator
     * @return Array of task IDs
     */
    function getTasksByCreator(address creator) external view returns (uint256[] memory) {
        return _creatorTasks[creator];
    }

    /**
     * @dev Returns tasks completed by a learner
     * @param learner The address of the learner
     * @return Array of task IDs
     */
    function getCompletedTasksByLearner(address learner) external view returns (uint256[] memory) {
        return _learnerCompletedTasks[learner];
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Grants task creator role to an address
     * @param account The address to grant the role
     */
    function grantTaskCreatorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(TASK_CREATOR_ROLE, account);
    }

    /**
     * @dev Grants verifier role to an address
     * @param account The address to grant the role
     */
    function grantVerifierRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, account);
    }
}

