// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ITaskManager.sol";
import "../interfaces/ILearningProof.sol";
import "../interfaces/ICredentialSBT.sol";
import "../interfaces/IRewardManager.sol";
import "../interfaces/IInstitutionRegistry.sol";

/**
 * @title LearnChainCoordinator
 * @notice Coordinates interactions between all LearnChain contracts
 * @dev Central contract for managing the complete learning workflow
 */
contract LearnChainCoordinator is Ownable, ReentrancyGuard {
    ITaskManager public taskManager;
    ILearningProof public learningProof;
    ICredentialSBT public credentialSBT;
    IRewardManager public rewardManager;
    IInstitutionRegistry public institutionRegistry;

    event WorkflowCompleted(
        uint256 indexed taskId,
        address indexed learner,
        uint256 credentialTokenId,
        uint256 rewardAmount
    );

    event ContractsUpdated(
        address taskManager,
        address learningProof,
        address credentialSBT,
        address rewardManager,
        address institutionRegistry
    );

    constructor(
        address _taskManager,
        address _learningProof,
        address _credentialSBT,
        address _rewardManager,
        address _institutionRegistry
    ) Ownable(msg.sender) {
        require(_taskManager != address(0), "Invalid TaskManager");
        require(_learningProof != address(0), "Invalid LearningProof");
        require(_credentialSBT != address(0), "Invalid CredentialSBT");
        require(_rewardManager != address(0), "Invalid RewardManager");
        require(_institutionRegistry != address(0), "Invalid InstitutionRegistry");

        taskManager = ITaskManager(_taskManager);
        learningProof = ILearningProof(_learningProof);
        credentialSBT = ICredentialSBT(_credentialSBT);
        rewardManager = IRewardManager(_rewardManager);
        institutionRegistry = IInstitutionRegistry(_institutionRegistry);
    }

    /**
     * @dev Completes the full workflow: verify proof, mint credential, distribute reward
     * @param taskId The ID of the completed task
     * @param learner The address of the learner
     * @param metadataURI URI for the credential metadata
     */
    function completeTaskWorkflow(
        uint256 taskId,
        address learner,
        string memory metadataURI
    ) external nonReentrant onlyOwner {
        require(learningProof.isProofVerified(taskId, learner), "Proof not verified");
        require(!taskManager.hasCompleted(taskId, learner), "Already completed");

        ITaskManager.Task memory task = taskManager.getTask(taskId);

        uint256 credentialTokenId = credentialSBT.mintCredential(
            learner,
            taskId,
            metadataURI
        );

        rewardManager.distributeReward(
            taskId,
            learner,
            task.difficulty,
            task.rewardType
        );

        uint256 rewardAmount = rewardManager.calculateReward(task.difficulty);

        if (institutionRegistry.isVerified(task.creator)) {
            institutionRegistry.incrementCredentialCount(task.creator);
        }

        emit WorkflowCompleted(taskId, learner, credentialTokenId, rewardAmount);
    }

    /**
     * @dev Returns learner statistics
     * @param learner The address of the learner
     * @return completedTasks Number of completed tasks
     * @return credentialsEarned Number of credentials
     * @return pendingRewards Amount of pending rewards
     */
    function getLearnerStats(
        address learner
    ) external view returns (
        uint256 completedTasks,
        uint256 credentialsEarned,
        uint256 pendingRewards
    ) {
        uint256[] memory credentials = credentialSBT.getCredentialsByLearner(learner);
        credentialsEarned = credentials.length;

        uint256[] memory tasks = taskManager.getCompletedTasksByLearner(learner);
        completedTasks = tasks.length;

        pendingRewards = rewardManager.getPendingRewards(learner);

        return (completedTasks, credentialsEarned, pendingRewards);
    }

    /**
     * @dev Returns institution statistics
     * @param institution The address of the institution
     * @return isVerified Whether the institution is verified
     * @return tasksCreated Number of tasks created
     * @return credentialsIssued Number of credentials issued
     */
    function getInstitutionStats(
        address institution
    ) external view returns (
        bool isVerified,
        uint256 tasksCreated,
        uint256 credentialsIssued
    ) {
        isVerified = institutionRegistry.isVerified(institution);

        IInstitutionRegistry.Institution memory inst = institutionRegistry.getInstitution(
            institution
        );

        tasksCreated = inst.tasksCreated;
        credentialsIssued = inst.credentialsIssued;

        return (isVerified, tasksCreated, credentialsIssued);
    }

    /**
     * @dev Updates contract addresses
     */
    function updateContracts(
        address _taskManager,
        address _learningProof,
        address _credentialSBT,
        address _rewardManager,
        address _institutionRegistry
    ) external onlyOwner {
        if (_taskManager != address(0)) taskManager = ITaskManager(_taskManager);
        if (_learningProof != address(0)) learningProof = ILearningProof(_learningProof);
        if (_credentialSBT != address(0)) credentialSBT = ICredentialSBT(_credentialSBT);
        if (_rewardManager != address(0)) rewardManager = IRewardManager(_rewardManager);
        if (_institutionRegistry != address(0)) institutionRegistry = IInstitutionRegistry(_institutionRegistry);

        emit ContractsUpdated(
            address(taskManager),
            address(learningProof),
            address(credentialSBT),
            address(rewardManager),
            address(institutionRegistry)
        );
    }
}

